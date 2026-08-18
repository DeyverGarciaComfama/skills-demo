#!/usr/bin/env node
'use strict';

/**
 * Genera catalog.json a partir de la estructura real de carpetas del
 * repo. catalog.json NUNCA se edita a mano — se regenera con este
 * script, para que no exista una segunda fuente de verdad (versión,
 * dueño, descripción) separada de donde vive cada skill/agente/
 * script/resource.
 *
 * `type` y `domain` NUNCA se declaran a mano tampoco: se derivan de
 * la ubicación física (<dominio>/<tipo-plural>/<nombre>/manifest.json),
 * así que no pueden desincronizarse con el catálogo por definición.
 *
 * Uso:
 *   node tooling/generate-catalog.js --write   Regenera catalog.json
 *   node tooling/generate-catalog.js --check   Falla (exit 1) si catalog.json
 *                                               no coincide con lo que hay en
 *                                               disco. Pensado para correr en
 *                                               el pipeline de CI en cada PR.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NON_DOMAIN_DIRS = new Set(['cli', 'tooling', 'examples', '.git', 'node_modules']);
const TYPE_DIRS = { skills: 'skill', agents: 'agent', scripts: 'script', resources: 'resource' };

function listDirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function readEntryManifest(entryDir, relPath) {
  const manifestPath = path.join(entryDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Falta manifest.json en ${relPath} — cada skill/agent/script/resource necesita uno.`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const required of ['version', 'owner', 'description']) {
    if (!manifest[required]) {
      throw new Error(`${relPath}/manifest.json le falta el campo obligatorio "${required}".`);
    }
  }
  return manifest;
}

/**
 * "skill" y "agent" viven en el proyecto consumidor como un archivo con
 * front-matter (SKILL.md / AGENT.md) que la herramienta de codificación
 * lee directamente — el CLI solo copia/enlaza ese archivo tal cual, sin
 * tocar su contenido. Si a ese front-matter le falta "name" (o no
 * coincide con el nombre de la carpeta), la skill/agente se instala
 * pero la herramienta no la reconoce, y el fallo es silencioso: no
 * truena en ningún comando de `skills`, solo se nota al usarla. Por eso
 * se valida acá, al mismo tiempo que el resto del catálogo.
 */
const CONTENT_FILE_BY_TYPE = { skill: 'SKILL.md', agent: 'AGENT.md' };

function validateFrontmatterName(entryDir, relPath, type, name) {
  const fileName = CONTENT_FILE_BY_TYPE[type];
  if (!fileName) return; // script/resource no tienen esta convención de front-matter

  const filePath = path.join(entryDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Falta ${relPath}/${fileName}.`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`${relPath}/${fileName} no tiene front-matter ("---" ... "---") con al menos "name" y "description".`);
  }
  const nameLine = match[1].split(/\r?\n/).find((l) => /^name:\s*/.test(l));
  const frontmatterName = nameLine ? nameLine.replace(/^name:\s*/, '').trim() : null;
  if (!frontmatterName) {
    throw new Error(
      `${relPath}/${fileName} le falta "name" en el front-matter — sin eso, la herramienta de codificación instala el archivo pero no reconoce la skill/agente (falla silenciosa).`
    );
  }
  if (frontmatterName !== name) {
    throw new Error(
      `${relPath}/${fileName}: el "name" del front-matter ("${frontmatterName}") no coincide con el nombre de la carpeta ("${name}").`
    );
  }
}

function build() {
  const entries = [];
  const domains = listDirs(ROOT).filter((d) => !NON_DOMAIN_DIRS.has(d));

  for (const domain of domains.sort()) {
    for (const [typeDir, type] of Object.entries(TYPE_DIRS)) {
      const typePath = path.join(ROOT, domain, typeDir);
      for (const name of listDirs(typePath).sort()) {
        const relPath = `${domain}/${typeDir}/${name}`;
        const entryDir = path.join(ROOT, relPath);
        const manifest = readEntryManifest(entryDir, relPath);
        validateFrontmatterName(entryDir, relPath, type, name);

        entries.push({
          type,
          name,
          domain,
          path: relPath,
          version: manifest.version,
          owner: manifest.owner,
          description: manifest.description,
          tags: manifest.tags || [],
          ...(manifest.dependsOn && manifest.dependsOn.length ? { dependsOn: manifest.dependsOn } : {}),
        });
      }
    }
  }

  // Nombres únicos DENTRO de cada tipo (entre tipos distintos sí se
  // permite repetir, el CLI desambigua con el prefijo "tipo:nombre").
  const seenByType = {};
  for (const e of entries) {
    seenByType[e.type] = seenByType[e.type] || new Set();
    if (seenByType[e.type].has(e.name)) {
      throw new Error(`Nombre duplicado dentro del tipo "${e.type}": "${e.name}" (${e.path}).`);
    }
    seenByType[e.type].add(e.name);
  }

  return {
    name: 'comfama-skills',
    description:
      'Catálogo privado de skills, agentes, scripts y recursos de IA de Comfama. GENERADO AUTOMÁTICAMENTE — no editar a mano, ver tooling/generate-catalog.js.',
    owner: { team: 'Plataforma / DevEx', contact: 'devex@comfama.com.co' },
    schemaVersion: '3.0',
    types: ['skill', 'agent', 'script', 'resource'],
    entries,
  };
}

function main() {
  const mode = process.argv[2];
  const catalogPath = path.join(ROOT, 'catalog.json');
  const data = build();
  const generated = JSON.stringify(data, null, 2) + '\n';

  if (mode === '--check') {
    const current = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf8') : '';
    if (current !== generated) {
      console.error('catalog.json está DESACTUALIZADO respecto a las carpetas del repo.');
      console.error('Corre "node tooling/generate-catalog.js --write" y commitea el resultado.');
      process.exit(1);
    }
    console.log(`catalog.json está al día (${data.entries.length} entradas).`);
    return;
  }

  fs.writeFileSync(catalogPath, generated);
  console.log(`catalog.json regenerado: ${data.entries.length} entradas.`);
}

main();
