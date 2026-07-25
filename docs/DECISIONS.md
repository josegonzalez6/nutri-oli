# Decisions

| Fecha      | Decision                                                           | Motivo                                                         | Alternativas                                     |
| ---------- | ------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------ |
| 2026-07-25 | Monolito modular con Next.js App Router                            | Alineado con especificacion y reduce complejidad inicial       | Microservicios descartados por coste             |
| 2026-07-25 | pnpm via Corepack                                                  | `pnpm` no estaba en PATH, Corepack provee version reproducible | npm directo descartado por especificacion        |
| 2026-07-25 | next-intl con rutas `/es` y `/ca`                                  | Preparar internacionalizacion desde Fase 1                     | i18n casero descartado por mantenimiento         |
| 2026-07-25 | Supabase RLS con funciones `security definer` en esquema `private` | Evitar recursion de policies y centralizar comprobaciones      | Policies repetidas en cada tabla                 |
| 2026-07-25 | Seeds minimos sin usuarios Auth                                    | Evitar credenciales demo predecibles o datos de pacientes      | Crear usuarios demo mas adelante solo local/test |
