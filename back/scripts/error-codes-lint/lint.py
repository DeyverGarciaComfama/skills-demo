#!/usr/bin/env python3
"""
Valida que los códigos de error usados en el código fuente de un
servicio backend existan en el catálogo canónico de Comfama.

Ejemplo de ejecución real, ver README.md de esta carpeta.
"""
import argparse
import re
import sys
from pathlib import Path

CODE_PATTERN = re.compile(r'\b([A-Z][A-Z0-9_]{3,})\b')


def load_catalog_codes(catalog_path: Path) -> set:
    text = catalog_path.read_text(encoding="utf-8")
    return set(re.findall(r'`([A-Z][A-Z0-9_]{3,})`', text))


def scan_source(src_dir: Path) -> set:
    found = set()
    for path in src_dir.rglob("*"):
        if path.is_file() and path.suffix in {".java", ".cs", ".py", ".ts", ".js"}:
            text = path.read_text(encoding="utf-8", errors="ignore")
            found.update(CODE_PATTERN.findall(text))
    return found


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--src", required=True)
    parser.add_argument("--catalog", required=True)
    args = parser.parse_args()

    known = load_catalog_codes(Path(args.catalog))
    used = scan_source(Path(args.src))

    # Solo nos importan los que PARECEN códigos de error (mayúsculas,
    # guion bajo) y no están en el catálogo. Esto es una heurística de
    # ejemplo, no un linter de producción.
    plausible_error_like = {c for c in used if "ERROR" in c or c in known}
    unknown = plausible_error_like - known

    if unknown:
        print("Códigos de error no encontrados en el catálogo:")
        for code in sorted(unknown):
            print(f"  - {code}")
        sys.exit(1)

    print("OK: todos los códigos de error usados están en el catálogo.")


if __name__ == "__main__":
    main()
