#!/usr/bin/env node
'use strict';

/**
 * Script de ejemplo: vive DENTRO de la skill que lo usa
 * (front/skills/component-a11y-check/scripts/) porque hoy solo esta
 * skill lo invoca. No es una entrada del catálogo (no tiene
 * manifest.json propio) — viaja pegado a la skill.
 *
 * Uso:
 *   node check-alt-text.js --src <carpeta>
 *
 * Sale con código 1 si encuentra <img> sin atributo alt en archivos
 * .jsx/.tsx dentro de <carpeta>.
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--src') flags.src = argv[i + 1];
  }
  return flags;
}

function listSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listSourceFiles(full));
    } else if (/\.(jsx|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function findMissingAlt(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const violations = [];
  lines.forEach((line, i) => {
    const hasImgTag = /<img\b/.test(line);
    if (hasImgTag && !/\balt\s*=/.test(line)) {
      violations.push({ file: filePath, line: i + 1, text: line.trim() });
    }
  });
  return violations;
}

function main() {
  const { src } = parseArgs(process.argv.slice(2));
  if (!src) {
    console.error('Uso: node check-alt-text.js --src <carpeta>');
    process.exit(1);
  }
  if (!fs.existsSync(src)) {
    console.error(`No existe la carpeta: ${src}`);
    process.exit(1);
  }

  const files = listSourceFiles(src);
  const allViolations = files.flatMap(findMissingAlt);

  if (allViolations.length === 0) {
    console.log(`OK: ${files.length} archivo(s) revisado(s), ninguna <img> sin "alt".`);
    return;
  }

  console.error(`Se encontraron ${allViolations.length} <img> sin "alt":`);
  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}  ${v.text}`);
  }
  process.exit(1);
}

main();
