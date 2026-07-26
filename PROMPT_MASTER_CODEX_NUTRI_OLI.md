# PROMPT MAESTRO PARA CODEX — NUTRI-OLI

## 0. Rol y misión

Actúa como un equipo sénior completo de producto y software, coordinado por un **orquestador principal**. Debes asumir simultáneamente, o mediante agentes/worktrees separados cuando el entorno lo permita, estos roles:

- Principal software engineer y arquitecto.
- Product manager.
- Diseñador UX/UI.
- Especialista en PostgreSQL y Supabase.
- Security engineer especializado en aplicaciones sanitarias.
- Especialista funcional en dietética, nutrición clínica y nutrición deportiva.
- Especialista en antropometría compatible con metodología ISAK.
- QA engineer y especialista en accesibilidad.
- DevOps engineer para GitHub, Supabase y Vercel.
- Revisor independiente y red-team técnico.

Tu misión es **diseñar, construir, probar, documentar y dejar desplegable una aplicación web llamada “Nutri-Oli”**, destinada inicialmente a un único dietista-nutricionista en España, pero preparada para incorporar colaboradores en el futuro.

Nutri-Oli tendrá:

1. Área profesional para el dietista-nutricionista.
2. Portal privado para cada cliente.
3. Gestión de agenda, clientes, historia nutricional, controles, antropometría, planes dietéticos, recomendaciones, mensajería, evolución y documentación.
4. Arquitectura segura para datos de salud.
5. Despliegue reproducible mediante GitHub + Supabase + Vercel.
6. Identidad propia. Las capturas adjuntas son únicamente referencia funcional y de composición visual. **No hagas una copia exacta de Nutrium, no reutilices su marca, textos, ilustraciones, iconos, CSS, recursos ni trade dress.**

Nombre del producto: **Nutri-Oli**
Slug técnico preferido: `nutri-oli`
Idioma inicial de la interfaz: español.
Preparar internacionalización para catalán desde el inicio.
Zona horaria predeterminada: `Europe/Madrid`.
Sistema de unidades predeterminado: métrico/SI.
Formato de fecha predeterminado: `dd/MM/yyyy`.
Formato monetario: EUR, locale `es-ES`.

---

# 1. Forma de trabajar: autonomía con supervisión automática

## 1.1 Principio general

No te limites a producir un plan, una maqueta o archivos aislados. Debes avanzar de forma autónoma desde el análisis hasta una aplicación funcional, probada y documentada.

No declares el proyecto terminado mientras no se cumpla la definición de terminado incluida al final.

## 1.2 Cuándo puedes preguntar al usuario

No solicites confirmación para decisiones técnicas reversibles. Escoge la opción más segura, simple y mantenible y registra la decisión.

Solo puedes bloquearte y pedir intervención humana cuando falte uno de estos elementos:

- Autorización para crear o conectar el repositorio privado de GitHub.
- Inicio de sesión o token para Supabase, GitHub o Vercel.
- Elección irreversible relacionada con dominio, facturación o contratación de un servicio de pago.
- Validación profesional de contenido clínico, ecuaciones o documentos legales antes de producción.
- Credenciales que el usuario deba introducir personalmente.
- Una decisión de negocio que cambie materialmente el alcance o el tratamiento legal de los datos.

Cuando exista un bloqueo:

1. Completa primero todo lo que pueda hacerse localmente.
2. Deja preparado el código, scripts y documentación.
3. Explica el bloqueo con una lista exacta de acciones que debe ejecutar el usuario.
4. No pidas contraseñas en el chat.
5. Continúa automáticamente en cuanto el bloqueo desaparezca.

## 1.3 Artefactos obligatorios de gestión

Crea y mantén actualizados:

- `README.md`
- `AGENTS.md`
- `docs/MASTER_PLAN.md`
- `docs/STATUS.md`
- `docs/ASSUMPTIONS.md`
- `docs/DECISIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/DATA_DICTIONARY.md`
- `docs/RLS_MATRIX.md`
- `docs/SECURITY.md`
- `docs/THREAT_MODEL.md`
- `docs/CLINICAL_VALIDATION.md`
- `docs/ISAK_COMPATIBILITY.md`
- `docs/PRIVACY_CHECKLIST.md`
- `docs/DEPLOYMENT.md`
- `docs/OPERATIONS.md`
- `docs/TEST_STRATEGY.md`
- `docs/USER_ACCEPTANCE_TESTS.md`
- `docs/CHANGELOG.md`

`docs/STATUS.md` debe indicar en todo momento:

- Fase actual.
- Trabajo completado.
- Trabajo pendiente.
- Bloqueos.
- Riesgos.
- Último commit.
- Últimos comandos de validación ejecutados y su resultado.
- Próxima acción automática.

## 1.4 Uso de GitHub

Si existe acceso autorizado:

1. Crea un repositorio **privado** llamado `nutri-oli`.
2. Inicializa Git.
3. Crea issues y milestones por fases.
4. Usa ramas pequeñas y descriptivas:
   - `feat/...`
   - `fix/...`
   - `security/...`
   - `chore/...`
5. Usa Conventional Commits.
6. Toda funcionalidad relevante debe entrar mediante pull request.
7. Ningún agente que implemente una funcionalidad debe aprobar por sí solo su propio PR.
8. Activa, cuando los permisos lo permitan:
   - protección de la rama principal;
   - obligatoriedad de CI;
   - revisión de código;
   - secret scanning;
   - Dependabot o mecanismo equivalente;
   - borrado automático de ramas ya fusionadas.
9. No hagas push de secretos, volcados de producción, datos reales de pacientes ni archivos `.env`.

## 1.5 Orquestación de agentes

Cuando Codex permita agentes paralelos/worktrees, usa esta distribución:

### Agente A — Arquitectura y producto
- Mantiene el plan.
- Define los límites de módulos.
- Evita sobrearquitectura.
- Revisa coherencia funcional.

### Agente B — Base de datos, Auth y RLS
- Diseña esquema y migraciones.
- Implementa Supabase Auth.
- Implementa y prueba todas las políticas RLS.
- Revisa almacenamiento privado.

### Agente C — Frontend profesional
- Construye dashboard y área profesional.
- Implementa formularios, tablas, agenda y planificación dietética.
- Mantiene accesibilidad y responsive.

### Agente D — Portal del cliente
- Construye acceso del cliente.
- Implementa seguimiento, mensajería, planes, documentos y consentimientos.
- Verifica que un cliente nunca pueda consultar información ajena.

### Agente E — Dominio clínico y antropometría
- Modela controles, anamnesis, objetivos, antropometría y cálculos.
- Documenta cada fórmula.
- Impide inferencias clínicas no validadas.

### Agente F — QA, seguridad y red-team
- No implementa inicialmente.
- Intenta romper aislamiento entre usuarios.
- Busca IDOR, fallos de RLS, exposición de archivos, XSS, fuga de PII, errores de cálculo y problemas de accesibilidad.
- Rechaza PRs sin evidencias.

### Agente G — DevOps
- CI/CD.
- Entornos.
- Preview deployments.
- Observabilidad.
- Backups y recuperación.

Si el entorno no permite agentes paralelos, ejecuta los mismos roles secuencialmente y deja constancia de qué “sombrero” está actuando en cada revisión.

## 1.6 Bucle obligatorio de autosupervisión

Para cada vertical funcional:

1. Planificar.
2. Implementar.
3. Añadir pruebas.
4. Ejecutar lint.
5. Ejecutar typecheck.
6. Ejecutar pruebas unitarias.
7. Ejecutar pruebas de integración.
8. Ejecutar pruebas E2E relevantes.
9. Ejecutar build de producción.
10. Revisar seguridad.
11. Revisar accesibilidad.
12. Revisar cálculos clínicos.
13. Revisar el diff como revisor independiente.
14. Corregir todos los fallos.
15. Repetir hasta que los gates pasen.
16. Abrir PR con evidencias.
17. Fusionar solo cuando el PR cumpla los criterios.
18. Actualizar documentación y estado.

Prohibido:

- Ocultar tests fallidos.
- Desactivar tests para pasar CI.
- Sustituir funcionalidades reales por mocks en producción.
- Dejar `TODO` en rutas críticas sin issue enlazada.
- Usar `any` de TypeScript sin justificación documentada.
- Marcar una fase como terminada basándose solo en que “compila”.
- Afirmar cumplimiento legal o certificación clínica sin revisión humana.

---

# 2. Arquitectura técnica objetivo

## 2.1 Principio arquitectónico

Construye un **monolito modular** y mantenible. No uses microservicios salvo necesidad demostrada. Prioriza una base sencilla para una consulta individual.

## 2.2 Stack preferido

Usa versiones estables y compatibles en el momento de implementación:

- Next.js con App Router.
- React.
- TypeScript en modo estricto.
- `pnpm`.
- Tailwind CSS.
- Componentes accesibles basados en Radix UI o shadcn/ui, personalizados con identidad propia.
- Supabase:
  - PostgreSQL.
  - Auth.
  - Storage.
  - Realtime solo donde aporte valor.
  - Edge Functions únicamente cuando sea la opción más adecuada.
- Validación compartida mediante Zod.
- React Hook Form para formularios complejos.
- `@supabase/ssr` o la solución oficial vigente para autenticación SSR.
- `next-intl` o alternativa estable para i18n.
- Librería de fechas estable con soporte de zona horaria.
- Librería de gráficos accesible y ligera.
- Playwright para E2E.
- Vitest y Testing Library para unitarias/componentes.
- pgTAP o pruebas SQL equivalentes para base de datos y RLS.
- ESLint y Prettier.
- GitHub Actions.
- Vercel para despliegue web.
- Supabase CLI para desarrollo local y migraciones.

No introduzcas dependencias innecesarias. Antes de añadir una librería, registra:

- Problema que resuelve.
- Alternativas consideradas.
- Coste de mantenimiento.
- Riesgo de privacidad.
- Licencia.

## 2.3 Estructura orientativa

```text
nutri-oli/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── (professional)/
│   │   ├── (client)/
│   │   └── api/
│   ├── components/
│   ├── features/
│   │   ├── agenda/
│   │   ├── clients/
│   │   ├── consultations/
│   │   ├── anthropometry/
│   │   ├── diet-plans/
│   │   ├── foods/
│   │   ├── recipes/
│   │   ├── recommendations/
│   │   ├── messaging/
│   │   ├── progress/
│   │   ├── documents/
│   │   └── settings/
│   ├── lib/
│   ├── server/
│   ├── styles/
│   ├── types/
│   └── test/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   ├── tests/
│   └── functions/
├── public/
├── docs/
├── scripts/
├── .github/
│   └── workflows/
└── ...
```

La estructura final puede variar si existe una razón mejor documentada.

## 2.4 Entornos

Configura:

- Local.
- Preview por pull request.
- Producción.

Mantén separación estricta entre proyectos/datos de desarrollo y producción.

Variables esperadas, adaptadas a los nombres oficiales vigentes:

- URL pública de Supabase.
- Clave pública/anon de Supabase.
- Service role exclusivamente en servidor seguro cuando sea imprescindible.
- URL del sitio.
- Secretos para cron/webhooks.
- Configuración de correo.
- Configuración opcional de errores/monitorización.

Crea `.env.example` sin valores reales y documenta cada variable.

Nunca expongas al navegador:

- Service role.
- Secretos de firma.
- Tokens administrativos.
- Credenciales de correo.
- Datos de otros clientes.

---

# 3. Identidad y experiencia de usuario

## 3.1 Referencia visual

Usa las capturas adjuntas para entender:

- Navegación lateral.
- Dashboard con tarjetas.
- Agenda semanal.
- Listado de clientes.
- Mensajería.
- Feed de progreso.
- Biblioteca de alimentos.

No reproduzcas la interfaz píxel a píxel.

## 3.2 Identidad Nutri-Oli

Crea una identidad original:

- Marca: `Nutri-Oli`.
- Concepto visual: nutrición clínica moderna, cercana y rigurosa.
- Motivo opcional: hoja de olivo abstracta.
- Paleta propia basada en:
  - verde oliva;
  - salvia;
  - azul claro para información;
  - ámbar para avisos;
  - rojo únicamente para alertas.
- Alto contraste.
- Tipografía legible.
- Iconografía coherente y con licencia compatible.
- Modo claro obligatorio.
- Modo oscuro opcional, solo si no retrasa el núcleo.
- Diseño responsive desde móvil a escritorio.
- WCAG 2.2 AA como objetivo.
- Navegación completa con teclado.
- Estados de carga, vacío, error, éxito y permisos insuficientes.
- Nada importante debe depender únicamente del color.

## 3.3 Navegación profesional propuesta

- Inicio.
- Agenda.
- Clientes.
- Consultas.
- Antropometría.
- Planes dietéticos.
- Alimentos.
- Recetas.
- Equivalencias.
- Plantillas.
- Recomendaciones.
- Mensajes.
- Progreso.
- Documentos.
- Pagos, opcional.
- Configuración.

## 3.4 Navegación del cliente propuesta

- Inicio.
- Mi plan.
- Mis citas.
- Mi progreso.
- Mis registros.
- Recomendaciones.
- Mensajes.
- Documentos.
- Consentimientos.
- Mi cuenta.

---

# 4. Usuarios, organizaciones y permisos

Aunque inicialmente sea para un único profesional, modela una organización/consulta para no bloquear el crecimiento.

Roles mínimos:

- `owner`: propietario de la consulta.
- `nutritionist`: profesional clínico autorizado.
- `assistant`: acceso administrativo limitado, sin notas clínicas salvo permiso explícito.
- `client`: acceso únicamente a su propia información compartida.
- `auditor`: opcional, solo lectura y uso interno.

Principios:

- Denegación por defecto.
- Menor privilegio.
- Separación entre datos internos y datos compartidos con el cliente.
- El frontend nunca sustituye a RLS.
- Cada acción sensible debe validarse en servidor y base de datos.
- Un profesional solo accede a clientes de su organización y asignación.
- Un cliente solo accede a su propio perfil y a elementos explícitamente publicados.
- Un asistente no accede a información clínica por defecto.
- Las notas privadas nunca aparecen en el portal.
- Los archivos clínicos son privados y se sirven mediante URLs firmadas de duración breve.

Autenticación:

- Email + contraseña o enlace mágico para clientes.
- Verificación de email.
- Recuperación segura.
- MFA obligatorio o fuertemente recomendado para profesionales.
- Revocación de sesiones.
- Gestión de dispositivos/sesiones si la plataforma lo permite.
- Bloqueo/rate limiting frente a abuso.
- Invitación de cliente con token de un solo uso y caducidad.
- Nunca crear contraseñas conocidas por el profesional.
- Registro libre de clientes desactivado por defecto.

---

# 5. Funcionalidades del área profesional

## 5.1 Dashboard

Mostrar:

- Próxima consulta.
- Consultas de hoy y próximas.
- Clientes nuevos.
- Primeras consultas.
- Seguimientos.
- Tareas pendientes.
- Formularios pendientes.
- Mensajes no leídos.
- Planes pendientes de publicar.
- Consentimientos pendientes.
- Controles atrasados.
- Evoluciones relevantes.
- Accesos rápidos.

Permitir filtros por periodo y profesional.

## 5.2 Agenda

Funciones:

- Vista día, semana y mes.
- Crear, editar, reprogramar y cancelar cita.
- Tipos de servicio:
  - primera visita;
  - seguimiento;
  - antropometría;
  - consulta online;
  - revisión breve;
  - tipo personalizado.
- Duración y precio orientativos configurables.
- Modalidad presencial/online.
- Ubicación.
- Disponibilidad y horario profesional.
- Tiempo de margen entre consultas.
- Bloqueos y vacaciones.
- Estado:
  - solicitada;
  - confirmada;
  - realizada;
  - cancelada;
  - no presentada.
- Notas administrativas.
- Enlace de videollamada configurable.
- Recordatorios por correo sin incluir información clínica sensible.
- Exportación `.ics`.
- Integración futura con Google Calendar mediante feature flag.
- Historial de cambios.
- Prevención de doble reserva.
- Zona horaria coherente.

## 5.3 Clientes

Listado con:

- Nombre.
- Identificador interno.
- Contacto.
- Estado.
- Profesional asignado.
- Última consulta.
- Próxima consulta.
- Objetivo principal.
- Alertas visibles sin exponer detalles innecesarios.
- Etiquetas.
- Buscador y filtros.
- Paginación.
- Exportación controlada.

Alta de cliente:

- Datos identificativos mínimos.
- Datos de contacto.
- Fecha de nacimiento.
- Sexo registrado solo cuando sea clínicamente necesario y con terminología respetuosa.
- Dirección opcional.
- Contacto de emergencia opcional.
- Tutor legal para menores.
- Profesional asignado.
- Consentimientos.
- Preferencias de comunicación.
- Invitación al portal.

Nunca uses datos reales en seeds o screenshots de desarrollo.

## 5.4 Ficha integral del cliente

Pestañas:

1. Resumen.
2. Historia nutricional/anamnesis.
3. Consultas.
4. Antropometría.
5. Dietas.
6. Objetivos.
7. Registros.
8. Analíticas.
9. Actividad.
10. Recomendaciones.
11. Mensajes.
12. Documentos.
13. Consentimientos.
14. Auditoría accesible solo al profesional autorizado.

Resumen clínico:

- Objetivo principal.
- Diagnósticos médicos comunicados por el cliente.
- Alergias e intolerancias.
- Medicación.
- Suplementos.
- Alertas.
- Últimas métricas.
- Próxima revisión.
- Plan activo.
- Adherencia.
- Tareas.

## 5.5 Anamnesis nutricional

Crear formularios versionados y configurables:

- Motivo de consulta.
- Objetivos y expectativas.
- Antecedentes personales y familiares.
- Patologías diagnosticadas.
- Síntomas digestivos.
- Alergias e intolerancias.
- Medicación y suplementos.
- Cirugías.
- Analíticas aportadas.
- Historia ponderal.
- Relación con la comida.
- Posibles señales de trastorno de la conducta alimentaria, sin diagnosticar automáticamente.
- Patrón alimentario.
- Recordatorio de 24 horas.
- Frecuencia de consumo.
- Preferencias, aversiones y restricciones.
- Cultura y religión, solo si el cliente decide aportarlo.
- Horarios.
- Trabajo y contexto familiar.
- Presupuesto.
- Capacidad culinaria.
- Sueño.
- Estrés.
- Actividad física.
- Entrenamiento y competición.
- Hidratación.
- Alcohol y tabaco cuando sea pertinente.
- Salud menstrual.
- Embarazo y lactancia.
- Menopausia.
- Salud gastrointestinal.
- Objetivos deportivos.
- Barreras y facilitadores.
- Disponibilidad para el cambio.

Permitir guardar borrador, validar campos obligatorios y comparar cambios entre revisiones.

## 5.6 Consultas y controles

Usa un modelo clínico estructurado, compatible con ADIME cuando sea útil:

- Assessment.
- Nutrition diagnosis/PES, introducido por el profesional.
- Intervention.
- Monitoring and evaluation.

Cada consulta debe permitir:

- Tipo.
- Fecha/hora.
- Profesional.
- Motivo.
- Evolución.
- Síntomas.
- Adherencia.
- Barreras.
- Cambios acordados.
- Objetivos SMART.
- Métricas.
- Plan actualizado.
- Recomendaciones.
- Tareas del profesional.
- Tareas del cliente.
- Próxima revisión.
- Nota privada.
- Resumen compartible.
- Adjuntos.
- Firma/confirmación opcional.
- Estado borrador/finalizado.

Una nota finalizada no debe modificarse silenciosamente. Implementa:

- versionado;
- correcciones mediante addendum;
- auditoría;
- autor, fecha y motivo del cambio.

## 5.7 Objetivos y seguimiento

- Objetivos cuantitativos y cualitativos.
- Fecha de inicio y revisión.
- Estado.
- Prioridad.
- Métrica asociada.
- Progreso.
- Barreras.
- Acciones.
- Comentarios del cliente.
- Gráficos longitudinales.
- Evitar lenguaje culpabilizador.

---

# 6. Antropometría compatible con metodología ISAK

## 6.1 Alcance y límites

Implementa un módulo profesional de antropometría **compatible con la práctica ISAK**, pero:

- No afirmes que Nutri-Oli está “certificado por ISAK”.
- No reproduzcas texto protegido del manual ISAK.
- No inventes tolerancias ni reglas.
- Permite que el profesional configure el protocolo conforme a su nivel de acreditación y a la edición vigente de su manual.
- Marca claramente qué campos o cálculos requieren validación profesional.
- Mantén un documento `docs/ISAK_COMPATIBILITY.md` con limitaciones y fuentes.

## 6.2 Perfil del antropometrista

Campos opcionales:

- Nombre.
- Nivel de acreditación.
- Número de acreditación.
- Fecha de expiración.
- Observaciones.
- Instrumental habitual.
- Estado de calibración.

No validar públicamente una acreditación salvo integración oficial autorizada.

## 6.3 Sesión antropométrica

Registrar:

- Cliente.
- Fecha y hora.
- Antropometrista.
- Protocolo/plantilla usada.
- Condiciones de medición.
- Observaciones.
- Instrumental.
- Fecha de calibración.
- Lado corporal cuando corresponda.
- Estado de la sesión:
  - borrador;
  - completa;
  - validada;
  - anulada.
- Motivo de corrección.
- Consentimiento para medición y fotos, cuando proceda.

## 6.4 Biblioteca configurable de medidas

Soportar, como mínimo, categorías configurables:

- Medidas básicas:
  - masa corporal;
  - talla;
  - talla sentada;
  - envergadura.
- Pliegues cutáneos.
- Perímetros.
- Diámetros óseos.
- Longitudes/alturas segmentarias.
- Otras medidas personalizadas.

Incluir inicialmente campos habituales de práctica antropométrica, pero mantener las plantillas editables y solicitar validación contra el manual ISAK vigente antes de producción.

Cada definición debe contener:

- Código interno.
- Nombre.
- Categoría.
- Unidad.
- Precisión.
- Número previsto de repeticiones.
- Umbral de discrepancia configurable.
- Rango plausible configurable, no diagnóstico.
- Instrucciones internas opcionales escritas por el profesional.
- Activa/inactiva.
- Orden.
- Versión.

## 6.5 Repeticiones y calidad técnica

- Introducción de dos o tres medidas.
- Conservación de valores brutos.
- Cálculo del valor final conforme a una regla configurable.
- Aviso cuando la discrepancia supera el umbral configurado.
- Solicitud de medición adicional.
- No borrar el valor original; corregir mediante revisión auditada.
- Cálculo de error técnico de medición y error técnico relativo cuando existan datos suficientes.
- Separar error intraobservador e interobservador.
- Explicar fórmula y entradas.
- Pruebas automatizadas con casos conocidos.
- No mostrar una falsa precisión superior a la del instrumento.

## 6.6 Cálculos y ecuaciones

Arquitectura de ecuaciones versionada:

- Identificador.
- Nombre.
- Fuente bibliográfica.
- Población de aplicación.
- Sexo/edad, si procede.
- Unidades de entrada.
- Fórmula.
- Versión.
- Estado:
  - disponible;
  - experimental;
  - desactivada.
- Limitaciones.
- Fecha de revisión.
- Profesional que la aprobó.

Cálculos básicos permitidos:

- IMC.
- Índice cintura/talla.
- Sumatorios de pliegues seleccionados.
- Cambios absolutos y porcentuales.
- Tendencias longitudinales.
- Otros índices configurados y validados.

Ecuaciones de composición corporal:

- No elegir automáticamente “la mejor”.
- Mostrar población y limitaciones.
- El profesional debe seleccionar la ecuación.
- Guardar exactamente qué ecuación y versión se utilizó.
- Guardar inputs y resultado reproducible.
- No usar `eval`.
- Usar una implementación tipada, segura y probada.
- No convertir estimaciones en diagnósticos.

## 6.7 Visualización e informes

- Tabla de valores brutos y finales.
- Comparación entre sesiones.
- Gráficas por medida.
- Sumatorios.
- Alertas de calidad.
- Informe PDF con:
  - fecha;
  - medidas;
  - evolución;
  - método;
  - ecuaciones utilizadas;
  - limitaciones;
  - firma profesional opcional.
- Control granular de qué se comparte con el cliente.
- Exportación CSV segura.
- Fotografías de progreso solo con consentimiento independiente y almacenamiento privado.

---

# 7. Planificación dietética

## 7.1 Principios

La aplicación ayuda al profesional; no prescribe de forma autónoma.

Toda sugerencia automática debe presentarse como borrador y requerir revisión antes de publicarse.

## 7.2 Estimación de necesidades

Permitir:

- Selección manual del método.
- Gasto energético estimado.
- Factor de actividad.
- Ajustes por objetivo.
- Distribución de macronutrientes.
- Objetivos de fibra, hidratación y micronutrientes.
- Notas clínicas.

Cada cálculo:

- Debe identificar fórmula, versión, unidades y población.
- Debe mostrar los pasos al profesional.
- Debe permitir sobrescritura con justificación.
- Debe conservar auditoría.
- No debe aplicar reglas clínicas opacas.

## 7.3 Editor de dieta

Funciones:

- Plan semanal.
- Días plantilla.
- Comidas configurables.
- Horarios.
- Alternativas por comida.
- Cantidades en gramos, mililitros, unidades y medidas caseras.
- Equivalencias.
- Intercambios.
- Sustituciones.
- Notas.
- Preparación.
- Objetivos nutricionales.
- Comparación objetivo vs plan.
- Totales por día y media semanal.
- Calorías, macronutrientes, fibra y micronutrientes disponibles.
- Alertas de alérgenos e incompatibilidades registradas.
- Preferencias y aversiones.
- Presupuesto y tiempo de cocina.
- Plan vegetariano/vegano y otros patrones.
- Días de entrenamiento/descanso.
- Estrategia pre/durante/post ejercicio.
- Hidratación.
- Lista de la compra.
- Impresión/PDF.
- Vista móvil del cliente.
- Duplicar semana.
- Plantillas.
- Versionado.
- Publicar/despublicar.
- Fecha de inicio y fin.
- Confirmación de lectura por parte del cliente.

## 7.4 Recomendaciones en lugar de menú cerrado

Permitir trabajar con:

- Método del plato.
- Raciones.
- Frecuencias.
- Intercambios.
- Reglas contextuales.
- Objetivos conductuales.
- Menú completo.
- Combinación de métodos.

## 7.5 Versionado

Toda dieta tendrá:

- Registro maestro.
- Versiones inmutables publicadas.
- Borradores editables.
- Historial.
- Motivo del cambio.
- Comparación entre versiones.
- Plan activo.
- Plan programado.
- Plan archivado.

El cliente solo ve versiones publicadas.

---

# 8. Alimentos, nutrientes, recetas y equivalencias

## 8.1 Base de alimentos

Implementar:

- Alimentos propios.
- Alimentos importados desde fuentes abiertas/licenciadas.
- Origen y licencia.
- Marca.
- Porción de referencia.
- Datos por 100 g/100 ml.
- Nutrientes.
- Alérgenos.
- Etiquetas.
- Densidad cuando sea necesaria.
- Estado verificado/no verificado.
- Fecha de actualización.
- Profesional que lo validó.
- Búsqueda rápida.
- Filtros.
- Paginación.
- Sinónimos.
- Evitar duplicados.
- Importación CSV con validación y vista previa.
- Protección contra CSV injection.
- Corrección auditada.

No hagas scraping masivo ni copies bases de datos con licencia restrictiva.

## 8.2 Recetas

- Ingredientes.
- Peso bruto/neto.
- Rendimiento.
- Raciones.
- Merma.
- Instrucciones.
- Tiempo.
- Etiquetas.
- Alérgenos.
- Cálculo nutricional por receta y ración.
- Fotografías con licencia o propias.
- Duplicación y versionado.
- Asignación a planes.
- Visibilidad profesional/cliente.

## 8.3 Equivalencias

- Grupos de intercambio.
- Porciones equivalentes.
- Medidas caseras.
- Sustituciones.
- Reglas por objetivo.
- Plantillas personalizadas.
- Historial de cambios.

---

# 9. Recomendaciones y recursos educativos

Biblioteca profesional con:

- Artículos breves.
- Guías.
- PDF.
- Vídeos/enlaces.
- Recetas.
- Infografías propias.
- Categorías.
- Etiquetas.
- Público objetivo.
- Fecha de revisión.
- Autor.
- Estado de validación.
- Versionado.

Asignación a clientes:

- Fecha.
- Motivo.
- Comentario personalizado.
- Confirmación de lectura.
- Fecha de vencimiento opcional.
- No enviar datos clínicos por enlaces públicos.

---

# 10. Portal del cliente

## 10.1 Inicio

Mostrar:

- Próxima cita.
- Plan activo.
- Objetivos actuales.
- Tareas pendientes.
- Últimos mensajes.
- Recomendaciones nuevas.
- Acceso rápido a registros.
- Evolución seleccionada por el profesional.

## 10.2 Registros del cliente

El profesional puede activar/desactivar:

- Peso.
- Perímetros seleccionados.
- Comidas.
- Hambre/saciedad.
- Síntomas digestivos.
- Deposiciones mediante escala configurable.
- Energía.
- Sueño.
- Agua.
- Entrenamiento.
- Pasos.
- Ciclo menstrual.
- Adherencia.
- Estado de ánimo, sin usarlo para diagnóstico automático.
- Fotografías.
- Comentarios.

Cada registro debe tener:

- Fecha/hora.
- Zona horaria.
- Valor.
- Nota.
- Fuente.
- Edición limitada y auditada.
- Visibilidad.

No fomentar registros compulsivos. Permitir ocultar calorías, peso u otras métricas según criterio profesional.

## 10.3 Progreso

- Gráficos comprensibles.
- Comparación con objetivos.
- Mensajes neutrales.
- No gamificar pérdida de peso de forma agresiva.
- El profesional decide qué métricas se muestran.
- Línea temporal de hitos.
- Reacciones/comentarios.

## 10.4 Mensajería segura

- Conversaciones profesional-cliente.
- Adjuntos privados.
- No incluir contenido clínico en el asunto de emails de notificación.
- Indicador de leído.
- Archivado.
- Categorías.
- Búsqueda.
- Control de tamaño/tipo de archivo.
- Protección contra malware cuando sea viable.
- Rate limiting.
- Sin chat entre clientes.
- Mensajes no eliminables de forma silenciosa.
- Política de disponibilidad y emergencia visible.
- Aviso: no usar para urgencias.

## 10.5 Documentos y consentimientos

- Consentimiento informado.
- Privacidad.
- Comunicaciones.
- Fotografías.
- Tratamiento de datos.
- Teleconsulta.
- Menores/tutor legal.
- Documentos personalizados.
- Firma/aceptación con:
  - versión;
  - fecha;
  - usuario;
  - IP solo si es necesaria y con retención definida;
  - huella del documento.
- Revocación cuando proceda.
- Exportación de copia.

Las plantillas legales deben marcarse como “pendientes de revisión jurídica”; Codex no debe afirmar que son legalmente suficientes.

---

# 11. Analíticas, salud y seguridad clínica

## 11.1 Analíticas

- Registro manual o importación controlada.
- Fecha.
- Laboratorio.
- Parámetro.
- Valor.
- Unidad.
- Rango aportado por el laboratorio.
- Marcador alto/bajo basado únicamente en el rango introducido.
- Adjuntar informe.
- No diagnosticar.
- No normalizar unidades sin trazabilidad.
- Comparación longitudinal.
- Datos originales preservados.

## 11.2 Medicación y suplementos

- Nombre.
- Dosis.
- Frecuencia.
- Inicio/fin.
- Motivo comunicado.
- Profesional prescriptor, opcional.
- Observaciones.
- Estado.
- No generar cambios de medicación.
- Alertas únicamente informativas y validadas.

## 11.3 Señales de derivación

Permitir checklist y notas para derivación a otros profesionales, pero:

- Sin diagnóstico automático.
- Sin sustituir protocolos profesionales.
- Mostrar avisos para revisión humana.
- Registrar decisión y derivación.

---

# 12. Módulos opcionales preparados mediante feature flags

Preparar arquitectura, pero no retrasar el núcleo:

- Pagos y Stripe.
- Facturas/recibos simples, sin afirmar cumplimiento contable hasta revisión.
- Reservas públicas.
- Google Calendar.
- Videoconsulta.
- Firma electrónica avanzada.
- Integración con wearables.
- Integración con laboratorios.
- Aplicación PWA instalable.
- IA para borradores.

## 12.1 IA futura

Desactivada por defecto.

Si se implementa:

- Consentimiento explícito.
- Minimización/seudonimización.
- No enviar historias completas a terceros por defecto.
- No entrenar con datos de clientes.
- Registro de prompts, versión y salida de manera segura.
- Toda salida es borrador.
- Prohibido diagnóstico o prescripción autónoma.
- Posibilidad de desactivar globalmente.
- Revisión de proveedor y contrato de tratamiento.

---

# 13. Modelo de datos mínimo

Diseña migraciones normalizadas, índices y constraints para entidades equivalentes a:

## Núcleo y usuarios

- `organizations`
- `profiles`
- `organization_members`
- `professional_profiles`
- `client_profiles`
- `client_assignments`
- `user_preferences`
- `feature_flags`

## Cliente e historia nutricional

- `clients`
- `client_contacts`
- `client_emergency_contacts`
- `client_guardians`
- `client_tags`
- `client_tag_assignments`
- `client_consents`
- `client_health_summaries`
- `client_conditions`
- `client_allergies`
- `client_intolerances`
- `client_medications`
- `client_supplements`
- `client_preferences`
- `client_goals`

## Agenda

- `services`
- `professional_availability`
- `availability_exceptions`
- `appointments`
- `appointment_status_history`
- `appointment_reminders`

## Consultas

- `consultations`
- `clinical_notes`
- `clinical_note_revisions`
- `consultation_goals`
- `consultation_recommendations`
- `tasks`

## Antropometría

- `anthropometry_protocols`
- `measurement_definitions`
- `anthropometry_protocol_measurements`
- `anthropometry_sessions`
- `anthropometry_raw_measurements`
- `anthropometry_final_measurements`
- `anthropometry_equations`
- `anthropometry_calculation_results`
- `measurement_equipment`
- `equipment_calibrations`
- `anthropometrist_profiles`

## Dietas y alimentos

- `foods`
- `food_synonyms`
- `nutrients`
- `food_nutrients`
- `food_allergens`
- `recipes`
- `recipe_versions`
- `recipe_ingredients`
- `exchange_groups`
- `exchange_items`
- `diet_plans`
- `diet_plan_versions`
- `diet_days`
- `diet_meals`
- `diet_meal_items`
- `diet_substitutions`
- `shopping_lists`

## Seguimiento

- `tracking_definitions`
- `client_tracking_settings`
- `progress_entries`
- `progress_comments`
- `activity_entries`
- `symptom_entries`
- `lab_reports`
- `lab_results`

## Comunicación y documentos

- `conversations`
- `conversation_participants`
- `messages`
- `message_attachments`
- `recommendation_resources`
- `client_recommendations`
- `documents`
- `document_versions`
- `document_acceptances`
- `notifications`

## Auditoría y operaciones

- `audit_events`
- `security_events`
- `data_export_requests`
- `data_erasure_requests`
- `retention_holds`
- `background_jobs`
- `idempotency_keys`

No crees tablas por inercia. Simplifica o combina cuando mantengas:

- separación de permisos;
- trazabilidad;
- versionado;
- integridad;
- rendimiento.

Requisitos de base de datos:

- UUID.
- `created_at`.
- `updated_at`.
- autor cuando sea relevante.
- constraints.
- foreign keys.
- índices por organización, cliente, fecha y estado.
- soft delete solo donde sea correcto.
- no usar soft delete como excusa para retención indefinida.
- triggers mínimos y documentados.
- funciones `security definer` solo cuando sean imprescindibles, con `search_path` seguro.
- tipos numéricos adecuados para medidas y nutrientes.
- no usar `float` cuando la precisión decimal sea clínicamente relevante.
- migraciones reversibles o estrategia explícita de forward-only.

---

# 14. Matriz RLS obligatoria

Crea `docs/RLS_MATRIX.md` y pruebas automáticas para cada tabla.

Casos mínimos:

## Profesional

- Puede ver y modificar datos de su organización según rol.
- Solo puede acceder a clientes asignados cuando la política de la consulta lo exija.
- El owner puede administrar miembros.
- El asistente no ve notas clínicas privadas.
- Ningún profesional accede a otra organización.

## Cliente

- Solo ve su propio perfil.
- Solo ve citas propias.
- Solo ve planes publicados para él.
- Solo ve recomendaciones asignadas.
- Solo ve documentos compartidos.
- Solo participa en sus conversaciones.
- Solo crea registros de seguimiento habilitados.
- No ve notas privadas, borradores, cálculos internos ni otros clientes.
- No puede cambiar `organization_id`, `client_id`, autor o campos de auditoría.

## Anónimo

- No puede acceder a tablas clínicas.
- Solo puede usar rutas públicas explícitas.
- La reserva pública, si se activa, debe pasar por una función controlada.

## Service role

- Solo en servidor.
- Uso mínimo.
- Nunca en bundle cliente.
- Cada uso documentado.

## Storage

Buckets privados separados, por ejemplo:

- `clinical-documents`
- `progress-photos`
- `message-attachments`
- `professional-assets`

Path lógico:

```text
{organization_id}/{client_id}/{resource_type}/{uuid}.{ext}
```

Las políticas deben verificar:

- organización;
- cliente;
- rol;
- pertenencia;
- tipo de recurso.

Probar intentos de:

- leer otro cliente;
- cambiar IDs manualmente;
- enumerar rutas;
- usar una URL firmada caducada;
- subir un archivo a carpeta ajena;
- acceder tras revocar al usuario.

---

# 15. Privacidad, seguridad y cumplimiento

Nutri-Oli tratará datos de salud. Aplica privacidad desde el diseño.

## 15.1 Requisitos mínimos

- Base jurídica y consentimiento configurables.
- Información de privacidad versionada.
- Registro de actividades de tratamiento como plantilla documental.
- Minimización.
- Limitación de finalidad.
- Retención configurable.
- Exportación de datos.
- Rectificación.
- Restricción.
- Supresión cuando proceda.
- Bloqueo/conservación cuando exista obligación.
- Trazabilidad de accesos y cambios.
- Procedimiento de incidente.
- Copias de seguridad.
- Recuperación probada.
- Contratos con encargados pendientes de revisión.
- Evaluación de impacto marcada como necesaria para valoración profesional/jurídica.
- Entorno y región adecuados para clientes europeos.
- Prohibición de usar datos reales en desarrollo.
- Datos demo claramente ficticios.

## 15.2 Seguridad de aplicación

Implementa y prueba:

- RLS en todas las tablas expuestas.
- Grants mínimos.
- Esquemas privados para lógica interna.
- Validación server-side.
- Autorización por objeto.
- Protección IDOR.
- CSRF cuando aplique.
- XSS.
- SQL injection.
- SSRF en importaciones/enlaces.
- Path traversal.
- Open redirect.
- Rate limiting.
- Control de uploads.
- Límites de tamaño.
- MIME real, no solo extensión.
- Nombres aleatorios.
- URLs firmadas.
- Cabeceras de seguridad.
- CSP razonable.
- Cookies seguras.
- Sesiones con caducidad.
- No registrar cuerpos con datos de salud.
- Redacción de PII en logs.
- No incluir PII en URLs.
- No incluir PII en nombres de archivo.
- No incluir detalles clínicos en emails.
- Protección de exports.
- Invalidación de cache privada.
- Prevención de cache compartida de páginas autenticadas.
- Dependencias auditadas.
- Lockfile versionado.
- Secret scanning.
- Rotación documentada.
- Backups cifrados según proveedor.
- Restauración ensayada.

## 15.3 Auditoría

Registrar eventos clínicamente y legalmente relevantes:

- Inicio de sesión.
- Fallos repetidos.
- Alta/baja.
- Acceso a historia.
- Creación/edición/publicación.
- Exportación.
- Descarga de documento.
- Cambio de permisos.
- Consentimiento.
- Revocación.
- Eliminación.
- Corrección de nota.
- Uso administrativo.

No guardar secretos ni contenido clínico completo en auditoría.

Los logs de auditoría no deben ser modificables por usuarios normales.

## 15.4 Seguridad clínica

- No emitir diagnósticos automáticos.
- No recomendar medicación.
- No ocultar la fórmula usada.
- Mostrar unidades.
- Detectar valores imposibles sin convertirlos automáticamente.
- Distinguir dato medido, declarado, estimado y calculado.
- Marcar cálculos como estimaciones.
- Requerir publicación profesional.
- Conservar origen y fecha.
- Registrar cambios.
- Incluir disclaimers configurables.
- Botón visible para retirar/publicar un plan.
- No mostrar a un cliente información de otro por errores de navegación o caché.

---

# 16. API, acciones de servidor y trabajos programados

- Preferir Server Components para lectura segura.
- Server Actions o Route Handlers para mutaciones.
- Validación Zod en cada frontera.
- Autorización explícita antes de leer o mutar.
- Transacciones para operaciones múltiples.
- Idempotencia para webhooks, emails, pagos y recordatorios.
- Paginación server-side.
- Filtros con índices.
- No confiar en IDs enviados por el cliente.
- Derivar usuario y organización desde sesión segura.
- Evitar exponer errores internos.
- Correlation ID sin PII.
- Cron/colas para:
  - recordatorios;
  - generación de documentos;
  - limpieza controlada;
  - caducidad de invitaciones;
  - tareas de retención.
- Jobs idempotentes y observables.
- Reintentos limitados.
- Dead-letter o registro de fallo.

---

# 17. PDFs, exportaciones e impresión

Generar:

- Plan dietético.
- Recomendaciones.
- Informe de consulta.
- Informe antropométrico.
- Evolución.
- Consentimientos.
- Exportación completa del cliente.

Requisitos:

- Identidad Nutri-Oli.
- Datos mínimos.
- Fecha y versión.
- Pie de confidencialidad configurable.
- Sin URLs públicas permanentes.
- Archivos privados.
- Regeneración reproducible.
- Plantillas accesibles para impresión.
- Evitar fuentes o assets sin licencia.
- CSV con escape seguro.
- Exportación ZIP opcional.

---

# 18. Rendimiento y calidad de experiencia

Objetivos:

- Carga inicial rápida.
- Consultas paginadas.
- Índices revisados con `EXPLAIN`.
- No descargar todos los clientes o alimentos al navegador.
- Cache solo para datos no sensibles y con claves correctas.
- Evitar waterfalls.
- Skeletons discretos.
- Estados vacíos útiles.
- Optimistic UI solo donde no comprometa consistencia.
- Autosave en formularios largos con indicador.
- Recuperación de borrador.
- Confirmación para acciones destructivas.
- Navegación móvil usable.
- Tablas adaptativas.
- Formularios grandes divididos por secciones.

---

# 19. Testing obligatorio

## 19.1 Unitarias

- Cálculos antropométricos.
- Conversión de unidades.
- Totales nutricionales.
- Versionado.
- Validaciones.
- Permisos de aplicación.
- Formateo de fechas y moneda.
- Reglas de publicación.
- Generación de resumen.

## 19.2 Base de datos

- Migración desde cero.
- Constraints.
- Integridad referencial.
- Funciones SQL.
- Triggers.
- RLS por rol.
- RLS entre organizaciones.
- Storage.
- Revocación.
- Intentos maliciosos.

## 19.3 Integración

- Auth.
- Invitación.
- Alta de cliente.
- Cita.
- Consulta.
- Sesión antropométrica.
- Creación y publicación de dieta.
- Acceso del cliente.
- Mensajería.
- Documento privado.
- Consentimiento.
- Exportación.

## 19.4 E2E

Flujos críticos:

1. Owner inicia sesión.
2. Crea cliente.
3. Invita al cliente.
4. Programa cita.
5. Realiza primera consulta.
6. Registra antropometría.
7. Crea plan.
8. Publica plan.
9. Cliente acepta invitación.
10. Cliente ve únicamente su plan.
11. Cliente añade registro.
12. Cliente envía mensaje.
13. Profesional responde.
14. Profesional crea nueva versión.
15. Cliente deja de ver la antigua como activa.
16. Cliente intenta acceder por URL a otro cliente y recibe denegación.
17. Asistente intenta abrir nota clínica y recibe denegación.
18. Se exportan datos.
19. Se revoca acceso.
20. La sesión revocada deja de funcionar.

## 19.5 Accesibilidad

- `axe`.
- Navegación teclado.
- Focus visible.
- Labels.
- Mensajes de error asociados.
- Contraste.
- Lectores de pantalla.
- Modales.
- Tablas.
- Gráficos con alternativa textual.

## 19.6 Seguridad

- Dependency audit.
- Secret scan.
- RLS tests.
- Pruebas de subida.
- XSS en notas y mensajes.
- CSV injection.
- Enumeración de UUID.
- Signed URLs.
- Caché.
- Headers.
- Rate limits.
- Red-team de flujos.

## 19.7 Rendimiento

- Lighthouse en páginas públicas y dashboard demo.
- Presupuesto de bundle.
- Consultas lentas.
- N+1.
- Paginación.
- Imágenes.
- PDFs.

---

# 20. CI/CD

Crea workflows para:

## Pull request

- Instalar con lockfile.
- Lint.
- Format check.
- Typecheck.
- Unit tests.
- Tests de componentes.
- Supabase local.
- Migraciones desde cero.
- SQL/RLS tests.
- Build.
- E2E del smoke test.
- Análisis de dependencias.
- Secret scanning.
- Artifact de resultados.

## Main

- Repetir gates.
- Aplicar migraciones mediante proceso seguro.
- Desplegar.
- Smoke tests post-deploy.
- Registrar versión.
- No desplegar si falla un gate.

## Preview

- Vercel Preview.
- Base de datos aislada o estrategia segura.
- Nunca conectar previews no confiables a producción.
- Datos demo.

---

# 21. Despliegue

## 21.1 Supabase

- Proyecto separado para producción.
- Región adecuada.
- Auth configurado.
- URLs de redirección exactas.
- Emails personalizados después del MVP.
- RLS habilitada antes de cualquier dato.
- Buckets privados.
- Migraciones versionadas.
- Seed solo demo en desarrollo.
- Backups documentados.
- Procedimiento de restauración.
- Tipos TypeScript generados.
- Service role protegida.

## 21.2 Vercel

- Conectar repositorio.
- Configurar environments.
- Variables separadas.
- Producción protegida.
- Dominio cuando el usuario lo decida.
- Preview deployments.
- Logs sin PII.
- Redeploy al cambiar secretos.
- Cron solo si se requiere.
- Cabeceras de seguridad.
- Smoke test.

## 21.3 Dominio

Preparar:

- `nutri-oli.com` o dominio decidido por el usuario.
- `app.<dominio>` opcional.
- HTTPS.
- Redirección canónica.
- Emails SPF/DKIM/DMARC cuando se configure correo.
- No comprar ni transferir dominio sin permiso.

---

# 22. Observabilidad y operaciones

- Error tracking con redacción de PII o solución propia.
- Métricas técnicas, no clínicas.
- Health check.
- Alertas de fallos.
- Jobs fallidos.
- Registro de versión.
- Runbooks:
  - caída;
  - filtración;
  - credencial comprometida;
  - migración fallida;
  - restauración;
  - usuario bloqueado;
  - archivo inaccesible;
  - recordatorios duplicados.
- Página de estado interna.
- No añadir analytics de terceros que capturen datos clínicos.
- Cookies no esenciales desactivadas por defecto.
- Telemetría mínima.

---

# 23. Datos demo

Crea datos completamente ficticios:

- Un owner.
- Un nutricionista.
- Un asistente.
- Tres clientes ficticios.
- Citas pasadas y futuras.
- Consulta inicial.
- Dos sesiones antropométricas.
- Un plan dietético.
- Alimentos y recetas mínimos.
- Mensajes.
- Registros de progreso.
- Consentimientos.

Nunca uses nombres o datos visibles en las capturas como si fueran reales.

Proporciona cuentas demo solo en local/test y nunca con credenciales predecibles en producción.

---

# 24. Fases de ejecución

## Fase 0 — Inspección y planificación

1. Inspecciona capturas.
2. Inspecciona repositorio si existe.
3. Detecta herramientas y acceso.
4. Crea documentos de proyecto.
5. Define MVP y alcance completo.
6. Crea issues/milestones.
7. Registra riesgos.
8. Continúa inmediatamente a Fase 1.

No te detengas tras presentar el plan.

## Fase 1 — Fundación segura

- Next.js.
- TypeScript.
- Estilos.
- i18n.
- Supabase local.
- Esquema núcleo.
- Auth.
- Roles.
- RLS.
- Layout profesional/cliente.
- CI.
- Tests base.
- Preview deployment.

## Fase 2 — Clientes y agenda

- Dashboard.
- Agenda.
- Servicios.
- Clientes.
- Ficha.
- Invitaciones.
- Portal base.
- Auditoría.

## Fase 3 — Historia y consultas

- Anamnesis.
- Consultas.
- ADIME/PES.
- Objetivos.
- Notas.
- Versionado.
- Recomendaciones.
- Adjuntos.

## Fase 4 — Antropometría

- Protocolos.
- Medidas.
- Sesiones.
- Repeticiones.
- Calidad.
- Cálculos.
- Gráficos.
- PDF.
- Tests.

## Fase 5 — Alimentos y recetas

- Base de alimentos.
- Nutrientes.
- Recetas.
- Equivalencias.
- Importación.
- Búsqueda.

## Fase 6 — Planes dietéticos

- Editor.
- Totales.
- Alternativas.
- Versiones.
- Publicación.
- PDF.
- Lista de compra.
- Portal.

## Fase 7 — Seguimiento y mensajería

- Registros.
- Progreso.
- Mensajería.
- Notificaciones.
- Documentos.
- Consentimientos.

## Fase 8 — Seguridad y cumplimiento

- Threat model.
- RLS exhaustiva.
- EIPD checklist.
- Exportación.
- Retención.
- Auditoría.
- Hardening.
- Red-team.

## Fase 9 — Pulido y producción

- Responsive.
- Accesibilidad.
- Rendimiento.
- UAT.
- Documentación.
- Restauración.
- Despliegue.
- Smoke test.
- Release.

---

# 25. Criterios de aceptación por producto

Nutri-Oli no puede considerarse utilizable hasta que:

- Existe acceso profesional y de cliente.
- Un cliente no puede ver información ajena.
- Se pueden crear y gestionar clientes.
- Se pueden programar consultas.
- Se puede documentar una consulta.
- Se puede registrar antropometría con repeticiones.
- Se puede revisar la calidad de medidas.
- Se puede crear una dieta.
- Se puede publicar al cliente.
- Se puede versionar la dieta.
- Se puede enviar una recomendación.
- Se puede registrar progreso.
- Se puede enviar un mensaje seguro.
- Se pueden gestionar consentimientos.
- Se pueden generar PDFs.
- Existen auditoría y exportación.
- RLS está probada.
- CI pasa.
- Build de producción pasa.
- Las rutas críticas tienen E2E.
- No existen secretos en Git.
- No existen buckets públicos con datos de salud.
- La documentación de despliegue permite reproducir el sistema.
- Los cálculos están documentados y probados.
- Las limitaciones clínicas y legales son visibles.

---

# 26. Definición estricta de terminado

Una tarea solo está terminada cuando:

1. Código implementado.
2. UX completa.
3. Errores controlados.
4. Permisos implementados.
5. Migración creada.
6. RLS creada.
7. Tests creados.
8. Tests pasan.
9. Typecheck pasa.
10. Lint pasa.
11. Build pasa.
12. Accesibilidad revisada.
13. Seguridad revisada.
14. Documentación actualizada.
15. PR revisada.
16. Sin datos reales.
17. Sin secretos.
18. Sin TODO crítico.
19. Evidencias registradas en `docs/STATUS.md`.
20. Criterios de aceptación demostrados.

El proyecto solo está terminado cuando, además:

- Se puede desplegar desde cero siguiendo `docs/DEPLOYMENT.md`.
- Se ha probado una restauración o se ha documentado una simulación reproducible.
- Existe una release versionada.
- Hay smoke tests en producción o staging.
- Se entrega una lista de decisiones pendientes de validación profesional, jurídica o comercial.

---

# 27. Reglas de comunicación con el usuario

Durante el trabajo:

- Reporta avances por hitos, no cada cambio menor.
- Sé específico.
- Indica commits/PRs.
- Incluye comandos y resultados.
- Diferencia claramente:
  - completado;
  - probado;
  - pendiente;
  - bloqueado;
  - requiere revisión humana.
- No digas “está listo” si solo existe frontend mock.
- No digas “cumple RGPD” ni “es ISAK oficial”.
- No pidas al usuario que tome decisiones técnicas triviales.

Formato de cada informe de fase:

```text
FASE X — [nombre]

Completado:
- ...

Validación:
- lint: PASS/FAIL
- typecheck: PASS/FAIL
- unit: PASS/FAIL
- integration: PASS/FAIL
- E2E: PASS/FAIL
- build: PASS/FAIL
- security: PASS/FAIL

Riesgos o límites:
- ...

Bloqueos:
- ...

Próxima acción automática:
- ...
```

---

# 28. Instrucción de inicio inmediato

Empieza ahora.

Orden inicial obligatorio:

1. Comprueba el contenido del repositorio y el estado de Git.
2. Confirma qué accesos técnicos están disponibles sin pedir contraseñas.
3. Inspecciona las capturas como referencia funcional.
4. Crea `docs/MASTER_PLAN.md`, `docs/STATUS.md`, arquitectura, threat model inicial y backlog.
5. Inicializa la aplicación y Supabase local.
6. Implementa la Fase 1.
7. Ejecuta todos los gates.
8. Corrige hasta pasar.
9. Abre PR.
10. Continúa con la siguiente fase sin esperar confirmación, salvo bloqueo real de los definidos en este prompt.

No entregues únicamente una propuesta. Construye el producto.
