# Master Plan

## Objetivo

Construir Nutri-Oli como monolito modular seguro para consulta nutricional, con area profesional, portal de cliente, Supabase local y despliegue reproducible en GitHub, Supabase y Vercel.

## Fases

| Fase | Nombre                     | Resultado esperado                                                          |
| ---- | -------------------------- | --------------------------------------------------------------------------- |
| 0    | Inspeccion y planificacion | Repositorio auditado, docs iniciales, backlog y riesgos                     |
| 1    | Fundacion segura           | Next.js, TS, i18n, Supabase local, esquema nucleo, Auth/RLS, CI, tests base |
| 2    | Clientes y agenda          | Dashboard operativo, clientes, agenda, invitaciones, auditoria              |
| 3    | Historia y consultas       | Anamnesis, ADIME/PES, notas versionadas, objetivos                          |
| 4    | Antropometria              | Protocolos, mediciones, calidad, calculos y PDF                             |
| 5    | Alimentos y recetas        | Alimentos, nutrientes, recetas, equivalencias e importacion segura          |
| 6    | Planes dieteticos          | Editor, totales, versiones, publicacion y portal                            |
| 7    | Seguimiento y mensajeria   | Registros, progreso, mensajes, documentos y consentimientos                 |
| 8    | Seguridad y cumplimiento   | Threat model extendido, RLS exhaustiva, exportacion, retencion, red-team    |
| 9    | Pulido y produccion        | Accesibilidad, rendimiento, UAT, despliegue, smoke tests y release          |

## MVP

El MVP requiere autenticacion profesional/cliente, clientes, agenda, consultas, antropometria basica, plan dietetico versionado, mensajeria, consentimientos, auditoria, RLS probada, CI y build de produccion.
