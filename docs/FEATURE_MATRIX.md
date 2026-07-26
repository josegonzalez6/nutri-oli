# Feature Matrix

Fecha de revision: 2026-07-26.

Leyenda competidores: `Anunciada`, `Observada`, `No encontrada`, `No verificada`, `No aplicable`.

Leyenda Nutri-Oli: `MVP`, `Fase 2`, `Fase 3`, `Opcional`, `Descartada`.

| Area           | Funcion                       | Nutrium       | ICNS          | DietoPro      | Nutriplo      | Sabea         | Nutri-Oli  | Prioridad | Evidencia                                                                                     |
| -------------- | ----------------------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ---------- | --------- | --------------------------------------------------------------------------------------------- |
| Consulta       | Dashboard operativo           | Anunciada     | Anunciada     | No verificada | Anunciada     | Observada     | MVP        | MUST      | Nutrium seguimiento/chat/recordatorios; Nutriplo centraliza flujo; Sabea dashboard.           |
| Consulta       | Agenda y citas                | Anunciada     | Anunciada     | Anunciada     | Anunciada     | Anunciada     | MVP        | MUST      | Nutrium citas; ICNS agenda; DietoPro Google Calendar; Nutriplo calendario; Sabea multiagenda. |
| Cliente        | Ficha/expediente              | Anunciada     | Anunciada     | Anunciada     | Anunciada     | Anunciada     | MVP        | MUST      | Todas salvo i-Diet muestran gestion de paciente/historia.                                     |
| Cliente        | Invitacion/portal/app         | Anunciada     | Anunciada     | Anunciada     | No verificada | Anunciada     | MVP        | MUST      | Nutrium app; ICNS app; DietoPro app; Sabea PWA.                                               |
| Historia       | Anamnesis configurable        | No verificada | Anunciada     | Anunciada     | Anunciada     | Anunciada     | MVP        | MUST      | ICNS y DietoPro mencionan entrevista personalizable; Nutriplo anamnesis.                      |
| Consulta       | Nota ADIME/PES y addenda      | No encontrada | No encontrada | No encontrada | No verificada | No verificada | MVP        | MUST      | Requisito propio de seguridad clinica, no evidencia competidor.                               |
| Antropometria  | Pliegues/perimetros/diametros | Anunciada     | Anunciada     | No verificada | Anunciada     | Anunciada     | MVP        | MUST      | ICNS, Nutriplo y Sabea lo anuncian; MiNutriApp refuerza profundidad ISAK.                     |
| Antropometria  | Repeticiones y discrepancias  | No verificada | No verificada | No encontrada | No verificada | No verificada | MVP        | MUST      | Diferencial propio exigido por prompt maestro.                                                |
| Alimentos      | Base con fuente/licencia      | Anunciada     | Anunciada     | No verificada | No encontrada | Anunciada     | MVP        | MUST      | ICNS alimentos; Sabea base nutricional; Nutri-Oli requiere licencia visible.                  |
| Alimentos      | Import CSV/XLSX seguro        | No verificada | No verificada | No verificada | No encontrada | No verificada | MVP        | SHOULD    | Diferencial propio por privacidad/licencias e import BEDCA local.                             |
| Recetas        | Biblioteca y recetas propias  | Anunciada     | Anunciada     | Anunciada     | No verificada | No verificada | MVP        | MUST      | Nutrium planes/recetas en blog; ICNS recetas; DietoPro recetas/intercambios.                  |
| Planes         | Menu semanal calibrado        | Anunciada     | Anunciada     | Anunciada     | No verificada | Anunciada     | MVP        | MUST      | Nutrium plan; ICNS menus con nutrientes; DietoPro automatizacion; Sabea plan semanal.         |
| Planes         | Pauta abierta/equivalencias   | No verificada | Anunciada     | Anunciada     | No encontrada | Anunciada     | MVP        | MUST      | ICNS equivalencias; DietoPro intercambiador; Sabea intercambio de platos.                     |
| Planes         | Versionado/publicacion        | No verificada | No verificada | No verificada | No verificada | Anunciada     | MVP        | MUST      | Sabea trazabilidad; requisito propio para portal seguro.                                      |
| Cliente        | Diario alimentario            | Anunciada     | Anunciada     | Anunciada     | No verificada | No verificada | MVP        | SHOULD    | Nutrium food diary; ICNS ingestas; DietoPro seguimiento online.                               |
| Cliente        | Progreso y graficas           | Anunciada     | Anunciada     | Anunciada     | Anunciada     | Anunciada     | MVP        | SHOULD    | Nutrium progreso; ICNS progreso; Nutriplo graficas; Sabea seguimiento.                        |
| Comunicacion   | Chat seguro                   | Anunciada     | Anunciada     | Anunciada     | No encontrada | No verificada | MVP        | SHOULD    | Nutrium chat; ICNS chat; DietoPro chat.                                                       |
| Documentos     | PDFs profesionales            | No verificada | Anunciada     | No verificada | Anunciada     | Anunciada     | MVP        | SHOULD    | ICNS PDF; Nutriplo PDF; Sabea PDF firmado.                                                    |
| Legal          | Consentimientos digitales     | No verificada | No verificada | No verificada | No verificada | Anunciada     | MVP        | MUST      | Sabea consentimiento; requisito propio por datos de salud.                                    |
| Administracion | Pagos/facturacion             | Anunciada     | Anunciada     | No verificada | No encontrada | No verificada | Opcional   | COULD     | No bloquear nucleo; requiere revision legal/fiscal.                                           |
| Integraciones  | Google/Apple Calendar         | No verificada | No verificada | Anunciada     | No verificada | Anunciada     | Opcional   | COULD     | DietoPro/Sabea anuncian calendario externo.                                                   |
| IA             | Borradores de planes          | No encontrada | No encontrada | Anunciada     | No encontrada | Anunciada     | Opcional   | WON'T NOW | Sabea/dietetic.app lo anuncian; requiere consentimiento y revision proveedor.                 |
| IA             | Lectura de analiticas/fotos   | No encontrada | No encontrada | No encontrada | No encontrada | No verificada | Opcional   | WON'T NOW | dietetic.app lo anuncia; no entra en nucleo.                                                  |
| Colectividades | Menus colectivos/APPCC        | No encontrada | Anunciada     | No encontrada | No encontrada | No encontrada | Descartada | WON'T NOW | Fase futura separada; no MVP.                                                                 |

## Priorizacion agregada

MUST:

- Dashboard operativo, agenda, clientes, expediente, consultas, antropometria, alimentos, recetas, planes, portal publicado, consentimientos, RLS, auditoria y exportacion.

SHOULD:

- Diario, progreso, mensajeria, PDFs y recomendaciones.

COULD:

- Pagos, facturacion, calendarios externos, reservas publicas y PWA instalable avanzada.

WON'T NOW:

- IA productiva, vademecum farmaco-nutriente, apps nativas, colectividades y claims legales/clinicos no validados.
