# Status

## Fase actual

Fase 6 parcial - Flujo antropometrico con mediciones repetidas, apilado sobre PR #41 mientras PR #1/#40 siguen pendientes de integracion humana.

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
- Pull request apilada abierta: `https://github.com/josegonzalez6/nutri-oli/pull/40`.
- Dashboard profesional `/es/profesional` conectado a Supabase; sin fixtures de produccion.
- CRUD real de clientes en `/es/profesional/clientes` con Server Actions, validacion Zod, auditoria y estados loading/empty/error/configuracion pendiente.
- Agenda real en `/es/profesional/agenda` con servicios configurables, disponibilidad profesional, citas, estados de cita e historial de cambios.
- Migracion `202607260001_clients_agenda_persistence.sql` creada con `professional_availability`, `availability_exceptions`, `appointment_status_history`, grants explicitos, policies RLS y constraint anti-solape `appointments_no_professional_overlap`.
- Seed ficticio de desarrollo/test ampliado con usuario demo, profesional demo, clientes demo, servicios, disponibilidad y citas. No contiene datos reales de pacientes.
- CI web actualizado para ejecutar E2E contra Supabase local configurado con los IDs ficticios de seed.
- `PROMPT_MAESTRO_FINAL_NUTRI_OLI_CODEX.md` leido completo el 2026-07-26 y adoptado como especificacion principal consolidada.
- PR #1 inspeccionada de nuevo el 2026-07-26: base `main`, head `chore/project-foundation`, mergeable, checks `web`/`database` verdes, `reviewDecision=REVIEW_REQUIRED`, sin reviews.
- PR #40 inspeccionada de nuevo el 2026-07-26: base `chore/project-foundation`, head `feat/persistent-clients-agenda`, mergeable, checks `web`/`database` verdes.
- PRs Dependabot #34-#39 existen contra `chore/project-foundation`; quedan dependientes de la normalizacion de PR #1.
- Intento de squash merge de PR #1: bloqueado por politica de rama.
- Intento de auto-merge de PR #1: bloqueado porque auto-merge no esta habilitado en el repositorio.
- Agentes paralelos lanzados para revision tecnica/producto y seguridad/RLS de la integracion actual.
- Revision tecnica/producto y revision de seguridad/RLS completadas; ambas recomiendan no abrir nuevas verticales hasta normalizar PR #1/#40.
- Migracion `202607260002_integrity_and_rls_hardening.sql` creada para reforzar integridad multi-organizacion, RLS de clientes por asignacion, mutaciones cross-org denegadas y Storage path parsing seguro.
- Rama `feat/clinical-workflow-foundation` creada sobre `feat/persistent-clients-agenda` por bloqueo humano de PR #1.
- Layout profesional redisenado con sidebar, acciones rapidas, breadcrumbs, buscador global y navegacion limitada a modulos con superficie util.
- Auth real iniciada con Supabase Auth para login/logout y middleware server-side; el bypass de identidad solo queda permitido con `NUTRI_OLI_ALLOW_DEV_AUTH_BYPASS=true` en desarrollo/test.
- Repositorio server-side conectado a contexto de sesion profesional mediante `auth.getUser()` cuando Supabase Auth esta configurado; las queries de negocio ejecutan transacciones como rol `authenticated` con claim `sub` para ejercer RLS.
- Ficha clinica persistente creada en `/es/profesional/clientes/[id]` con cabecera profesional, resumen, historia clinica/nutricional, consultas, antropometria y timeline.
- Migracion `202607260003_clinical_workflow_foundation.sql` creada con `clinical_intake_templates`, `clinical_intake_responses`, `consultations`, `consultation_addenda` y `anthropometry_sessions`.
- RLS clinico aplicado: owner/nutritionist asignado accede; assistant no puede leer anamnesis/consultas/antropometria; finalized consultations son inmutables y solo admiten addenda.
- Anamnesis persistente implementada como borrador versionable inicial con campos declarados y nota profesional.
- Consulta persistente implementada con borrador/finalizado, ADIME/PES opcional, nota privada, resumen compartido y auditoria.
- Antropometria persistente implementada con masa, talla, cintura, cadera, pliegues iniciales, protocolo, instrumento/calibracion y calculos basicos generados por SQL: IMC, cintura/talla y sumatorio de pliegues.
- Timeline de cliente muestra citas, anamnesis, consultas y sesiones antropometricas persistentes.
- E2E valida abrir cliente persistente, guardar anamnesis, recargar, guardar consulta, recargar, guardar antropometria, recargar y comprobar calculos basicos.
- PR #41 inspeccionada el 2026-07-26: base `feat/persistent-clients-agenda`, head `feat/clinical-workflow-foundation`, checks `web` y `database` verdes tras normalizar export de variables Supabase en CI.
- Rama `feat/anthropometry-measurement-workflow` creada sobre `feat/clinical-workflow-foundation` por bloqueo de integracion de PR #1/#40/#41.
- Documentacion de evidencia y arquitectura antropometrica creada: `docs/ANTHROPOMETRY_EVIDENCE_REGISTER.md`, `docs/ANTHROPOMETRY_MEASUREMENT_CATALOG.md`, `docs/ANTHROPOMETRY_EQUATION_CATALOG.md`, `docs/ISAK_WORKFLOW_SPEC.md`, `docs/BODY_COMPOSITION_LIMITATIONS.md`, `docs/ENERGY_EQUATION_CATALOG.md`, `docs/EXCHANGE_SYSTEM_SPEC.md`, `docs/MACRO_PORTION_SYSTEM_SPEC.md` y `docs/CLINICAL_CALCULATION_VALIDATION.md`.
- Migracion `202607260004_anthropometry_measurement_workflow.sql` creada con protocolos, perfiles, catalogo de medidas, tolerancias versionadas, mediciones por sesion, catalogo de ecuaciones, RLS, constraints cross-org/consulta y bloqueo de sesiones cerradas.
- Sumatorio SQL de pliegues corregido: devuelve `null` si faltan pliegues requeridos; ya no convierte datos ausentes en cero.
- Motor tipado de mediciones antropometricas creado con parseo seguro de coma/punto, diferencia absoluta/relativa, tolerancia, tercera medicion, mediana provisional, warnings de plausibilidad e indices simples con `No calculable`.
- Interfaz profesional de antropometria redisenada en la ficha de cliente: perfil compatible ISAK, secciones plegables, primera/segunda/tercera toma, icono de informacion por medida, resumen lateral, comparativa con sesion anterior, guardado persistente y visibilidad cliente inicial.
- Ecuaciones predictivas avanzadas quedan catalogadas pero deshabilitadas hasta transcripcion, unidades, poblacion, tests numericos y validacion clinica humana.
- Tests unitarios ampliados para tolerancias, tercera medicion, redondeo, parseo seguro, IMC/cintura-talla y ausencia de ceros inventados.
- Tests SQL/RLS ampliados para tablas antropometricas, assistant denied, inmutabilidad de sesion completada y sumatorios no calculables.
- E2E completo valida login real, ficha de cliente, ayuda de medida, discrepancia, tercera toma, guardado, recarga, persistencia y axe en escritorio/movil.

## Trabajo pendiente

- Validacion clinica, ISAK y juridica por profesionales humanos antes de produccion.
- Revision de licencia BEDCA antes de distribuir datos o usarlos en produccion.
- Completar Auth real: invitaciones, recuperacion, verificacion, MFA profesional, revocacion, proteccion estricta por rol y portal cliente autenticado.
- El portal cliente, planes, recetas, equivalencias, mensajes, documentos, consentimientos, notificaciones y PDFs siguen sin vertical persistente operativa.
- Completar antropometria con TEM, addenda UI, resultados longitudinales avanzados, graficos, PDF, publicacion granular al cliente y ecuaciones predictivas verificadas.
- Convertir anamnesis en plantillas editables/enviables al portal con versionado completo.
- Convertir consultas finalizadas en documentos compartibles con addenda UI y adjuntos.
- Corregir o revisar en PR #40 cualquier hallazgo de seguridad restante antes de retargetear/fusionar.
- No abrir una tercera vertical apilada hasta resolver PR #1 o definir una estrategia explicita que no agrave dependencias.

## Bloqueos

- PR #1 esta bloqueado por regla de rama: GitHub requiere 1 approving review de un usuario con permisos de escritura antes del squash merge.
- Auto-merge no esta habilitado en el repositorio (`enablePullRequestAutoMerge`).

## Riesgos

- Aplicacion sanitaria: no afirmar cumplimiento legal ni suficiencia clinica sin revision externa.
- El catalogo alimentario no sustituye validacion clinica ni revision dietetica humana.
- BEDCA esta disponible solo como import local; el XLSX y el JSON generado no se versionan.
- Las funciones de competidores estan documentadas como evidencia publica anunciada/observada, no como verificacion tecnica interna.
- IA, pagos, facturacion, vademecum farmaco-nutriente, apps nativas y colectividades quedan fuera del MVP.
- Dashboard, clientes y agenda ya leen/escriben Supabase en esta rama; portal, planes, mensajes y documentos siguen siendo demo/no persistentes.
- El acceso applicativo actual usa configuracion server-only de workspace profesional; RLS esta implementado y probado en SQL, pero falta conectar Auth real a las queries de usuario final.
- `main` sigue en el commit base `65117ed`; la fundacion real del producto aun no esta integrada.
- La nueva rama es una tercera PR apilada por instruccion explicita de continuar; depende de la integracion de PR #1 y PR #40.
- La rama `feat/anthropometry-measurement-workflow` es una cuarta capa apilada y depende de PR #41, que a su vez depende de PR #40.
- Auth esta iniciada pero no completa: no hay MFA, invitaciones, recuperacion, revocacion ni portal autenticado funcional.
- En macOS/Colima local, el stack completo de Supabase fallo al arrancar `vector` por montaje de Docker socket y Storage quedo inestable; la validacion Auth/E2E se ejecuto con DB, Kong y Auth, excluyendo servicios no usados por esta vertical.
- `psql` no esta instalado fuera de Supabase CLI.
- `supabase db lint` sobre todos los schemas incluye avisos de la extension pgTAP; lint limitado a `public,private` pasa sin errores.

## Ultimo commit

- La rama `feat/persistent-clients-agenda` contiene la normalizacion documental y de seguridad de PR #40; revisar `git log --oneline -5` para hashes exactos.

## Ultimos comandos de validacion ejecutados

- `corepack pnpm format:check`: PASS.
- `corepack pnpm lint`: PASS.
- `corepack pnpm typecheck`: PASS.
- `corepack pnpm test`: PASS, 6 archivos y 25 tests.
- `corepack pnpm build`: PASS, rutas dinamicas `/[locale]/profesional`, `/[locale]/profesional/agenda`, `/[locale]/profesional/clientes`, `/[locale]/profesional/clientes/[id]`.
- `supabase db reset`: PASS con migraciones `202607250001_foundation.sql`, `202607250002_foods_foundation.sql`, `202607260001_clients_agenda_persistence.sql` y `202607260002_integrity_and_rls_hardening.sql`.
- `corepack pnpm bedca:import /Users/josegonzalez/Documents/Proyectos/NUTRI/data/bedca.xlsx --database-url=<local Supabase DB_URL>`: PASS, 957 alimentos importados localmente.
- `supabase test db`: PASS, 3 archivos y 59 tests.
- `supabase db lint --schema public,private --fail-on error`: PASS.
- `corepack pnpm test:e2e`: PASS, 16 tests en Chromium y mobile con axe, Supabase Auth real local y `auth.getUser()`; valida login, CRUD cliente, cita persistente, ayuda antropometrica, tercera medicion y persistencia con recarga.
- `corepack pnpm audit --audit-level moderate`: PASS, sin vulnerabilidades conocidas.
- Secret scan rapido con `rg`: sin secretos reales; solo placeholders en `.env.example` y referencias `env(...)` de Supabase local.

## Proxima accion automatica

- Abrir PR apilada de `feat/anthropometry-measurement-workflow` contra `feat/clinical-workflow-foundation`, documentando dependencia de PR #1/#40/#41 y continuar despues con resultados/PDF antropometricos, equivalencias y raciones de macronutrientes.
