# Competitor Benchmark

Fecha de revision: 2026-07-26.

## Metodo y limites

- Fuentes: solo paginas oficiales publicas vigentes; no se han usado demos privadas, paywalls ni extraccion masiva.
- Evidencia marcada como `Anunciada` cuando procede de pagina comercial publica; `Observada` solo si la propia pagina publica muestra o describe un flujo/pantalla; `Inferida` no se usa como evidencia de producto.
- No se copian interfaces, textos, recursos, bases de datos, recetas ni flujos propietarios.
- Las afirmaciones de seguridad, RGPD, HIPAA, firma o validez legal se registran como marketing del proveedor y no como verificacion tecnica independiente.

## Fuentes revisadas

| Producto             | Fuente oficial                                            | Revision   | Limitacion                                                               |
| -------------------- | --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| Nutrium              | https://nutrium.com/en/professionals                      | 2026-07-26 | Pagina publica comercial, sin demo interna.                              |
| ICNS Health Software | https://softwarenutricion.com/                            | 2026-07-26 | Pagina publica comercial, sin demo interna.                              |
| DietoPro             | https://dietopro.com/                                     | 2026-07-26 | Pagina publica comercial, sin demo interna.                              |
| Nutriplo             | https://www.nutriplo.com/                                 | 2026-07-26 | Pagina publica comercial, sin demo interna.                              |
| Sabea                | https://sabea.es/                                         | 2026-07-26 | Pagina publica comercial, sin demo interna.                              |
| dietetic.app         | https://www.dietetic.app/producto/inteligencia-artificial | 2026-07-26 | Pagina publica de producto IA, sin demo interna.                         |
| i-Diet               | https://www.i-diet.es/                                    | 2026-07-26 | Pagina publica breve, evidencia funcional limitada.                      |
| MiNutriApp           | https://minutriapp.com/                                   | 2026-07-26 | Referencia internacional; no sustituye necesidades legales de Espana/UE. |

## Resumen por competidor

### Nutrium

- Publico objetivo: dietistas y profesionales de nutricion.
- Modulos anunciados: seguimiento, recomendaciones, diario alimentario, recordatorios, chat, progreso, citas, planes, datos de salud y finanzas.
- Flujo profesional: gestionar citas, crear planes personalizados, monitorizar progreso y comunicarse con clientes.
- Flujo cliente: app/espacio para registrar ingestas, consultar plan, comunicarse y ver progreso.
- Fortalezas: integracion profesional-cliente y seguimiento continuo.
- Limitaciones: no se observa arquitectura interna, RLS, modelo de consentimiento ni detalle de versionado clinico.
- Adaptable a Nutri-Oli: dashboard de atencion con mensajes, planes, consentimientos, citas y progreso.
- No replicar: identidad visual, textos, app flow exacto ni base de datos.

### ICNS Health Software

- Publico objetivo: dietistas, nutricionistas y medicos.
- Modulos anunciados: menus semanales con nutrientes en tiempo real, pautas abiertas, equivalencias, plantillas, recetas, datos de pacientes, entrevista dietetica, antropometria, bioimpedancia, ingestas con fotos/video, analiticas, actividad, citas, chat y app cliente.
- Flujo profesional: disenar menu o pauta flexible, revisar expediente y seguimiento del cliente, entregar PDF/app.
- Flujo cliente: registrar ingestas, peso, medidas, progreso, feedback, reserva y chat con funciones activables por el profesional.
- Fortalezas: combinacion de menu calibrado y pauta por equivalencias; activacion granular en cliente.
- Limitaciones: no se verifica licencia de bases/recetas ni controles tecnicos internos.
- Adaptable a Nutri-Oli: soporte multimodal de intervencion, funciones de cliente activables y recetas propias/versionadas.
- No replicar: recetas, filtros propietarios, sistema de equivalencias concreto ni material educativo.

### DietoPro

- Publico objetivo: profesionales con titulacion oficial en dietetica y nutricion y estudiantes.
- Modulos anunciados: generacion automatica editable de planes, app profesional, app paciente, patologias, recomendaciones, vademecum de interacciones farmaco-nutriente, entrevista personalizable, seguimiento online, educacion, chat e integracion Google Calendar.
- Flujo profesional: entrevista, generacion automatica como base, edicion profesional y seguimiento.
- Flujo cliente: plan, intercambiador de recetas, seguimientos, proxima cita, lista de compra y chat.
- Fortalezas: automatizacion de plan y comunicacion segmentada.
- Limitaciones: cualquier base de interacciones farmaco-nutriente exige fuente/licencia y validacion profesional; no debe reproducirse por scraping.
- Adaptable a Nutri-Oli: automatizacion solo como borrador auditado y nunca como prescripcion autonoma.
- No replicar: vademecum, recomendaciones, recetas, logica experta o mensajes comerciales.

### Nutriplo

- Publico objetivo: nutricionistas, dietistas y nutriologos que buscan una gestion clinica simple.
- Modulos anunciados: pacientes, historial clinico, evaluaciones, evolucion, notas, contacto/emergencia, anamnesis, antropometria, objetivos, diagnostico/indicaciones, PDF y citas.
- Flujo profesional: ficha paciente, evaluacion, cita, seguimiento y reporte.
- Flujo cliente: no hay suficiente detalle publico de portal cliente en la pagina revisada.
- Fortalezas: simplicidad y flujo clinico concentrado.
- Limitaciones: menos evidencia publica sobre portal, mensajeria, versionado y seguridad tecnica.
- Adaptable a Nutri-Oli: consulta guiada simple para revisar, medir, documentar, publicar y programar revision.
- No replicar: estructura visual o rutas de uso exactas.

### Sabea

- Publico objetivo: dietistas-nutricionistas colegiados.
- Modulos anunciados: expediente clinico, IA para borradores, revision profesional, firma, consentimiento digital, PWA cliente, antropometria ISAK, analiticas, multiagenda y datos en servidores EU.
- Flujo profesional: verificar colegiacion, abrir expediente, generar borrador, revisar/ajustar, firmar y entregar.
- Flujo cliente: PWA para plan, documentos, consentimientos, notas y seguimiento.
- Fortalezas: trazabilidad, foco clinico, PWA y narrativa de IA supervisada.
- Limitaciones: claims legales y clinicos deben ser revisados de forma independiente; no se verifica tecnologia ni cumplimiento.
- Adaptable a Nutri-Oli: IA prudente como borrador futuro, versionado, consentimiento y publicacion profesional.
- No replicar: promesas de tiempo, plantillas legales, flujo de firma, claims juridicos o base nutricional.

### dietetic.app

- Publico objetivo: profesionales de nutricion con interes en IA asistida.
- Modulos anunciados: borradores de planes desde ficha, filtros por alergias/intolerancias, consentimiento especifico de IA, extraccion de analiticas con validacion humana, analisis por foto, anonimización antes de proveedor y no diagnostico automatico.
- Valor para Nutri-Oli: confirma que IA solo puede entrar tras consentimiento, minimizacion, validacion humana y auditoria.
- No replicar: prompts, modelos, UI, ejemplos clinicos ni claims.

### i-Diet

- Publico objetivo: profesional que prioriza rapidez y flexibilidad en dietas.
- Modulos anunciados: dietas en pocos pasos, bases de alimentos/recetas editables y creacion de alimentos/recetas propios.
- Valor para Nutri-Oli: el editor debe ser flexible, no solo cerrado.
- Limitacion: evidencia publica reducida.

### MiNutriApp

- Publico objetivo: nutriologos, con fuerte foco Mexico.
- Modulos anunciados: expediente, antropometria ISAK, planes con IA, app cliente, lista de compras, progreso, agenda, pediatria, deportistas, reportes y chat.
- Valor para Nutri-Oli: referencia de profundidad antropometrica y portal cliente; no trasladar normativa, bases ni sistema de equivalentes mexicano.

## Resultado esperado del benchmark

Funciones comunes que debe cubrir:

- Gestion segura de clientes, agenda, expediente, consultas, antropometria, alimentos, recetas, planes, portal, progreso, mensajeria, documentos y consentimientos.

Funciones diferenciales para Nutri-Oli:

- Consulta guiada con separacion claro entre privado, borrador, compartido y publicado.
- Antropometria rigurosa con valores brutos, repeticion, discrepancia, equipo, protocolo y calculos versionados.
- Intervencion flexible: menu, pauta abierta, equivalencias, plato, frecuencias y objetivos conductuales.
- Explicabilidad de calculos y trazabilidad de version/publicacion.
- Privacidad por diseno con RLS, storage privado, auditoria y logs sin datos de salud.

Funciones que deben simplificarse:

- IA, pagos, facturacion, calendarios externos, wearables y apps nativas quedan fuera del nucleo.
- Automatizacion de planes queda como borrador futuro, no como decision clinica.
- Comunicacion segmentada se limita a mensajes seguros y no a marketing.

Funciones que no deben copiarse:

- Bases de recetas/alimentos propietarias.
- Vademecums o interacciones farmaco-nutriente sin fuente/licencia/validacion.
- Claims legales, medicos, RGPD o ISAK de otros productos.
- Diseños, textos, iconos, fotografias, flujos exactos y trade dress.

Riesgos clinicos:

- Automatizacion que parezca prescripcion autonoma.
- Estimaciones antropometricas sin poblacion, formula, version ni limites.
- Lenguaje pesocentrista o culpabilizador en seguimiento.
- Mezcla de dato declarado, medido, estimado y calculado.

Riesgos legales o de privacidad:

- Tratamiento de datos de salud sin consentimiento/base juridica revisada.
- Datos clinicos en emails, logs, URLs o archivos publicos.
- Bases de datos importadas sin licencia compatible.
- Prometer cumplimiento legal o certificacion sin revision humana.

MVP:

- Clientes, agenda, expediente, consulta guiada, antropometria basica, alimentos, recetas, planes publicados, portal, progreso, mensajes, recomendaciones, documentos, consentimientos, auditoria, exportacion y tests de seguridad.

Fases posteriores:

- IA con consentimiento, pagos/facturacion, calendarios externos, reservas publicas, wearables, colectividades y apps nativas.

Decisiones pendientes:

- Revision juridica de textos legales.
- Validacion clinica de formularios, ecuaciones y documentos.
- Revision de licencia BEDCA y de cualquier fuente de alimentos.

Proxima accion automatica:

- Integrar esta matriz en backlog y avanzar con el dashboard/centro de consulta de Fase 2.
