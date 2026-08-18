# error-codes-lint

Script independiente (no es una skill: no lleva instrucciones para un
agente, es una herramienta que se ejecuta directamente) que valida que
un servicio backend solo use códigos de error del catálogo canónico
(`resources/compartidas/error-catalog`).

Deliberadamente escrito en Python, no en Node — un script no tiene que
estar en el mismo lenguaje que el CLI de distribución. El CLI solo copia
archivos; no importa qué lenguaje corran.

## Uso

```bash
python3 lint.py --src ./src --catalog <ruta-al-error-catalog.md>
```

Sale con código 1 si encuentra un código de error en el código fuente
que no esté en el catálogo.
