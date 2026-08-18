# `generate-catalog.js`

Genera `catalog.json` a partir de las carpetas del repo. **`catalog.json` nunca se edita a mano.**

## Uso

```bash
node tooling/generate-catalog.js --write   # regenera catalog.json y lo escribe en disco
node tooling/generate-catalog.js --check   # no escribe nada; exit 1 si catalog.json está desactualizado (para CI)
```

## `manifest.json` (por cada skill/agent/script/resource)

Cada entrada vive en `<dominio>/<tipo-plural>/<nombre>/manifest.json` y define su versión y metadata:

```json
{
  "version": "1.0.0",
  "owner": "Equipo Backend",
  "description": "Qué hace esta skill/agent/script/resource, en una línea.",
  "tags": ["backend", "api"],
  "dependsOn": ["resource:error-catalog"]
}
```

- `version`, `owner`, `description`: obligatorios.
- `tags`, `dependsOn`: opcionales.
- `name` y `domain` no van aquí — se derivan de la ruta de la carpeta.

### Cómo funciona `dependsOn`

Es la lista de otras entradas del catálogo que se instalan junto con esta cuando el CLI la instala (por ejemplo, una skill que necesita un recurso de referencia para funcionar).

Cada elemento es un string `"tipo:nombre"`, donde `tipo` es uno de `skill|agent|script|resource` y `nombre` es el nombre de la carpeta de esa entrada (no la ruta completa, no el dominio):

```json
{
  "version": "1.0.0",
  "owner": "Equipo Backend",
  "description": "Maneja errores de API siguiendo el catálogo de códigos.",
  "dependsOn": ["resource:error-catalog", "script:error-codes-lint"]
}
```

`"resource:error-catalog"` le dice al CLI: "cuando instales esta skill, instala también la entrada de tipo `resource` que se llama `error-catalog`", sin importar en qué dominio viva. Por eso se usa el prefijo `tipo:` — el mismo `nombre` puede repetirse en tipos distintos, y sin el prefijo sería ambiguo.

El script **no valida** que esas referencias existan en el catálogo (no verifica que `error-catalog` exista de verdad) — solo copia el array tal cual del `manifest.json` a `catalog.json`. Si escribes mal el nombre o el tipo, el error solo aparece al instalar con el CLI, no al generar el catálogo.

## `catalog.json` (generado)

```json
{
  "name": "comfama-skills",
  "schemaVersion": "3.0",
  "types": ["skill", "agent", "script", "resource"],
  "entries": [
    {
      "type": "skill",
      "name": "api-error-handling",
      "domain": "back",
      "path": "back/skills/api-error-handling",
      "version": "1.0.0",
      "owner": "Equipo Backend",
      "description": "...",
      "tags": ["backend", "errores", "api"],
      "dependsOn": ["resource:error-catalog"]
    }
  ]
}
```

Es la suma de todos los `manifest.json` del repo, uno por entrada.
