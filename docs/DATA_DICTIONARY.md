# Data Dictionary

| Tabla                  | Campo clave            | Descripcion                                               |
| ---------------------- | ---------------------- | --------------------------------------------------------- |
| `organizations`        | `locale`, `time_zone`  | Configuracion regional de consulta                        |
| `profiles`             | `id`                   | UUID igual a `auth.users.id`                              |
| `organization_members` | `role`                 | `owner`, `nutritionist`, `assistant`, `auditor`, `client` |
| `clients`              | `internal_code`        | Identificador interno, no PII en URLs                     |
| `client_profiles`      | `portal_enabled`       | Control de acceso del cliente                             |
| `appointments`         | `starts_at`, `ends_at` | Agenda con zona horaria explicita                         |
| `feature_flags`        | `key`, `enabled`       | Modulos opcionales desactivados por defecto               |
| `audit_events`         | `metadata`             | JSON sin secretos ni contenido clinico completo           |
