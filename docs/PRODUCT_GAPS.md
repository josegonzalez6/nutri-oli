# Product Gaps

Fecha de revision: 2026-07-26.

## Estado actual de Nutri-Oli

Completado:

- Fundacion Next.js, TypeScript, i18n, Supabase local, RLS base, CI y documentacion.
- Esquema inicial de organizaciones, perfiles, roles, clientes, servicios, citas, flags y auditoria.
- Base de alimentos con import BEDCA local, parser seguro, esquema de alimentos y pantalla profesional `/es/profesional/alimentos`.

## Gaps frente al benchmark

| Gap                                                    | Impacto                                          | Riesgo si se pospone                            | Prioridad | Fase   |
| ------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------- | --------- | ------ |
| Dashboard operativo conectado a agenda/clientes/tareas | El profesional no tiene vista diaria accionable  | Se navega por pantallas aisladas                | MUST      | Fase 2 |
| Listado y alta de clientes                             | Sin cliente no existe flujo clinico real         | Bloquea agenda, consulta, portal y planes       | MUST      | Fase 2 |
| Agenda dia/semana/mes con solapamientos                | Consulta no gestionable                          | Citas duplicadas o sin trazabilidad             | MUST      | Fase 2 |
| Invitacion segura al portal                            | Cliente no puede entrar de forma segura          | Riesgo de contrasenas conocidas o acceso manual | MUST      | Fase 2 |
| Expediente/anamnesis versionada                        | Falta contexto clinico estructurado              | Notas dispersas e incomparables                 | MUST      | Fase 3 |
| Consulta guiada con ADIME/PES opcional                 | Falta flujo de visita habitual                   | Notas sin separacion privado/compartido         | MUST      | Fase 3 |
| Antropometria con repeticiones                         | Falta diferencial ISAK-compatible                | Mediciones sin calidad tecnica                  | MUST      | Fase 4 |
| Recetas/equivalencias                                  | Alimentos existen, pero no intervencion completa | Planes pobres o solo menu cerrado               | MUST      | Fase 5 |
| Planes versionados y publicacion                       | Cliente no recibe pauta segura                   | Borradores visibles o historial perdido         | MUST      | Fase 6 |
| Mensajeria/documentos/consentimientos                  | Falta relacion longitudinal segura               | Uso de canales externos inseguros               | SHOULD    | Fase 7 |
| Exportacion/retencion/red-team                         | Cumplimiento operativo incompleto                | Fuga, retencion indefinida o IDOR no detectado  | MUST      | Fase 8 |

## Carencias deliberadas

- IA: no entra hasta tener consentimiento, minimizacion, auditoria y proveedor revisado.
- Pagos/facturacion: no entra hasta validacion fiscal/juridica en Espana.
- Apps nativas: PWA/portal responsive primero.
- Interacciones farmaco-nutriente: no se implementan sin fuente autorizada y validacion clinica.

## Gaps de datos y licencias

- BEDCA local esta importada solo para desarrollo; licencia pendiente de revision antes de distribuir datos.
- No hay recetas o recursos educativos reutilizados de terceros.
- Cualquier fuente futura debe registrar origen, licencia, fecha, transformacion y responsable de revision.
