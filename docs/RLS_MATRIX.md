# RLS Matrix

| Recurso                      | Profesional owner/nutritionist                                              | Assistant                                              | Client                                      | Anonymous                            |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- | ------------------------------------ |
| `organizations`              | Lee su organizacion; owner actualiza                                        | Lee si miembro                                         | No por defecto                              | Denegado                             |
| `profiles`                   | Perfil propio                                                               | Perfil propio                                          | Perfil propio                               | Denegado                             |
| `organization_members`       | Owner administra; miembros leen                                             | Lee miembros de su org                                 | No por defecto                              | Denegado                             |
| `clients`                    | Owner lee/muta clientes de su org; nutritionist lee/muta clientes asignados | Sin acceso clinico por defecto                         | Solo su propio perfil via `client_profiles` | Denegado                             |
| `appointments`               | Lee/muta citas de su org                                                    | Lee/muta agenda sin notas clinicas privadas            | Lee sus propias citas                       | Denegado                             |
| `professional_availability`  | Lee/muta disponibilidad de su org                                           | Lee disponibilidad de su org                           | No por defecto                              | Denegado                             |
| `availability_exceptions`    | Lee/muta bloqueos de su org                                                 | Lee bloqueos de su org                                 | No por defecto                              | Denegado                             |
| `appointment_status_history` | Lee historial de citas de su org                                            | Lee historial de agenda de su org                      | Lee historial de sus propias citas          | Denegado                             |
| `feature_flags`              | Owner muta; miembros leen                                                   | Lee                                                    | No por defecto                              | Denegado                             |
| `audit_events`               | Owner/auditor leen; usuarios insertan eventos propios                       | Inserta eventos propios                                | Inserta eventos propios                     | Denegado                             |
| `food_sources`               | Lee fuentes de alimentos verificados                                        | Lee fuentes de alimentos verificados                   | Lee fuentes de alimentos verificados        | Lee fuentes de alimentos verificados |
| `nutrients`                  | Lee nutrientes canonicos                                                    | Lee nutrientes canonicos                               | Lee nutrientes canonicos                    | Lee nutrientes canonicos             |
| `foods`                      | Lee globales verificados y privados de su organizacion; muta privados       | Lee globales verificados y privados de su organizacion | Lee globales verificados                    | Lee globales verificados             |
| `food_nutrients`             | Lee nutrientes de alimentos visibles                                        | Lee nutrientes de alimentos visibles                   | Lee nutrientes de alimentos visibles        | Lee nutrientes de alimentos visibles |
| `food_synonyms`              | Lee sinonimos de alimentos visibles                                         | Lee sinonimos de alimentos visibles                    | Lee sinonimos de alimentos visibles         | Lee sinonimos de alimentos visibles  |
| Storage privado              | Owner/nutritionist escriben; miembros autorizados leen                      | Lectura segun rol futuro                               | Solo mediante URLs firmadas futuras         | Denegado                             |

Pruebas en `supabase/tests/rls_foundation.sql` y `supabase/tests/clients_agenda_rls.sql`.
La suite valida lectura y mutacion cross-org denegadas, asistente sin acceso clinico a clientes,
integridad `(organization_id, id)` en citas, helper seguro de Storage y rechazo de citas activas
solapadas por constraint.
