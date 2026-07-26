# RLS Matrix

| Recurso                      | Profesional owner/nutritionist                                               | Assistant                                              | Client                                      | Anonymous                            |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- | ------------------------------------ |
| `organizations`              | Lee su organizacion; owner actualiza                                         | Lee si miembro                                         | No por defecto                              | Denegado                             |
| `profiles`                   | Perfil propio                                                                | Perfil propio                                          | Perfil propio                               | Denegado                             |
| `organization_members`       | Owner administra; miembros leen                                              | Lee miembros de su org                                 | No por defecto                              | Denegado                             |
| `clients`                    | Owner lee/muta clientes de su org; nutritionist lee/muta clientes asignados  | Sin acceso clinico por defecto                         | Solo su propio perfil via `client_profiles` | Denegado                             |
| `appointments`               | Lee/muta citas de su org                                                     | Lee/muta agenda sin notas clinicas privadas            | Lee sus propias citas                       | Denegado                             |
| `professional_availability`  | Lee/muta disponibilidad de su org                                            | Lee disponibilidad de su org                           | No por defecto                              | Denegado                             |
| `availability_exceptions`    | Lee/muta bloqueos de su org                                                  | Lee bloqueos de su org                                 | No por defecto                              | Denegado                             |
| `appointment_status_history` | Lee historial de citas de su org                                             | Lee historial de agenda de su org                      | Lee historial de sus propias citas          | Denegado                             |
| `feature_flags`              | Owner muta; miembros leen                                                    | Lee                                                    | No por defecto                              | Denegado                             |
| `audit_events`               | Owner/auditor leen; usuarios insertan eventos propios                        | Inserta eventos propios                                | Inserta eventos propios                     | Denegado                             |
| `food_sources`               | Lee fuentes de alimentos verificados                                         | Lee fuentes de alimentos verificados                   | Lee fuentes de alimentos verificados        | Lee fuentes de alimentos verificados |
| `nutrients`                  | Lee nutrientes canonicos                                                     | Lee nutrientes canonicos                               | Lee nutrientes canonicos                    | Lee nutrientes canonicos             |
| `foods`                      | Lee globales verificados y privados de su organizacion; muta privados        | Lee globales verificados y privados de su organizacion | Lee globales verificados                    | Lee globales verificados             |
| `food_nutrients`             | Lee nutrientes de alimentos visibles                                         | Lee nutrientes de alimentos visibles                   | Lee nutrientes de alimentos visibles        | Lee nutrientes de alimentos visibles |
| `food_synonyms`              | Lee sinonimos de alimentos visibles                                          | Lee sinonimos de alimentos visibles                    | Lee sinonimos de alimentos visibles         | Lee sinonimos de alimentos visibles  |
| `clinical_intake_templates`  | Owner/nutritionist leen y mutan plantillas de su organizacion                | Sin acceso                                             | Sin acceso directo                          | Denegado                             |
| `clinical_intake_responses`  | Owner/nutritionist asignados leen y mutan respuestas de sus clientes         | Denegado                                               | Pendiente de portal autenticado             | Denegado                             |
| `consultations`              | Owner/nutritionist asignados leen y mutan borradores; finalizadas inmutables | Denegado, incluyendo nota privada                      | Pendiente de resumen publicado              | Denegado                             |
| `consultation_addenda`       | Owner/nutritionist asignados leen e insertan addenda sobre finalizadas       | Denegado                                               | Denegado                                    | Denegado                             |
| `anthropometry_sessions`     | Owner/nutritionist asignados leen y mutan sesiones de sus clientes           | Denegado                                               | Pendiente de visibilidad configurada        | Denegado                             |
| Storage privado              | Owner/nutritionist escriben; miembros autorizados leen                       | Lectura segun rol futuro                               | Solo mediante URLs firmadas futuras         | Denegado                             |

Pruebas en `supabase/tests/rls_foundation.sql`, `supabase/tests/clients_agenda_rls.sql`
y `supabase/tests/clinical_workflow_rls.sql`.
La suite valida lectura y mutacion cross-org denegadas, asistente sin acceso clinico a clientes,
integridad `(organization_id, id)` en citas y registros clinicos, helper seguro de Storage, rechazo
de citas activas solapadas por constraint, denegacion de anamnesis/consultas a assistant e
inmutabilidad de consultas finalizadas.
