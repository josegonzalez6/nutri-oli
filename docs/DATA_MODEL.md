# Data Model

## Nucleo Fase 1

- `organizations`: consulta/organizacion.
- `profiles`: perfil aplicativo enlazado a `auth.users`.
- `organization_members`: rol y permisos por organizacion.
- `professional_profiles`: datos profesionales.
- `clients`: ficha minima de cliente.
- `client_profiles`: enlace portal cliente a usuario Auth.
- `client_assignments`: asignacion profesional-cliente.
- `services`: tipos de servicio.
- `appointments`: agenda inicial.
- `feature_flags`: modulos opcionales desactivados por defecto.
- `audit_events`: eventos tecnicos y legales sin contenido clinico completo.

## Catalogo alimentario

- `food_sources`: origen bibliografico o base externa importada.
- `nutrients`: definicion canonica de nutrientes con unidad y categoria.
- `foods`: alimentos globales verificados o alimentos privados por organizacion.
- `food_nutrients`: valores nutricionales por 100 g/ml, con marca de trazas.
- `food_synonyms`: sinonimos de busqueda por alimento.

## Clientes y agenda persistente

- `professional_availability`: franjas semanales activas por profesional y organizacion.
- `availability_exceptions`: bloqueos puntuales de disponibilidad profesional.
- `appointment_status_history`: historial append-only de creacion y cambios de estado de citas.
- `appointments`: constraint `appointments_no_professional_overlap` impide dobles reservas activas
  (`requested`, `confirmed`) por profesional.
- `audit_events`: registra mutaciones de clientes, servicios, disponibilidad y citas sin guardar
  contenido clinico completo en metadata.

## Principios

UUIDs, `created_at`, `updated_at`, constraints, indices por organizacion/cliente/fecha y RLS en todas las tablas expuestas.
