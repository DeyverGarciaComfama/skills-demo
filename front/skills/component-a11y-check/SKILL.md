---
name: component-a11y-check
description: Genera componentes React accesibles y valida con un script propio que las imágenes no queden sin texto alternativo.
---

# Accesibilidad básica de componentes (Comfama)

Ejemplo de referencia: esta skill trae su propio script de validación
en `scripts/check-alt-text.js`, porque hoy solo la usa esta skill (ver
regla de ubicación en el README raíz del repo — "si un script solo lo
usa UNA skill, va dentro de la carpeta de esa skill"). Por eso no tiene
entrada propia en `catalog.json` ni `dependsOn`: viaja pegado a la
skill automáticamente cuando el CLI la instala (copia o symlink de la
carpeta completa).

Cuando generes o modifiques un componente React que renderice imágenes:

1. Toda etiqueta `<img>` debe llevar `alt` explícito. Si la imagen es
   puramente decorativa, usa `alt=""` (no lo omitas).
2. Los botones que solo contienen un ícono (sin texto visible) deben
   llevar `aria-label` describiendo la acción.
3. Después de generar o modificar los archivos, corre el script
   incluido en esta skill para detectar `<img>` sin `alt` antes de
   darte por terminado:

   ```bash
   node scripts/check-alt-text.js --src <carpeta-del-componente>
   ```

   La ruta `scripts/check-alt-text.js` es relativa a esta misma carpeta
   de skill (`.claude/skills/component-a11y-check/scripts/...` una vez
   instalada). Sale con código 1 y lista los archivos/línea afectados
   si encuentra alguno.
4. Si el script reporta violaciones, corrígelas y vuelve a correrlo
   antes de continuar.

Al terminar, confirma en una línea que el script no reportó
violaciones (o que las corregiste todas).
