# PROMPT COMPLEMENTARIO PARA CODEX — BENCHMARK FUNCIONAL DE NUTRI-OLI

## Contexto y objetivo

Estás desarrollando **Nutri-Oli**, una aplicación web privada para que un dietista-nutricionista gestione su consulta y dé acceso seguro a sus clientes.

Este prompt complementa el prompt maestro del proyecto. Debes analizar las funcionalidades que ofrecen plataformas como **Nutrium, ICNS Health Software, DietoPro, Nutriplo, Sabea y otras soluciones profesionales relevantes**, detectar qué problemas resuelven y traducir los aprendizajes a una arquitectura y experiencia propias para Nutri-Oli.

Las plataformas citadas son referencias funcionales. **No copies literalmente interfaces, textos, ilustraciones, código, bases de datos, recetas, formularios, recursos educativos, marcas ni flujos propietarios.** Nutri-Oli debe tener identidad, diseño, arquitectura y contenido propios.

No te limites a elaborar una lista. Debes:

1. Verificar las funciones en las páginas oficiales vigentes.
2. Crear una matriz comparativa.
3. Analizar el valor clínico y operativo de cada función.
4. Detectar solapamientos y carencias.
5. Priorizar MVP, fases posteriores y funciones descartadas.
6. Integrar las funciones aprobadas en el backlog del proyecto.
7. Implementarlas siguiendo las reglas de seguridad, pruebas, RLS y documentación del prompt maestro.

---

# 1. Método obligatorio de benchmark

Antes de diseñar o modificar módulos:

- Revisa las páginas oficiales y documentación pública vigente.
- Si el usuario facilita acceso autorizado a una demo, inspecciona solo las pantallas permitidas.
- No evadas permisos, límites, paywalls ni controles de acceso.
- No extraigas contenido masivo o bases de datos propietarias.
- Distingue entre:
  - función anunciada;
  - función observada;
  - función inferida;
  - función propuesta para Nutri-Oli.
- No aceptes afirmaciones comerciales como evidencia técnica.
- Registra fuentes, fecha de revisión y limitaciones.

Crea y mantén:

- `docs/COMPETITOR_BENCHMARK.md`
- `docs/FEATURE_MATRIX.md`
- `docs/PRODUCT_GAPS.md`
- `docs/NUTRI_OLI_FUNCTIONAL_SCOPE.md`
- `docs/USER_FLOWS.md`
- `docs/CLINICAL_SAFETY_RULES.md`
- `docs/LEGAL_REVIEW_REQUIRED.md`

Para cada competidor documenta:

- público objetivo;
- módulos;
- flujo profesional;
- flujo del cliente;
- fortalezas;
- limitaciones;
- diferenciales;
- riesgos clínicos;
- riesgos de privacidad;
- funciones que no conviene replicar;
- ideas adaptables con diseño propio.

---

# 2. Funcionalidades de referencia

## 2.1 Nutrium: plataforma integral profesional-cliente

Analiza estas familias:

### Evaluación y planificación

- Análisis nutricional de alimentos.
- Planes alimentarios personalizados.
- Cálculos automáticos de energía, macronutrientes y micronutrientes.
- Plantillas reutilizables.
- Biblioteca de recetas.
- Recomendaciones.
- Diario alimentario.
- Seguimiento de hábitos, conducta y progreso.

### Gestión de consulta

- Agenda y reservas.
- Recordatorios.
- Gestión de clientes.
- Perfiles clínicos.
- Pagos y facturación.
- Acceso administrativo.
- Consultas online e integraciones de videollamada.

### Experiencia del cliente

- App o portal.
- Acceso al plan.
- Registro de ingestas.
- Registro de peso y progreso.
- Chat.
- Recordatorios.
- Recomendaciones.
- Visualización de evolución.

### Recursos

- Infografías.
- Material educativo.
- Formación profesional.
- Página web o blog.

**Aprendizaje para Nutri-Oli:** integrar trabajo clínico y seguimiento. El dashboard debe mostrar consultas, mensajes, registros, consentimientos, controles y planes que requieren atención.

---

## 2.2 ICNS Health Software: dieta calibrada, equivalencias y seguimiento

Analiza:

### Dietas

- Menús semanales.
- Nutrientes en tiempo real.
- Dietas calibradas.
- Pautas abiertas.
- Equivalencias.
- Comentarios.
- Recetas propias y de biblioteca.
- Plantillas.
- Reutilización entre clientes.
- Duplicación de días.
- PDF.
- Acceso desde la app del cliente.

### Gestión clínica

- Entrevista dietética personalizable.
- Evolución y gráficas.
- Antropometría.
- Bioimpedancia.
- Registro de ingestas con fotos o vídeo.
- Feedback profesional.
- Analíticas.
- Actividad física.
- Citas.
- Historial de pautas.
- Chat.

### Portal del cliente

- Ingestas.
- Peso.
- Medidas.
- Progreso.
- Pautas.
- Feedback.
- Reserva.
- Chat.
- Activación granular de funciones por cliente.

### Alimentos y recetas

- Biblioteca de recetas filtrable.
- Recetas propias.
- Adaptación al cliente.
- PDFs con identidad profesional.
- Búsqueda por categoría, patrón o ingrediente.
- Base de alimentos.
- Medidas caseras.
- Nutrientes detallados.
- Alimentos propios.

**Aprendizaje para Nutri-Oli:** permitir menú cerrado, pauta abierta, equivalencias, método del plato, frecuencias, objetivos conductuales y combinación de métodos.

---

## 2.3 DietoPro: automatización y herramientas complementarias

Analiza:

- Generación asistida de planes.
- Edición profesional.
- Patologías y recomendaciones.
- Interacciones fármaco-nutriente.
- Entrevistas personalizables.
- Seguimiento online.
- App del profesional y del cliente.
- Planes, recetas, intercambios y lista de compra.
- Chat.
- Material educativo.
- Comunicación individual o segmentada.
- Herramientas de intervención conductual.

**Aprendizaje para Nutri-Oli:** la automatización solo debe crear borradores. Debe explicar entradas, reglas y límites, requerir revisión y publicación profesional y conservar auditoría. No construyas una base de interacciones mediante scraping.

---

## 2.4 Nutriplo: simplicidad clínica y documentación

Analiza:

- Pacientes.
- Historial.
- Antecedentes.
- Evaluaciones.
- Evolución.
- Notas clínicas.
- Contacto y emergencia.
- Anamnesis guiada.
- Antropometría.
- Objetivos.
- Diagnóstico nutricional profesional.
- Indicaciones.
- PDF.
- Calendario.
- Estados y modalidades de cita.
- Precio y notas.
- Gráficas.
- Estadísticas.
- Documentos con logo, firma y datos profesionales.

**Aprendizaje para Nutri-Oli:** una consulta habitual debe completarse desde un flujo simple: revisar, iniciar control, registrar evolución y medidas, actualizar objetivos y plan, publicar y programar revisión.

---

## 2.5 Sabea: IA supervisada, ISAK y documentación digital

Analiza:

- Expediente clínico.
- Historia.
- Antropometría compatible con ISAK.
- Analíticas.
- Hábitos.
- Contexto social.
- Borradores con IA.
- Modos clínicos.
- Revisión profesional.
- Firma y colegiación.
- Documentos trazables.
- Consentimientos digitales.
- PWA del cliente.
- Multiagenda y multicentro.
- Tipos de servicio.
- Calendarios externos.

**Aprendizaje para Nutri-Oli:** la IA es un asistente, no un profesional autónomo. Conserva autor, fecha, versión, entradas, modificaciones, aprobación y documento publicado. No afirmes validez jurídica automática.

---

# 3. Matriz comparativa obligatoria

Crea una tabla:

| Área | Función | Nutrium | ICNS | DietoPro | Nutriplo | Sabea | Nutri-Oli | Prioridad | Evidencia |
|---|---|---|---|---|---|---|---|---|---|

Valores para competidores:

- Anunciada.
- Observada.
- No encontrada.
- No verificada.
- No aplicable.

Valores para Nutri-Oli:

- MVP.
- Fase 2.
- Fase 3.
- Opcional.
- Descartada.

Evalúa cada función según:

- valor clínico;
- frecuencia de uso;
- ahorro de tiempo;
- coste;
- complejidad;
- seguridad;
- privacidad;
- mantenimiento;
- dependencia externa;
- ventaja real.

No incorpores una función únicamente porque un competidor la tenga.

---

# 4. Alcance funcional objetivo de Nutri-Oli

## 4.1 Dashboard profesional

- Próxima cita.
- Agenda del día.
- Mensajes.
- Clientes nuevos.
- Controles pendientes.
- Formularios pendientes.
- Planes en borrador.
- Recomendaciones.
- Consentimientos.
- Tareas.
- Evolución reciente.
- Accesos rápidos.
- Filtros por periodo, centro y profesional.

## 4.2 Agenda

- Día, semana y mes.
- Crear, mover, editar y cancelar.
- Tipos de servicio.
- Duración y precio.
- Presencial u online.
- Centros.
- Disponibilidad.
- Bloqueos y vacaciones.
- Recordatorios.
- Estados.
- Prevención de solapamientos.
- Historial.
- Exportación iCalendar.
- Integración futura con calendarios.
- Reserva pública y lista de espera opcionales.

## 4.3 Clientes

- Alta manual.
- Invitación segura.
- Búsqueda y filtros.
- Etiquetas.
- Estado.
- Profesional asignado.
- Última y próxima visita.
- Objetivo.
- Contacto.
- Emergencia.
- Tutor legal.
- Consentimientos.
- Preferencias de comunicación.
- Exportación.
- Auditoría.

## 4.4 Expediente nutricional

- Motivo.
- Objetivos.
- Antecedentes.
- Patologías comunicadas.
- Alergias e intolerancias.
- Medicación y suplementos.
- Analíticas.
- Síntomas.
- Historia ponderal.
- Patrón alimentario.
- Recordatorio de 24 horas.
- Frecuencia.
- Preferencias y aversiones.
- Horarios.
- Presupuesto.
- Cocina.
- Trabajo y convivencia.
- Sueño.
- Estrés.
- Actividad.
- Entrenamiento.
- Hidratación.
- Salud menstrual.
- Embarazo y lactancia.
- Digestivo.
- Barreras.
- Notas y documentos.

Los formularios deben ser configurables, versionados, guardables como borrador y diferenciados entre dato declarado, medido, estimado y calculado.

## 4.5 Consultas y controles

- Iniciar desde una cita.
- Revisar información anterior.
- Evolución.
- Adherencia.
- Síntomas.
- Medidas.
- Objetivos.
- Barreras.
- Diagnóstico nutricional profesional.
- Intervención.
- Monitorización.
- Tareas.
- Recomendaciones.
- Modificación de plan.
- Resumen compartido.
- Próxima cita.
- ADIME y PES opcionales.
- Borrador, finalización, revisiones y addenda.
- Nota privada y contenido compartido separados.

## 4.6 Antropometría

Módulo compatible con práctica ISAK, sin afirmar certificación:

- Masa.
- Talla.
- Talla sentada.
- Envergadura.
- Pliegues.
- Perímetros.
- Diámetros.
- Longitudes.
- Medidas personalizadas.
- Repeticiones.
- Valores brutos.
- Discrepancias.
- Valor final.
- Instrumental y calibración.
- Antropometrista.
- Protocolo.
- Comparativa y gráficas.
- PDF.
- Visibilidad para cliente.

Cálculos versionados:

- IMC.
- Cintura/talla.
- Sumatorios.
- Cambios.
- Error técnico.
- Somatotipo cuando se valide.
- Ecuaciones de composición corporal seleccionadas por el profesional.
- Fuente, población, unidades, versión y limitaciones.

No inventar fórmulas, tolerancias o rangos.

## 4.7 Bioimpedancia

- Datos originales.
- Marca y modelo.
- Condiciones.
- Indicadores.
- Método.
- Comparativa.
- Advertencia al comparar dispositivos.
- Importación controlada.

## 4.8 Analíticas

- Informe adjunto.
- Parámetro.
- Valor.
- Unidad.
- Rango del laboratorio.
- Fecha.
- Laboratorio.
- Tendencia.
- Comentarios.
- Sin diagnóstico automático.

## 4.9 Planificación dietética

Modalidades:

- Menú.
- Día tipo.
- Dieta calibrada.
- Equivalencias.
- Intercambios.
- Pauta abierta.
- Método del plato.
- Frecuencias.
- Recomendaciones.
- Objetivos conductuales.
- Plan deportivo.

Editor:

- Días y comidas.
- Horarios.
- Alimentos y recetas.
- Cantidades y medidas caseras.
- Comentarios.
- Alternativas.
- Sustituciones.
- Duplicar comidas, días y semanas.
- Plantillas.
- Búsqueda y filtros.
- Totales en tiempo real.
- Objetivo frente a plan.
- Energía, macros, fibra y micronutrientes.
- Alérgenos.
- Lista de compra.
- PDF.
- Portal.
- Versionado.
- Borrador, publicación y archivo.

## 4.10 Necesidades nutricionales

- Fórmulas versionadas.
- Selección manual.
- Gasto energético.
- Actividad.
- Objetivo.
- Macronutrientes.
- Fibra.
- Hidratación.
- Micronutrientes.
- Deporte.
- Ajuste manual.
- Justificación.
- Pasos, unidades, población y límites.

## 4.11 Alimentos

- Fuentes y licencias.
- Valores por 100 g o ml.
- Porciones y medidas caseras.
- Nutrientes.
- Sinónimos.
- Marca.
- Categoría.
- Temporada.
- Alérgenos.
- Verificación.
- Alimentos propios.
- Búsqueda y filtros.
- Importación CSV.
- Duplicados.
- Historial.

No copiar bases propietarias.

## 4.12 Recetas

- Ingredientes.
- Pesos.
- Rendimiento y raciones.
- Preparación.
- Tiempo.
- Categorías.
- Etiquetas.
- Alérgenos.
- Nutrientes.
- Foto licenciada.
- Adaptaciones.
- Versionado.
- PDF y portal.

## 4.13 Equivalencias

- Grupos.
- Raciones.
- Medidas caseras.
- Sustituciones.
- Reglas.
- Plantillas.
- Vista sencilla para cliente.
- Historial.

## 4.14 Portal o PWA del cliente

- Inicio.
- Plan activo.
- Próxima cita.
- Objetivos y tareas.
- Recomendaciones.
- Recetas.
- Equivalencias.
- Lista de compra.
- Diario.
- Fotografías.
- Peso y medidas habilitadas.
- Actividad y síntomas.
- Progreso autorizado.
- Reserva o solicitud.
- Mensajes.
- Consentimientos.
- Documentos.
- Cuenta y sesiones.

El profesional controla qué funciones y métricas ve cada cliente.

## 4.15 Diario y seguimiento

- Comida.
- Texto.
- Alimento o receta.
- Foto o vídeo opcional.
- Hora.
- Hambre y saciedad.
- Contexto.
- Síntomas.
- Comentario.
- Feedback.
- Cambios.
- Análisis opcional.
- Privacidad y retención.

Evitar diseño culpabilizador o vigilancia excesiva.

## 4.16 Progreso

- Antropometría.
- Bioimpedancia.
- Objetivos.
- Hábitos.
- Síntomas.
- Actividad.
- Ingestas.
- Analíticas.
- Hitos.
- Gráficas y tablas.
- Comentarios.
- Vistas diferenciadas.

## 4.17 Mensajería

- Conversaciones.
- Adjuntos privados.
- Leído.
- Archivado.
- Categorías.
- Búsqueda.
- Notificaciones.
- Plantillas.
- Horario de atención.
- Aviso de no urgencias.
- Comunicación segmentada opcional.
- Sin datos clínicos en emails.
- Auditoría.

## 4.18 Recomendaciones y recursos

- Texto.
- PDF.
- Vídeo.
- Enlace.
- Infografía propia.
- Receta.
- Categorías.
- Autor.
- Fecha de revisión.
- Validación.
- Versionado.
- Asignación.
- Confirmación de lectura.
- Identidad profesional.

## 4.19 PDFs

- Evaluación.
- Consulta.
- Antropometría.
- Evolución.
- Plan.
- Recetas.
- Equivalencias.
- Recomendaciones.
- Consentimientos.
- Exportación completa.

Con logo, datos profesionales, colegiación, fecha, versión, pie de confidencialidad, idioma y control de secciones.

## 4.20 Consentimientos

- Privacidad.
- Tratamiento.
- Asistencia.
- Comunicaciones.
- Fotografías.
- Teleconsulta.
- Menores.
- Versión.
- Fecha.
- Aceptación.
- Revocación.
- Evidencia.
- Exportación.
- Revisión jurídica pendiente.

## 4.21 Pagos y administración, opcional

- Servicios y precios.
- Estado de pago.
- Bonos.
- Suscripciones.
- Descuentos.
- Stripe.
- Pago previo.
- Cancelaciones.
- Recibos.
- Facturación únicamente tras validación para España.

## 4.22 Equipos y centros

- Organizaciones.
- Centros.
- Propietario.
- Nutricionistas.
- Asistentes.
- Roles.
- Asignaciones.
- Agendas.
- Servicios.
- Identidad.
- Auditoría.

## 4.23 Colectividades, fase futura

- Ciclos de menú.
- Fichas técnicas.
- Recetas.
- Raciones.
- Alérgenos.
- Nutrientes.
- Edades.
- Frecuencias.
- Informes.
- Costes.
- Centros.
- Integración separada con APPCC.

No incluir en MVP salvo prioridad expresa.

---

# 5. Diferenciales de Nutri-Oli

Evalúa e implementa:

## Consulta guiada

Una pantalla para revisar resumen, evolución, métricas, objetivos, notas, plan, tareas y próxima cita.

## Visibilidad clara

Cada elemento debe ser:

- privado;
- pendiente;
- compartido;
- publicado;
- retirado.

## Versionado real

Planes, notas, recomendaciones, consentimientos, recetas, protocolos y ecuaciones.

## Antropometría rigurosa

Valores brutos, repeticiones, discrepancias, equipo, calibración, ETM, fórmula y limitaciones.

## Intervención flexible

No asumir que nutrición siempre equivale a dieta semanal.

## Explicabilidad

Cada cálculo debe mostrar fórmula, datos, unidades, versión, aprobador y límites.

## Privacidad por diseño

RLS, almacenamiento privado, URLs firmadas, auditoría, exportación, retención, aislamiento y logs sin datos de salud.

## PWA antes que apps nativas

Validar primero un portal instalable y responsive.

## IA prudente

Puede estructurar, resumir y proponer borradores. Nunca diagnostica, prescribe, publica ni modifica medicación.

---

# 6. Priorización

Usa:

- MUST.
- SHOULD.
- COULD.
- WON'T NOW.

MVP mínimo:

1. Auth y roles.
2. RLS.
3. Clientes.
4. Agenda.
5. Expediente.
6. Consultas.
7. Antropometría.
8. Alimentos.
9. Recetas.
10. Planes.
11. Portal.
12. Progreso.
13. Mensajes.
14. Recomendaciones.
15. Documentos.
16. Consentimientos.
17. PDFs.
18. Auditoría.
19. Exportación.
20. Tests de seguridad.

IA, pagos, colectividades y apps nativas no deben retrasar el núcleo.

---

# 7. Casos de aceptación

## Profesional

Debe poder:

- crear e invitar cliente;
- programar cita;
- completar anamnesis;
- registrar consulta;
- registrar antropometría con repeticiones;
- detectar discrepancias;
- crear alimentos y recetas;
- crear menú y pauta por equivalencias;
- duplicar días;
- publicar versiones;
- generar PDF;
- asignar recomendaciones;
- revisar diario;
- responder mensajes;
- ver evolución;
- exportar;
- revocar acceso.

## Cliente

Debe poder:

- aceptar invitación;
- aceptar consentimiento;
- ver solo sus datos;
- consultar plan;
- consultar alternativas y recetas;
- registrar ingestas;
- registrar progreso;
- enviar mensajes;
- solicitar cita;
- descargar documentos;
- cerrar sesiones.

## Seguridad

Demuestra que:

- Cliente A no ve Cliente B.
- Organización A no ve Organización B.
- Un asistente no ve notas privadas.
- Los archivos no son públicos.
- Las URLs firmadas caducan.
- Cambiar un UUID no da acceso.
- Una sesión revocada deja de funcionar.
- Un borrador no aparece al cliente.
- Las revisiones conservan historial.
- Los emails no contienen información clínica.

---

# 8. Resultado esperado

Al finalizar el benchmark entrega:

```text
BENCHMARK NUTRI-OLI

Funciones comunes que debe cubrir:
- ...

Funciones diferenciales:
- ...

Funciones que deben simplificarse:
- ...

Funciones que no deben copiarse:
- ...

Riesgos clínicos:
- ...

Riesgos legales o de privacidad:
- ...

MVP:
- ...

Fases posteriores:
- ...

Decisiones pendientes:
- ...

Próxima acción automática:
- ...
```

Después continúa con la implementación. No te detengas tras el benchmark salvo bloqueo real.
