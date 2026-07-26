# PR #1 Independent Review

Fecha de revision: 2026-07-26.

PR: https://github.com/josegonzalez6/nutri-oli/pull/1

## Resultado

Estado tras correcciones: apto para fusionar como fundacion del proyecto, con alcance demo claramente delimitado.

## Hallazgos corregidos

- Login mostraba un formulario con boton submit sin accion real. Corregido: `/es/login` ahora muestra un estado explicito de acceso pendiente de conectar a Supabase Auth y no contiene botones de aplicacion.
- Playwright ejecutaba e2e con `next dev`, que inyecta controles de desarrollo y era menos estable para revision. Corregido: por defecto usa `next start` contra build de produccion.
- Dashboard tenia overflow horizontal de pagina en captura movil por la tabla de agenda. Corregido con `min-w-0` en contenedores grid/card; la tabla queda como region desplazable etiquetada.
- `PROMPT_MASTER_CODEX_NUTRI_OLI.md` tenia trailing whitespace en el diff. Corregido mecanicamente sin cambiar el contenido.

## Origen de datos

| Componente                  | Origen de datos actual                                                                            | Persistencia         | Estado     |
| --------------------------- | ------------------------------------------------------------------------------------------------- | -------------------- | ---------- |
| `/es/profesional` dashboard | Fixtures hardcodeados en `src/features/dashboard/operational-data.ts`                             | No persiste          | Demo       |
| `/es/profesional/alimentos` | Lee `data/generated/bedca-foods.json` local e ignorado por Git; fallback hardcodeado si no existe | No persiste desde UI | Demo/local |
| `/es/portal`                | Valores hardcodeados de encuadre                                                                  | No persiste          | Demo       |
| `/es/login`                 | Estado informativo                                                                                | No autentica         | Pendiente  |
| Supabase seed               | Organizacion, servicios y flags ficticios                                                         | Solo desarrollo/test | Seed demo  |

No hay lectura real desde Supabase en el dashboard de PR #1. La conexion a Supabase esta preparada, pero la persistencia de clientes y agenda queda para la siguiente vertical.

## Componentes todavia demo

- Dashboard profesional: agenda, cola de atencion, clientes en seguimiento y consulta guiada son fixtures.
- Portal cliente: resumen y tareas son contenido de encuadre.
- Catalogo de alimentos: funcional como explorador local, pero no escribe datos desde UI.
- Login/Auth: pendiente de implementar flujo real.
- Acciones de crear/editar/publicar: no existen botones ni mutaciones en esta PR.

## Seguridad y datos sensibles

- No se han encontrado secretos reales, credenciales reales, `.env`, datos reales de pacientes ni volcados.
- `data/generated/bedca-foods.json` existe solo localmente y esta ignorado por Git.
- `.env.example` contiene placeholders, no secretos.
- Supabase local usa seeds ficticios.
- RLS base y food catalog RLS tienen pruebas pgTAP.
- Buckets Supabase definidos como privados.

## Estados revisados

- Loading: `src/app/[locale]/loading.tsx`.
- Error: `src/app/[locale]/error.tsx`.
- Permission/pending: `/es/login` con `StatePanel`.
- Empty: buscador de alimentos muestra vacio cuando no hay coincidencias; fallback demo si no hay indice BEDCA.
- Permission denied real por sesion/RLS: pendiente de la vertical persistente con Auth.

## Responsive y accesibilidad

Capturas generadas:

- Mobile: `docs/pr-1-review/dashboard-mobile.png`
- Tablet: `docs/pr-1-review/dashboard-tablet.png`
- Desktop: `docs/pr-1-review/dashboard-desktop.png`

Revisado:

- Mobile, tablet y escritorio sin overflow de pagina tras correccion.
- Navegacion principal enfocable y activable con teclado.
- Axe ejecutado en e2e para dashboard profesional, portal cliente, login y catalogo de alimentos.

## Validacion ejecutada

- `corepack pnpm format:check`: PASS.
- `corepack pnpm lint`: PASS.
- `corepack pnpm typecheck`: PASS.
- `corepack pnpm test`: PASS, 4 archivos y 15 tests.
- `supabase test db`: PASS, 1 archivo y 16 tests.
- `supabase db lint --schema public,private --fail-on error`: PASS.
- `corepack pnpm build`: PASS.
- `corepack pnpm test:e2e`: PASS, 10 tests con axe.
- `corepack pnpm audit --audit-level moderate`: PASS.
- Secret scan rapido con `rg`: sin secretos reales; solo placeholders/env docs.

## Riesgos aceptados para fusionar

- Dashboard y portal son demo; no deben presentarse como persistentes.
- Auth real, CRUD clientes, CRUD agenda, disponibilidad, historial y auditoria de mutaciones quedan para el siguiente PR.
- BEDCA requiere revision de licencia antes de produccion o distribucion de datos.
- Validacion clinica, ISAK y juridica siguen pendientes antes de produccion.
