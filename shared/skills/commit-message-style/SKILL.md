---
name: commit-message-style
description: Aplica el formato estándar de mensajes de commit de Comfama, sin importar el dominio (front, back, datos, infraestructura...).
---

# Formato de mensajes de commit (Comfama)

Esta skill no es de un dominio específico: aplica igual si el cambio es
de front, back, tests o infraestructura.

Formato: `<tipo>(<alcance opcional>): <resumen en imperativo, minúsculas, sin punto final>`

Tipos permitidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`.

Reglas:
1. El resumen no debe superar 72 caracteres.
2. Si el cambio necesita explicación adicional, agrégala en el cuerpo del
   commit (línea en blanco después del resumen), no la metas en el
   resumen mismo.
3. Si el commit cierra o referencia un ticket, agrégalo al final del
   cuerpo como `Refs: <id-del-ticket>`, nunca en el resumen.
4. No mezcles cambios de dominios distintos (front + back) en un mismo
   commit salvo que sea estrictamente un solo cambio atómico.
