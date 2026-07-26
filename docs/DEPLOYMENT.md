# Deployment

## Local

```bash
corepack pnpm install
supabase start
cp .env.example .env.local
corepack pnpm dev
```

Rellena `.env.local` con valores locales de `supabase status`. No commitear `.env.local`.

## Preview

- Vercel Preview por pull request.
- Variables separadas de produccion.
- Datos demo o base aislada.
- Nunca conectar previews no confiables a produccion.

## Produccion

- Proyecto Supabase separado en region adecuada para clientes europeos.
- RLS y migraciones aplicadas antes de datos reales.
- Variables Vercel configuradas por entorno.
- Dominio y correo solo cuando el usuario lo apruebe.
- Smoke test post-deploy.
