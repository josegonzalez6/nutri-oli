# AGENTS.md

Este repositorio sigue `PROMPT_MAESTRO_FINAL_NUTRI_OLI_CODEX.md` como especificacion principal y consolidada.

Prompts anteriores (`PROMPT_MASTER_CODEX_NUTRI_OLI.md` y `PROMPT_BENCHMARK_FUNCIONAL_NUTRI_OLI.md`) siguen siendo contexto historico cuando no contradigan la especificacion consolidada.

## Reglas obligatorias

- No commitear secretos, `.env`, volcados de base de datos ni datos reales de pacientes.
- Usar Conventional Commits y ramas pequenas.
- Mantener `docs/STATUS.md` actualizado con fase, validaciones, bloqueos y siguiente accion.
- Normalizar integracion antes de abrir nuevas verticales; no acumular PR apiladas sin estrategia explicita.
- Ejecutar lint, typecheck, tests y build antes de abrir PR.
- No afirmar cumplimiento RGPD, suficiencia juridica o certificacion ISAK sin revision humana.
- No usar `any` en TypeScript salvo justificacion documentada.
- El frontend no sustituye a RLS ni a autorizacion server-side.
- No simular aprobaciones ni desactivar protecciones de rama para fusionar.

## Roles secuenciales cuando no haya agentes paralelos

- Arquitectura/producto: mantener alcance, plan y decisiones.
- Base de datos/Auth/RLS: migraciones, policies, tests SQL y Storage privado.
- Frontend profesional: dashboard, navegacion, accesibilidad y estados.
- Portal cliente: aislamiento por cliente y solo contenido publicado.
- Dominio clinico/antropometria: formulas documentadas, sin diagnostico automatico.
- QA/seguridad: revisar IDOR, XSS, RLS, PII, accesibilidad y dependencias.
- DevOps: CI, preview, documentacion de despliegue y runbooks.

## Gates humanos

- Clinical sign-off: pendiente hasta revision profesional de formularios, formulas, informes y lenguaje.
- Legal sign-off: pendiente hasta revision juridica de privacidad, consentimientos, terminos, retencion y proveedores.
- Production sign-off: pendiente hasta aprobacion de dominio, correo, backups, restore, soporte y datos profesionales reales.

## Comandos preferidos

```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
supabase db reset
supabase test db
```
