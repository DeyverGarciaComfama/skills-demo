# Catálogo canónico de códigos de error (Comfama)

Este recurso NO es una skill ni un script: es material de referencia
que varias skills de distintos dominios consultan (hoy, la skill de
backend `api-error-handling`; a futuro, posiblemente una skill de
frontend que traduzca estos códigos a mensajes de usuario).

| Código                  | Significado                          | HTTP |
| ------------------------ | ------------------------------------- | ---- |
| `VALIDATION_ERROR`       | Datos de entrada inválidos            | 400  |
| `UNAUTHENTICATED`        | Falta autenticación                   | 401  |
| `FORBIDDEN`              | Autenticado pero sin permiso          | 403  |
| `NOT_FOUND`              | Recurso inexistente                   | 404  |
| `CONFLICT`               | Conflicto de estado (ej. duplicado)   | 409  |
| `BUSINESS_RULE_VIOLATION`| Regla de negocio no cumplida          | 422  |
| `INTERNAL_ERROR`         | Error no controlado                   | 500  |

Cualquier servicio backend nuevo debe usar estos códigos antes de
inventar uno propio. Si se necesita un código nuevo, se agrega aquí
primero (PR revisado por Arquitectura), no directamente en el servicio.
