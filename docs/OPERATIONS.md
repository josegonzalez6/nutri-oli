# Operations

## Runbooks iniciales

- Caida web: revisar Vercel status, ultimo deploy y rollback.
- Migracion fallida: detener despliegue, revisar backup y aplicar rollback forward-only si procede.
- Credencial comprometida: revocar, rotar, revisar auditoria y redeploy.
- Incidente de datos: preservar evidencias, limitar acceso, activar procedimiento juridico.
- Archivo inaccesible: comprobar bucket privado, policy y expiracion de URL firmada.
- Recordatorios duplicados: pausar job, revisar idempotency key y cola.

## Observabilidad

Solo metricas tecnicas. No capturar datos clinicos ni PII en herramientas de terceros sin revision.
