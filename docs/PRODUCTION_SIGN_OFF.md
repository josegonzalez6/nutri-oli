# Production Sign-Off

Estado: pendiente de aprobacion humana y operacional.

## Alcance

Debe revisarse antes de produccion:

- Supabase staging y produccion separados;
- Vercel preview, staging y produccion;
- dominio, HTTPS y correo;
- SPF, DKIM y DMARC;
- variables por entorno sin secretos en Git;
- backups y restauracion comprobada;
- observabilidad sin datos de salud;
- runbooks de incidente y rollback;
- smoke tests post-deploy;
- datos profesionales reales y soporte.

## Bloqueos

No desplegar produccion ni usar datos reales hasta completar este gate.
