# Threat Model

## Activos

- Datos de salud.
- Identidad y sesiones.
- Documentos clinicos privados.
- Planes publicados y borradores.
- Auditoria.

## Amenazas iniciales

| Amenaza                        | Mitigacion Fase 1                                      |
| ------------------------------ | ------------------------------------------------------ |
| IDOR entre clientes            | RLS por organizacion y `client_profiles`               |
| Acceso entre organizaciones    | `organization_id` en tablas y helpers RLS              |
| Exposicion de secretos         | `.gitignore`, `.env.example`, docs                     |
| Buckets publicos               | Buckets privados por defecto                           |
| XSS en frontend                | React escaping, lint, futuras validaciones server-side |
| Registro libre no autorizado   | `enable_signup = false`                                |
| Uso de service role en cliente | Solo variables publicas `NEXT_PUBLIC_*` en cliente     |

## Revision humana

Privacidad, EIPD, textos legales, retencion y contratos con proveedores requieren revision juridica.
