---
name: react-component-pattern
description: Genera componentes React siguiendo los estándares internos y la librería de componentes de Comfama.
---

# React component pattern (Comfama)

Cuando generes o modifiques un componente React para Comfama:

1. Usa TypeScript y componentes funcionales con hooks. No generes componentes de clase.
2. Reutiliza siempre los componentes base de la librería interna `@comfama/ui` (botones, inputs, layout, tipografía) antes de escribir HTML/CSS desde cero.
3. Sigue la convención de carpetas: `ComponentName/ComponentName.tsx`, `ComponentName.test.tsx`, `ComponentName.stories.tsx` (si aplica), `index.ts` como barrel export.
4. Tipa explícitamente las props con una interfaz `ComponentNameProps`, nunca `any`.
5. Aplica el sistema de diseño (tokens de color/espaciado) definido en `@comfama/ui/tokens`; evita valores mágicos en CSS.
6. Si el componente maneja estado de formulario, usa el patrón interno de validación (ver skill `libui-component-usage` para el detalle de props de formularios).
7. Incluye siempre un test mínimo de render y un test de interacción principal (click, submit, etc.).
8. ejemplo 2

Al terminar, resume en 2-3 líneas qué componente de `@comfama/ui` reutilizaste y por qué, para que el reviewer lo valide rápido.
