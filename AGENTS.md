# AGENTS.md

Este repositorio sigue `PROMPT_MASTER_CODEX_NUTRI_OLI.md` como especificacion principal.

## Reglas obligatorias

- No commitear secretos, `.env`, volcados de base de datos ni datos reales de pacientes.
- Usar Conventional Commits y ramas pequenas.
- Mantener `docs/STATUS.md` actualizado con fase, validaciones, bloqueos y siguiente accion.
- Ejecutar lint, typecheck, tests y build antes de abrir PR.
- No afirmar cumplimiento RGPD, suficiencia juridica o certificacion ISAK sin revision humana.
- No usar `any` en TypeScript salvo justificacion documentada.
- El frontend no sustituye a RLS ni a autorizacion server-side.

## Roles secuenciales cuando no haya agentes paralelos

- Arquitectura/producto: mantener alcance, plan y decisiones.
- Base de datos/Auth/RLS: migraciones, policies, tests SQL y Storage privado.
- Frontend profesional: dashboard, navegacion, accesibilidad y estados.
- Portal cliente: aislamiento por cliente y solo contenido publicado.
- Dominio clinico/antropometria: formulas documentadas, sin diagnostico automatico.
- QA/seguridad: revisar IDOR, XSS, RLS, PII, accesibilidad y dependencias.
- DevOps: CI, preview, documentacion de despliegue y runbooks.

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
