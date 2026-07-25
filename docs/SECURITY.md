# Security

## Controles Fase 1

- `.env` y `.env.*` ignorados; `.env.example` sin secretos.
- Next.js sin `X-Powered-By` y con cabeceras basicas de seguridad.
- Registro libre de Supabase desactivado en config local.
- Password minimo local de 12 caracteres con complejidad.
- RLS habilitada en tablas publicas.
- Buckets Storage privados.
- No hay datos reales ni credenciales demo predecibles.

## Pendiente

- CSP estricta por entorno.
- Rate limiting de mutaciones.
- Redaccion de PII en logs.
- Secret scanning en GitHub cuando haya permisos.
- Dependency audit formal en CI.
