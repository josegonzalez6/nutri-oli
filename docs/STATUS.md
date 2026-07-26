# Status

## Fase actual

Fase 2 - Clientes + agenda persistente con Supabase.

## Trabajo completado

- Repositorio inspeccionado en rama `chore/project-foundation`.
- Remote `origin`: `https://github.com/josegonzalez6/nutri-oli.git`.
- Entorno auditado: Node 24.16.0, npm 11.13.0, Corepack 0.35.0, pnpm 11.17.0 via `corepack pnpm`, Docker 29.6.2, Supabase CLI 2.109.1, gh 2.95.0.
- Next.js, TypeScript estricto, Tailwind, next-intl, Supabase SSR, Vitest y Playwright configurados.
- Supabase local inicializado con migracion nucleo, RLS, buckets privados y seed ficticio minimo.
- Documentacion inicial obligatoria creada.
- Backlog por fases documentado en `docs/BACKLOG.md`.
- CI de pull request/main configurado en `.github/workflows/ci.yml` con orden de Corepack corregido para cache pnpm.
- Accesibilidad smoke validada con axe en Playwright.
- Auditoria de dependencias sin vulnerabilidades conocidas tras overrides documentados en `pnpm-workspace.yaml`.
- Rama `main` inicializada con commit base vacío para permitir PR.
- Rama `chore/project-foundation` publicada en `origin`.
- Pull request abierta: `https://github.com/josegonzalez6/nutri-oli/pull/1`.
- 9 milestones y 32 issues de backlog creados en GitHub.
- Dependabot configurado para npm y GitHub Actions.
- GitHub security: secret scanning, push protection y Dependabot security updates activados.
- GitHub repository: borrado automatico de ramas tras merge activado.
- GitHub `main`: proteccion activada con checks `web` y `database`, historial lineal, sin force-push/deletion y 1 review requerida.
- Base BEDCA localizada en `/Users/josegonzalez/Documents/Proyectos/NUTRI/data/bedca.xlsx`.
- Importador BEDCA creado con validacion de columnas, normalizacion de busqueda y proteccion ante formulas de hoja de calculo.
- Catalogo local generado en `data/generated/bedca-foods.json` (ignorado por Git): 957 alimentos validos de 969 filas leidas; 12 filas omitidas por campos obligatorios incompletos.
- Esquema Supabase de alimentos creado: `food_sources`, `nutrients`, `foods`, `food_nutrients`, `food_synonyms`.
- RLS de alimentos aplicada para lectura publica solo de alimentos globales verificados y acceso por organizacion para alimentos privados.
- Pantalla profesional `/es/profesional/alimentos` implementada con busqueda, filtro por categoria y tabla nutricional.
- Prompts maestro y benchmark funcional leidos completos y usados como especificacion permanente del proyecto.
- Benchmark competitivo documentado con fuentes oficiales publicas revisadas el 2026-07-26: Nutrium, ICNS, DietoPro, Nutriplo, Sabea, dietetic.app, i-Diet y MiNutriApp.
- Documentos funcionales creados: `docs/COMPETITOR_BENCHMARK.md`, `docs/FEATURE_MATRIX.md`, `docs/PRODUCT_GAPS.md`, `docs/NUTRI_OLI_FUNCTIONAL_SCOPE.md`, `docs/USER_FLOWS.md`, `docs/CLINICAL_SAFETY_RULES.md` y `docs/LEGAL_REVIEW_REQUIRED.md`.
- Backlog actualizado con prioridades `MUST`, `SHOULD`, `COULD` y `WON'T NOW` derivadas del benchmark.
- Dashboard profesional convertido en centro operativo con agenda demo, cola de atencion, clientes en seguimiento y consulta guiada.
- Revision independiente del PR #1 documentada en `docs/pr-1-review/REVIEW.md`.
- Capturas responsive de dashboard generadas en `docs/pr-1-review/`.
- Login corregido: ya no muestra boton submit ni formulario sin accion persistente.
- Playwright e2e corregido para ejecutar contra `next start` tras build.
- PR #1 no se pudo fusionar desde Codex porque GitHub exige 1 approving review con permisos de escritura.
- Rama `feat/persistent-clients-agenda` creada sobre `chore/project-foundation`.
- Dashboard profesional `/es/profesional` conectado a Supabase; sin fixtures de produccion.
- CRUD real de clientes en `/es/profesional/clientes` con Server Actions, validacion Zod, auditoria y estados loading/empty/error/configuracion pendiente.
- Agenda real en `/es/profesional/agenda` con servicios configurables, disponibilidad profesional, citas, estados de cita e historial de cambios.
- Migracion `202607260001_clients_agenda_persistence.sql` creada con `professional_availability`, `availability_exceptions`, `appointment_status_history`, grants explicitos, policies RLS y constraint anti-solape `appointments_no_professional_overlap`.
- Seed ficticio de desarrollo/test ampliado con usuario demo, profesional demo, clientes demo, servicios, disponibilidad y citas. No contiene datos reales de pacientes.
- CI web actualizado para ejecutar E2E contra Supabase local configurado con los IDs ficticios de seed.

## Trabajo pendiente

- Validacion clinica, ISAK y juridica por profesionales humanos antes de produccion.
- Revision de licencia BEDCA antes de distribuir datos o usarlos en produccion.
- Autenticacion real y sesion de usuario siguen pendientes; las variables server-only seleccionan workspace demo/local para la vertical actual.
- El portal cliente, planes, mensajes y documentos siguen siendo demo/no persistentes.
- CI remoto de la nueva PR debe pasar tras publicar la rama.

## Bloqueos

- PR #1 esta bloqueado por regla de rama: GitHub requiere 1 approving review de un usuario con permisos de escritura antes del squash merge.

## Riesgos

- Aplicacion sanitaria: no afirmar cumplimiento legal ni suficiencia clinica sin revision externa.
- El catalogo alimentario no sustituye validacion clinica ni revision dietetica humana.
- BEDCA esta disponible solo como import local; el XLSX y el JSON generado no se versionan.
- Las funciones de competidores estan documentadas como evidencia publica anunciada/observada, no como verificacion tecnica interna.
- IA, pagos, facturacion, vademecum farmaco-nutriente, apps nativas y colectividades quedan fuera del MVP.
- Dashboard, clientes y agenda ya leen/escriben Supabase en esta rama; portal, planes, mensajes y documentos siguen siendo demo/no persistentes.
- El acceso applicativo actual usa configuracion server-only de workspace profesional; RLS esta implementado y probado en SQL, pero falta conectar Auth real a las queries de usuario final.
- `psql` no esta instalado fuera de Supabase CLI.
- `supabase db lint` sobre todos los schemas incluye avisos de la extension pgTAP; lint limitado a `public,private` pasa sin errores.

## Ultimo commit

- Cambios locales de `feat/persistent-clients-agenda` pendientes de commits pequeños.

## Ultimos comandos de validacion ejecutados

- `corepack pnpm format:check`: PASS.
- `corepack pnpm lint`: PASS.
- `corepack pnpm typecheck`: PASS.
- `corepack pnpm test`: PASS, 4 archivos y 14 tests.
- `corepack pnpm build`: PASS, rutas dinamicas `/[locale]/profesional`, `/[locale]/profesional/agenda`, `/[locale]/profesional/clientes`.
- `supabase db reset`: PASS con migraciones `202607250001_foundation.sql`, `202607250002_foods_foundation.sql` y `202607260001_clients_agenda_persistence.sql`.
- `corepack pnpm bedca:import /Users/josegonzalez/Documents/Proyectos/NUTRI/data/bedca.xlsx --database-url=<local Supabase DB_URL>`: PASS, 957 alimentos importados localmente.
- `supabase test db`: PASS, 2 archivos y 30 tests.
- `supabase db lint --schema public,private --fail-on error`: PASS.
- `corepack pnpm test:e2e`: PASS, 14 tests en Chromium y mobile con axe; valida CRUD cliente y cita persistente.
- `corepack pnpm audit --audit-level moderate`: PASS, sin vulnerabilidades conocidas.
- Secret scan rapido con `rg`: sin secretos reales; solo referencia `env(OPENAI_API_KEY)` en config local Supabase Studio.

## Proxima accion automatica

- Hacer commit/push de `feat/persistent-clients-agenda` y abrir PR apilada sobre `chore/project-foundation` mientras PR #1 siga bloqueada.
