# User Manual - Professional

Estado: borrador inicial. No usar como manual final de produccion.

## Disponible en la rama actual

- `/es/profesional`: panel profesional con clientes y agenda leidos desde Supabase cuando el entorno server-only esta configurado.
- `/es/profesional/clientes`: crear cliente ficticio/local, cambiar estado y revisar proxima cita.
- `/es/profesional/clientes/[id]`: ficha clinica persistente con resumen, anamnesis, consulta,
  antropometria inicial y timeline.
- `/es/profesional/agenda`: crear cita, servicio y disponibilidad; cambiar estado de cita.
- `/es/profesional/alimentos`: buscar catalogo local/importado de alimentos.
- `/es/login`: login real con Supabase Auth cuando `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` estan configuradas. En desarrollo/test puede activarse bypass
  explicito con `NUTRI_OLI_ALLOW_DEV_AUTH_BYPASS=true`.

## Flujo clinico disponible

1. Entrar en `/es/profesional/clientes`.
2. Abrir una ficha desde el listado de clientes.
3. Guardar anamnesis como borrador.
4. Recargar la pagina y comprobar que el borrador se conserva.
5. Registrar una consulta como borrador o finalizada.
6. Registrar una sesion antropometrica con masa, talla, cintura, cadera y pliegues iniciales.
7. Revisar calculos basicos generados: IMC, cintura/talla y sumatorio de pliegues.

## Pendiente

- invitaciones;
- autenticacion completa con MFA, recuperacion, revocacion y separacion estricta portal/profesional;
- plantillas de entrevista editables y envio al portal;
- expediente clinico completo;
- addenda y adjuntos de consulta desde UI;
- antropometria completa con repeticiones, TEM, ecuaciones validadas e informes PDF;
- recetas, equivalencias y planes;
- mensajes, documentos, consentimientos y PDFs;
- exportacion y derechos de privacidad.

No usar datos reales hasta completar gates clinicos, legales, seguridad y produccion.
