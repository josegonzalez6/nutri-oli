# Architecture

Nutri-Oli se implementa como monolito modular:

- `src/app`: rutas App Router por locale y area.
- `src/components`: componentes UI reutilizables.
- `src/features`: logica de dominio por modulo.
- `src/lib/supabase`: clientes SSR/browser.
- `supabase/migrations`: esquema, funciones y RLS versionados.
- `supabase/tests`: pruebas pgTAP/RLS.

## Seguridad de datos

- Supabase Auth es la fuente de identidad.
- Las tablas expuestas tienen RLS habilitada.
- Las funciones auxiliares de autorizacion viven en `private` con `search_path` explicito.
- Storage usa buckets privados y rutas por `organization_id`.
- El service role no se usa en cliente y queda fuera de `.env.example` publica.

## Frontend

Modo claro obligatorio, paleta propia de oliva, salvia, azul informativo, ambar y rojo para alertas. La primera pantalla es operativa, no landing comercial.
