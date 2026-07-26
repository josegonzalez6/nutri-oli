# PR 3 - Clinical workflow foundation

Fecha: 2026-07-26
Rama: `feat/clinical-workflow-foundation`
Base prevista: `feat/persistent-clients-agenda`

## Dependencias de integracion

- PR #1 (`chore/project-foundation`) sigue bloqueada por `REVIEW_REQUIRED`.
- PR #40 (`feat/persistent-clients-agenda`) sigue apilada sobre PR #1.
- Esta PR queda apilada por instruccion explicita de continuar desarrollo funcional.

## Funcionalidades implementadas

- Layout profesional redisenado con sidebar, acciones rapidas y navegacion limitada a modulos con superficie util.
- Login/logout real con Supabase Auth cuando hay configuracion publica de Supabase.
- Middleware server-side para rutas `/profesional` y `/portal`.
- Contexto profesional server-side derivado de Supabase Auth mediante `auth.getUser()` cuando esta disponible.
- Transacciones de negocio ejecutadas como rol `authenticated` con claim `sub` para aplicar RLS.
- Ficha clinica persistente en `/es/profesional/clientes/[id]`.
- Anamnesis inicial persistente como borrador.
- Consulta persistente con borrador/finalizado, ADIME/PES opcional, nota privada y resumen compartido.
- Inmutabilidad SQL de consultas finalizadas y tabla de addenda.
- Antropometria inicial persistente con calculos SQL de IMC, cintura/talla y sumatorio de pliegues.
- Timeline de cliente con citas, anamnesis, consultas y antropometria.
- Seeds ficticios de desarrollo/test para usuario demo, clientes demo y registros clinicos demo.

## Rutas disponibles

- `/es/login`
- `/es/profesional`
- `/es/profesional/clientes`
- `/es/profesional/clientes/[id]`
- `/es/profesional/agenda`
- `/es/profesional/alimentos`

## Datos demo

- `supabase/seed.sql` contiene solo personas y correos ficticios `.test`.
- `professional.demo@nutri-oli.test` es usuario demo local/test.
- No se han incluido datos reales de pacientes, credenciales personales ni archivos `.env`.
- BEDCA sigue como import local; el XLSX y el JSON generado no se versionan.

## Componentes parciales o no operativos

- Auth no esta completa: faltan invitaciones, recuperacion, verificacion, MFA, revocacion y separacion completa por rol de portal/profesional.
- Portal cliente sigue sin vertical persistente real.
- Planes, recetas, equivalencias, chat, documentos, consentimientos, notificaciones, correo y PDFs siguen pendientes.
- Antropometria no incluye aun repeticiones completas, TEM, ecuaciones validadas ni informes.
- Anamnesis no incluye aun editor completo de plantillas ni envio al portal.
- Addenda existe en SQL/RLS, pero no tiene interfaz de usuario.

## Seguridad y RLS

- Assistant no puede leer `clinical_intake_responses`, `consultations`, `consultation_addenda` ni `anthropometry_sessions`.
- Owner/nutritionist solo acceden a clientes de su organizacion/asignacion.
- Consultas finalizadas no pueden editarse; el trigger obliga a addenda.
- La aplicacion mantiene bypass de identidad solo con `NUTRI_OLI_ALLOW_DEV_AUTH_BYPASS=true` para desarrollo/test.
- En CI/E2E con Auth real, Playwright se serializa para no saturar el usuario demo local ni GoTrue.

## Validacion ejecutada

- `corepack pnpm format:check`: PASS.
- `corepack pnpm lint`: PASS.
- `corepack pnpm typecheck`: PASS.
- `corepack pnpm test`: PASS, 5 archivos y 17 tests.
- `supabase db reset`: PASS.
- `supabase test db`: PASS, 3 archivos y 49 tests.
- `supabase db lint --schema public,private --fail-on error`: PASS.
- `corepack pnpm build`: PASS.
- `corepack pnpm audit --audit-level moderate`: PASS.
- `corepack pnpm test:e2e`: PASS, 16 tests en Chromium y mobile con axe y Supabase Auth real local.

## Riesgos

- No usar con datos reales hasta completar gates clinicos, legales, seguridad y produccion.
- Auth real esta iniciada, no cerrada como vertical completa: faltan MFA, recuperacion, invitaciones,
  revocacion y separacion completa de portal.
- En macOS/Colima, la validacion local excluyo Storage, Realtime, Studio y Vector porque no se usan
  en esta vertical y el stack completo fallo por health checks/montaje de Docker socket.
- La PR esta apilada sobre dos PRs pendientes; cualquier cambio en PR #1/#40 puede requerir rebase.
- Las formulas antropometricas avanzadas no se han implementado para evitar inventar ecuaciones o tolerancias.

## Trabajo pendiente inmediato

- Completar Auth real end-to-end: invitaciones, recuperacion, MFA, roles, portal y sesiones revocadas.
- Convertir anamnesis en plantillas editables y enviables al cliente.
- Anadir UI de addenda y adjuntos de consulta.
- Ampliar antropometria con repeticiones, discrepancias, TEM e informes.
- Iniciar motor nutricional y editor de dietas despues de cerrar la vertical clinica base.
