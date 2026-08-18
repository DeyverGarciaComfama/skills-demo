---
name: api-error-handling
description: Aplica el patrón estándar de manejo de errores y respuestas HTTP en servicios backend (Java, .NET, Python).
---

# Manejo de errores en APIs (Comfama)

Esta skill es agnóstica de lenguaje: aplica los mismos principios en Java (Spring), .NET y Python (FastAPI/Django), adaptando la sintaxis al stack del proyecto detectado.

1. Nunca dejes que una excepción interna llegue cruda al cliente. Captura y traduce a un modelo de error estándar:
   `{ "code": "string", "message": "string", "traceId": "string", "details": [] }`.
2. Usa los códigos HTTP correctos: 400 para validación, 401/403 para auth, 404 para recursos inexistentes, 409 para conflictos, 422 para reglas de negocio, 500 solo para errores no controlados.
3. Todo error 5xx debe loguearse con nivel ERROR e incluir el `traceId` de correlación (usa el header `X-Trace-Id` si existe, o genera uno).
4. No expongas stack traces, nombres de tablas, ni mensajes de excepciones de librerías externas en la respuesta al cliente.
5. Centraliza la traducción de errores en un único punto (middleware / exception handler / filtro), no repitas try/catch de traducción en cada endpoint.
6. Si el proyecto es Java/Spring: usa `@ControllerAdvice` + `@ExceptionHandler`. Si es .NET: middleware de excepciones global. Si es Python/FastAPI: `exception_handler`.

Antes de cerrar, verifica que los mensajes de error orientados al usuario estén en español neutro y no filtren información sensible.
