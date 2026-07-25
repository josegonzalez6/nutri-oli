# Nutri-Oli

Nutri-Oli es una aplicacion web para consulta de dietetica-nutricion en Espana, con area profesional y portal privado de cliente. El proyecto trata datos de salud, por lo que se construye con denegacion por defecto, RLS en Supabase y documentacion operativa desde el inicio.

## Stack inicial

- Next.js App Router, React y TypeScript estricto.
- pnpm mediante Corepack.
- Tailwind CSS.
- Supabase local para PostgreSQL, Auth, Storage y RLS.
- next-intl preparado para espanol y catalan.
- Vitest, Testing Library, Playwright, ESLint y Prettier.

## Desarrollo local

```bash
corepack pnpm install
supabase start
cp .env.example .env.local
corepack pnpm dev
```

No uses datos reales de pacientes en local, tests, seeds, capturas o logs.

## Validacion

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
supabase db reset
supabase test db
```

## Estado

Consulta [docs/STATUS.md](/Users/josegonzalez/Documents/GitHub/nutri-oli/docs/STATUS.md) para fase actual, bloqueos, comandos ejecutados y riesgos.
