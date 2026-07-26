# Nutri-Oli Functional Scope

Fecha de revision: 2026-07-26.

## Principios de alcance

- Producto para consulta nutricional privada en Espana, preparado para colaboradores.
- Privacidad y seguridad clinica por defecto.
- Cliente solo ve contenido publicado o compartido de forma explicita.
- Automatizacion solo como borrador futuro, nunca como profesional autonomo.
- No se copian recursos propietarios de competidores.

## MVP obligatorio

1. Auth, roles, organizaciones y RLS.
2. Dashboard profesional operativo.
3. Clientes, tags, estado, asignacion e invitacion.
4. Agenda con servicios, estados, modalidad y prevencion de solapamientos.
5. Expediente nutricional estructurado y versionado.
6. Consultas y controles con nota privada, resumen compartible, objetivos y addenda.
7. Antropometria compatible con practica ISAK, sin afirmar certificacion.
8. Alimentos con fuente/licencia, nutrientes, propios/importados, busqueda e import seguro.
9. Recetas versionadas.
10. Equivalencias, raciones y medidas caseras.
11. Planes dieteticos versionados: menu, pauta abierta, plato, frecuencias y objetivos.
12. Portal cliente: plan publicado, citas, progreso habilitado, recomendaciones, documentos y mensajes.
13. Recomendaciones y recursos propios versionados.
14. Consentimientos con version, aceptacion y revocacion.
15. PDFs privados y exportacion segura.
16. Auditoria, retencion, seguridad y tests RLS/IDOR.

## Fase 2 inmediata

- Dashboard profesional de atencion.
- Listado inicial de clientes.
- Agenda inicial con servicios y estados.
- Accesos al flujo de consulta guiada.
- Backlog tecnico para invitaciones y portal base.

## Fuera del MVP

- IA productiva.
- Pagos, facturacion y Stripe.
- Google/Apple Calendar.
- Reservas publicas.
- Wearables.
- Apps nativas.
- Colectividades.
- Vademecum farmaco-nutriente.

## Criterios de calidad por funcionalidad

- Modelo de datos y RLS antes de exponer dato sensible.
- Validacion Zod o equivalente en cada frontera.
- Pruebas unitarias o SQL segun riesgo.
- E2E en rutas criticas.
- Accesibilidad con axe y teclado.
- Documentacion de estado y seguridad actualizada.
