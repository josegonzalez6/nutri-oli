# Security

## Controles Fase 1

- `.env` y `.env.*` ignorados; `.env.example` sin secretos.
- Next.js sin `X-Powered-By` y con cabeceras basicas de seguridad.
- Registro libre de Supabase desactivado en config local.
- Password minimo local de 12 caracteres con complejidad.
- RLS habilitada en tablas publicas.
- Buckets Storage privados.
- No hay datos reales ni credenciales demo predecibles.
- Import BEDCA local sin versionar XLSX ni JSON generado.
- Textos importados de hojas de calculo se validan y se neutralizan si empiezan como formula.
- Alimentos globales verificados son de lectura; alimentos privados quedan aislados por organizacion.

## Pendiente

- CSP estricta por entorno.
- Rate limiting de mutaciones.
- Redaccion de PII en logs.
- Revision juridica de licencia BEDCA antes de produccion o distribucion de datos.
