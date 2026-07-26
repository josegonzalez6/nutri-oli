# Backlog

## Milestones e issues propuestos

Priorizacion derivada de `docs/COMPETITOR_BENCHMARK.md` y `docs/FEATURE_MATRIX.md`.

Leyenda: `MUST` bloquea MVP; `SHOULD` aporta valor alto; `COULD` se prepara sin retrasar nucleo; `WON'T NOW` queda fuera.

### Fase 1 - Fundacion segura

- Issue 1: Inicializar Next.js, TypeScript, pnpm y Tailwind.
- Issue 2: Configurar i18n `es`/`ca` y layout base profesional/cliente.
- Issue 3: Inicializar Supabase local con esquema nucleo.
- Issue 4: Implementar roles, Auth helpers, RLS y buckets privados.
- Issue 5: Configurar lint, typecheck, unit tests, E2E smoke y CI.
- Issue 6: Documentacion inicial obligatoria.

### Fase 2 - Clientes y agenda

- Issue 7 [MUST]: Dashboard profesional operativo con proxima cita, agenda del dia, mensajes, planes, consentimientos, tareas y accesos rapidos.
- Issue 8 [MUST] [EN RAMA]: CRUD de clientes con validacion Zod, estado, contacto minimo y auditoria; busqueda, filtros y etiquetas quedan pendientes.
- Issue 9 [MUST] [EN RAMA]: Agenda persistente con servicios, disponibilidad, modalidad, estados, notas administrativas, historial y prevencion de doble reserva; vistas semanal/mensual quedan pendientes.
- Issue 10 [MUST]: Invitaciones de cliente con token de un solo uso, caducidad y sin contrasenas conocidas por profesional.
- Issue 10.1 [SHOULD]: Centro de consulta guiada inicial desde dashboard/cita/cliente.
- Issue 10.2 [SHOULD]: Portal base con funciones habilitables por cliente.

### Fase 3 - Historia y consultas

- Issue 11 [MUST]: Anamnesis versionada y configurable con borradores.
- Issue 12 [MUST]: Consultas ADIME/PES opcionales, nota privada, resumen compartible y addenda.
- Issue 13 [MUST]: Objetivos SMART, barreras, tareas y recomendaciones versionadas.
- Issue 13.1 [SHOULD]: Separacion visible de privado, pendiente, compartido, publicado y retirado.

### Fase 4 - Antropometria

- Issue 14 [MUST]: Protocolos y biblioteca configurable de medidas compatible con practica ISAK, sin afirmar certificacion.
- Issue 15 [MUST]: Repeticiones, valores brutos, discrepancias, equipo, calibracion y calidad tecnica.
- Issue 16 [MUST]: Calculos versionados, explicables y testeados.
- Issue 16.1 [SHOULD]: Informe PDF antropometrico con secciones compartibles.

### Fase 5 - Alimentos y recetas

- Issue 17 [MUST]: Base de alimentos con fuente, licencia, nutrientes, busqueda, filtros y alimentos propios.
- Issue 18 [MUST]: Recetas versionadas con ingredientes, rendimiento, raciones, alergenos y calculo nutricional.
- Issue 19 [MUST]: Equivalencias, porciones, medidas caseras, sustituciones e importacion CSV/XLSX segura.
- Issue 19.1 [SHOULD]: Revision de licencia BEDCA antes de distribuir datos.

### Fase 6 - Planes dieteticos

- Issue 20 [MUST]: Editor semanal y dia tipo con comidas, horarios, alimentos, recetas y medidas caseras.
- Issue 21 [MUST]: Totales nutricionales, objetivos frente a plan, alternativas, sustituciones y lista de compra.
- Issue 22 [MUST]: Versionado, borrador, publicacion, retirada, PDF y portal cliente.
- Issue 22.1 [SHOULD]: Pauta abierta, metodo del plato, frecuencias y objetivos conductuales.

### Fase 7 - Seguimiento y mensajeria

- Issue 23 [MUST]: Registros configurables del cliente con visibilidad granular y lenguaje no culpabilizador.
- Issue 24 [SHOULD]: Progreso visible segun criterio profesional con graficas y tablas.
- Issue 25 [SHOULD]: Mensajeria segura, adjuntos privados, aviso de no urgencias y notificaciones sin datos clinicos.
- Issue 26 [MUST]: Documentos, consentimientos versionados, aceptacion, revocacion y exportacion.

### Fase 8 - Seguridad y cumplimiento

- Issue 27 [MUST]: RLS exhaustiva, IDOR tests y pruebas multi-organizacion/multi-cliente.
- Issue 28 [MUST]: Exportacion, supresion, bloqueo, retencion y auditoria inmutable para usuarios normales.
- Issue 29 [MUST]: Hardening, secret scanning, red-team, storage privado, signed URLs y cache privada.
- Issue 29.1 [COULD]: Preparar feature flags para IA, pagos, reservas publicas y calendarios externos, desactivados por defecto.

### Fase 9 - Pulido y produccion

- Issue 30 [MUST]: Accesibilidad WCAG 2.2 AA con axe, teclado y contraste.
- Issue 31 [SHOULD]: Rendimiento, Lighthouse, paginacion, bundle budget y queries lentas.
- Issue 32 [MUST]: Despliegue, smoke test, backups, restauracion simulada y release.

## Won't now

- IA productiva con datos reales.
- Vademecum farmaco-nutriente.
- Pagos/facturacion.
- Apps nativas.
- Colectividades/APPCC.
- Google/Apple Calendar y reservas publicas, salvo feature flags desactivados.

## Estado GitHub

Milestones e issues reales creados en GitHub el 2026-07-25. Este archivo queda como copia documental del backlog por fases.
