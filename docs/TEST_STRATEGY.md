# Test Strategy

## Gates

- `corepack pnpm lint`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm build`
- `supabase db reset`
- `supabase test db`
- `corepack pnpm test:e2e`

## Cobertura por fase

Fase 1 cubre reglas de rol, calculos antropometricos basicos, smoke E2E y estructura RLS. Las fases siguientes ampliaran integracion y casos IDOR reales con usuarios Auth.
