# Legal Review Required

Fecha de revision: 2026-07-26.

Este documento lista areas que requieren revision humana profesional/juridica antes de produccion. Codex no afirma suficiencia legal, RGPD, fiscal, sanitaria, firma electronica ni certificacion clinica.

## Antes de produccion

- Politica de privacidad, informacion por capas y registro de actividades.
- Base juridica para tratamiento de datos de salud.
- Encargados de tratamiento: Supabase, Vercel, correo, monitorizacion y cualquier proveedor futuro.
- EIPD o decision documentada de necesidad.
- Consentimientos: asistencia, tratamiento, comunicaciones, teleconsulta, fotografias, menores y IA futura.
- Retencion, bloqueo, supresion y exportacion.
- Procedimiento de incidente.
- Region de datos y transferencias internacionales.
- Plantillas PDF, firma, colegiacion y valor probatorio.
- Facturacion, pagos, cancelaciones y recibos en Espana.
- Licencia BEDCA y cualquier base nutricional externa antes de distribuir datos.
- Uso de recursos educativos, recetas, imagenes o videos de terceros.

## No implementar sin nueva revision

- IA con datos de clientes.
- Vademecum farmaco-nutriente.
- Firma electronica avanzada.
- Integraciones con calendario/correo que expongan datos clinicos.
- Produccion con datos reales.

## Criterios de bloqueo

- Duda sobre licencia de datos.
- Duda sobre consentimiento o base juridica.
- Duda sobre proveedor externo que recibe datos de salud.
- Migracion destructiva sobre datos reales.
- Despliegue productivo o configuracion de facturacion.
