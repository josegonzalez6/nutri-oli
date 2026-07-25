# Status

## Fase actual

Fase 2 - Catalogo alimentario operativo local.

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

## Trabajo pendiente

- Validacion clinica, ISAK y juridica por profesionales humanos antes de produccion.
- Revision de licencia BEDCA antes de distribuir datos o usarlos en produccion.
- CI remoto de la PR debe volver a pasar tras los commits de catalogo alimentario.

## Bloqueos

- No se han recibido capturas en el repositorio local; se construye identidad original segun especificacion.

## Riesgos

- Aplicacion sanitaria: no afirmar cumplimiento legal ni suficiencia clinica sin revision externa.
- El catalogo alimentario no sustituye validacion clinica ni revision dietetica humana.
- BEDCA esta disponible solo como import local; el XLSX y el JSON generado no se versionan.
- `psql` no esta instalado fuera de Supabase CLI.
- `supabase db lint` sobre todos los schemas incluye avisos de la extension pgTAP; lint limitado a `public,private` pasa sin errores.

## Ultimo commit

- `HEAD` - pendiente de commit local BEDCA/catalogo.

## Ultimos comandos de validacion ejecutados

- `corepack pnpm format:check`: PASS.
- `corepack pnpm lint`: PASS.
- `corepack pnpm typecheck`: PASS.
- `corepack pnpm test`: PASS, 3 archivos y 12 tests.
- `corepack pnpm build`: PASS, rutas `/es`, `/ca`, `/login`, `/portal`, `/profesional`, `/profesional/alimentos`.
- `supabase db reset`: PASS con migracion `202607250002_foods_foundation.sql`.
- `corepack pnpm bedca:import /Users/josegonzalez/Documents/Proyectos/NUTRI/data/bedca.xlsx --database-url=<local Supabase DB_URL>`: PASS, 957 alimentos importados localmente.
- `supabase test db`: PASS, 1 archivo y 16 tests.
- `supabase db lint --schema public,private --fail-on error`: PASS.
- `corepack pnpm test:e2e`: PASS, 6 tests con axe.
- `corepack pnpm audit --audit-level moderate`: PASS, sin vulnerabilidades conocidas.
- Secret scan rapido con `rg`: sin secretos reales; solo referencia `env(OPENAI_API_KEY)` en config local Supabase Studio.

## Proxima accion automatica

- Publicar commits pequenos en la PR existente y revisar CI remoto.
