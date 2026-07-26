# Data Dictionary

| Tabla                        | Campo clave                       | Descripcion                                               |
| ---------------------------- | --------------------------------- | --------------------------------------------------------- |
| `organizations`              | `locale`, `time_zone`             | Configuracion regional de consulta                        |
| `profiles`                   | `id`                              | UUID igual a `auth.users.id`                              |
| `organization_members`       | `role`                            | `owner`, `nutritionist`, `assistant`, `auditor`, `client` |
| `clients`                    | `internal_code`                   | Identificador interno, no PII en URLs                     |
| `client_profiles`            | `portal_enabled`                  | Control de acceso del cliente                             |
| `appointments`               | `starts_at`, `ends_at`            | Agenda con zona horaria explicita                         |
| `professional_availability`  | `weekday`, `starts_at`, `ends_at` | Disponibilidad recurrente por profesional                 |
| `availability_exceptions`    | `starts_at`, `ends_at`            | Bloqueos puntuales de disponibilidad                      |
| `appointment_status_history` | `previous_status`, `new_status`   | Historial de estados de cita                              |
| `feature_flags`              | `key`, `enabled`                  | Modulos opcionales desactivados por defecto               |
| `audit_events`               | `metadata`                        | JSON sin secretos ni contenido clinico completo           |
| `food_sources`               | `slug`                            | Origen de datos, cita y estado de licencia                |
| `nutrients`                  | `code`, `unit`                    | Nutriente canonico y unidad de medida                     |
| `foods`                      | `source_id`, `external_id`        | Alimento global o privado de una organizacion             |
| `food_nutrients`             | `amount_per_100g`                 | Valor nutricional por 100 g/ml y marca de traza           |
| `food_synonyms`              | `normalized_name`                 | Sinonimos seguros para busqueda                           |
