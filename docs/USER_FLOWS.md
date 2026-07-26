# User Flows

Fecha de revision: 2026-07-26.

## Profesional: inicio del dia

1. Entra al panel profesional.
2. Revisa proxima cita, agenda del dia, mensajes, formularios, planes y consentimientos pendientes.
3. Filtra por periodo o profesional cuando exista equipo.
4. Abre el cliente o inicia consulta desde la tarjeta accionable.
5. Las acciones sensibles quedan auditadas.

## Profesional: alta e invitacion de cliente

1. Crea cliente con datos minimos.
2. Define estado, objetivo, contacto, profesional asignado y preferencias.
3. Registra consentimientos pendientes.
4. Genera invitacion con token de un solo uso y caducidad.
5. El cliente establece su propio acceso; el profesional nunca conoce la contrasena.

## Profesional: cita y consulta guiada

1. Programa cita con servicio, modalidad, ubicacion/enlace y estado.
2. Al iniciar consulta, revisa resumen, alertas, historial, medidas, objetivos, plan activo y tareas.
3. Registra evolucion, adherencia, barreras, medidas, objetivos, intervencion y proxima revision.
4. Separa nota privada de resumen compartible.
5. Finaliza la nota; cualquier correccion posterior es addendum versionado.

## Profesional: antropometria

1. Selecciona cliente, antropometrista, protocolo, equipo y condiciones.
2. Introduce repeticiones por medida.
3. El sistema conserva valores brutos y alerta discrepancias segun umbrales configurados.
4. Calcula valor final y resultados solo con formulas versionadas.
5. Decide que se comparte con el cliente y genera informe si procede.

## Profesional: plan dietetico flexible

1. Selecciona modalidad: menu, dia tipo, equivalencias, plato, frecuencias u objetivos.
2. Usa alimentos/recetas con fuente y licencia.
3. Comprueba energia, macros, fibra, micronutrientes disponibles y alergias registradas.
4. Guarda borrador editable.
5. Publica version inmutable cuando la revisa.
6. Cliente ve solo la version publicada.

## Cliente: entrada al portal

1. Acepta invitacion y consentimientos requeridos.
2. Ve proxima cita, plan activo, tareas, recomendaciones y documentos publicados.
3. Registra solo las metricas habilitadas por el profesional.
4. Consulta progreso autorizado.
5. Envia mensajes no urgentes y adjuntos permitidos.
6. Descarga documentos compartidos.

## Seguridad: intento de acceso indebido

1. Cliente o profesional modifica manualmente un UUID o URL.
2. RLS rechaza el acceso aunque el frontend tuviera un bug.
3. El sistema evita exponer dato sensible en error, cache, URL o log.
4. El intento relevante se registra como evento de seguridad cuando aplique.
