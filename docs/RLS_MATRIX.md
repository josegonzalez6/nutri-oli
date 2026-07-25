# RLS Matrix

| Recurso                | Profesional owner/nutritionist                         | Assistant                                                       | Client                                      | Anonymous |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------- | --------- |
| `organizations`        | Lee su organizacion; owner actualiza                   | Lee si miembro                                                  | No por defecto                              | Denegado  |
| `profiles`             | Perfil propio                                          | Perfil propio                                                   | Perfil propio                               | Denegado  |
| `organization_members` | Owner administra; miembros leen                        | Lee miembros de su org                                          | No por defecto                              | Denegado  |
| `clients`              | Lee/muta clientes de su org                            | Sin notas clinicas; mutacion limitada a agenda en fases futuras | Solo su propio perfil via `client_profiles` | Denegado  |
| `appointments`         | Lee/muta citas de su org                               | Lee/muta agenda sin notas clinicas privadas                     | Lee sus propias citas                       | Denegado  |
| `feature_flags`        | Owner muta; miembros leen                              | Lee                                                             | No por defecto                              | Denegado  |
| `audit_events`         | Owner/auditor leen; usuarios insertan eventos propios  | Inserta eventos propios                                         | Inserta eventos propios                     | Denegado  |
| Storage privado        | Owner/nutritionist escriben; miembros autorizados leen | Lectura segun rol futuro                                        | Solo mediante URLs firmadas futuras         | Denegado  |

Pruebas iniciales en `supabase/tests/rls_foundation.sql`. La matriz se ampliara por tabla en cada fase.
