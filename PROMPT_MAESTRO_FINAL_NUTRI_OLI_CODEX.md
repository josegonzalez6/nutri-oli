# NUTRI-OLI — PROMPT MAESTRO FINAL PARA CODEX

## Construcción autónoma de un software integral de nutrición listo para producción

---

# 0. Autoridad de este documento

Este documento es la **especificación principal y consolidada** del proyecto Nutri-Oli.

Debes leer también cualquier documentación ya existente en el repositorio, incluidos los prompts anteriores, `AGENTS.md`, `README.md`, `docs/`, las migraciones de Supabase, los tests y las pull requests abiertas. Cuando exista contradicción:

1. La seguridad, privacidad y la integridad de datos tienen prioridad.
2. Este documento define el alcance final.
3. Las decisiones ya implementadas y probadas deben conservarse cuando sean compatibles.
4. Cualquier cambio de arquitectura debe justificarse en `docs/DECISIONS.md`.
5. No reescribas trabajo correcto solo por preferencia estilística.

Nombre del producto: **Nutri-Oli**  
Repositorio: `josegonzalez6/nutri-oli`  
Producto objetivo: software profesional de nutrición con área del nutricionista y portal/PWA del cliente.

---

# 1. Misión

Construye Nutri-Oli hasta que sea un producto completo, seguro, desplegado y operativamente utilizable por un dietista-nutricionista con clientes reales.

Debe permitir, como mínimo:

- gestionar clientes;
- realizar anamnesis y consultas;
- registrar historia nutricional;
- realizar controles y seguimiento;
- realizar antropometría;
- calcular energía, macronutrientes y micronutrientes;
- crear dietas, pautas, menús y recomendaciones;
- trabajar con alimentos, recetas, equivalencias y listas de compra;
- publicar planes al cliente;
- permitir que el cliente consulte su plan desde móvil;
- registrar progreso, ingestas, síntomas, actividad y adherencia;
- enviar correos y notificaciones;
- mantener chat profesional-cliente dentro de la aplicación;
- gestionar citas;
- generar informes y PDF;
- gestionar consentimientos y documentos;
- mantener auditoría, seguridad y aislamiento de datos;
- desplegarse mediante GitHub, Supabase y Vercel;
- disponer de copias de seguridad, restauración y procedimientos operativos.

El nivel de producto debe aproximarse funcionalmente a plataformas integrales como Nutrium y a plataformas de planificación adaptativa como INDYA, pero con identidad, UX, código y contenidos propios.

No copies:

- interfaces píxel a píxel;
- marcas;
- textos;
- imágenes;
- recetas propietarias;
- bases de alimentos propietarias;
- algoritmos cerrados;
- recursos educativos;
- código;
- flujos protegidos.

Analiza los problemas que resuelven las plataformas existentes y crea una solución original.

---

# 2. Qué significa “terminado”

No interpretes “100 %” como garantía matemática de ausencia de errores. Interprétalo como **production-ready con evidencia**.

Nutri-Oli solo puede declararse listo cuando:

- las funciones esenciales están implementadas de extremo a extremo;
- los datos persisten realmente;
- la autenticación es real;
- los permisos están aplicados en frontend, servidor y base de datos;
- RLS está probada;
- no quedan funciones esenciales en modo demo;
- se ha desplegado staging y producción;
- existen backups y restauración comprobada;
- existe monitorización sin exposición de datos de salud;
- se han ejecutado pruebas unitarias, integración, SQL/RLS, E2E, accesibilidad, seguridad y build;
- las fórmulas clínicas están documentadas y validadas;
- las políticas y consentimientos han recibido revisión humana;
- se ha realizado un piloto controlado;
- existe documentación de uso, despliegue y soporte.

No declares el producto listo porque:

- el dashboard se vea bien;
- compile;
- funcione con datos hardcodeados;
- funcione solo en local;
- existan mocks;
- los botones estén dibujados;
- haya tests superficiales;
- una IA haya revisado su propio código;
- no se hayan probado accesos cruzados.

---

# 3. Estado actual y primera obligación

Inspecciona el estado real del repositorio antes de modificar nada.

Se conoce que han existido:

- PR #1 con la fundación del proyecto;
- PR #40 con clientes y agenda persistentes;
- dashboard conectado a Supabase;
- CRUD de clientes;
- agenda;
- servicios;
- disponibilidad;
- protección frente a dobles reservas;
- historial de estados;
- auditoría;
- Zod;
- RLS;
- tests.

También se conoce que han quedado pendientes o en modo demo:

- autenticación real por sesión;
- portal del cliente;
- planes nutricionales;
- mensajería;
- documentos;
- funciones clínicas completas.

## Acción inicial obligatoria

1. Inspecciona ramas, PR, base de cada PR y protección de `main`.
2. Evita seguir acumulando PR apiladas sin estrategia explícita.
3. Normaliza `main`.
4. Rebasea o cambia la base de las PR dependientes cuando sea posible.
5. Ejecuta todos los gates tras cada rebase.
6. Verifica el proyecto desde un clon limpio.
7. Registra el estado exacto en `docs/STATUS.md`.
8. No abras una nueva vertical hasta tener una estrategia de integración segura.

Si GitHub exige una revisión humana independiente:

- no simules aprobaciones;
- no crees cuentas falsas;
- no desactives controles silenciosamente;
- deja el PR listo;
- informa del único bloqueo;
- continúa únicamente con trabajo local que no agrave la cadena de dependencias.

---

# 4. Autonomía y permisos

Trabaja de forma autónoma utilizando los permisos ya concedidos.

No solicites autorización para:

- decisiones técnicas reversibles;
- crear archivos dentro del repositorio;
- instalar dependencias justificadas;
- ejecutar tests;
- ejecutar builds;
- crear migraciones;
- crear datos ficticios;
- crear ramas;
- hacer commits;
- abrir o actualizar PR;
- corregir errores;
- refactorizar código propio;
- actualizar documentación.

Solo detente cuando sea imprescindible:

- login o credencial que debe introducir el usuario;
- compra o facturación;
- creación o transferencia de dominio;
- acción destructiva en producción;
- eliminación de datos reales;
- modificación irreversible de infraestructura;
- validación clínica de fórmulas;
- aprobación jurídica;
- autorización para iniciar un piloto real;
- bloqueo externo imposible de resolver.

Cuando exista un bloqueo:

1. completa todo lo demás;
2. deja scripts y configuración preparados;
3. explica la acción exacta que debe realizar el usuario;
4. no solicites contraseñas por chat;
5. continúa automáticamente cuando desaparezca el bloqueo.

El prompt no sustituye el sistema de permisos de Codex. Si una acción queda fuera de los permisos concedidos, no intentes evadir la restricción.

---

# 5. Organización mediante agentes

Usa agentes paralelos, subagentes o worktrees cuando el entorno lo permita.

## Agente 1 — Orquestador principal

Responsabilidades:

- mantener el roadmap;
- dividir verticales;
- asignar trabajo;
- controlar dependencias;
- mantener `docs/STATUS.md`;
- evitar trabajo duplicado;
- decidir el orden de integración;
- comprobar que ningún agente declare terminado sin evidencia.

## Agente 2 — Arquitectura y backend

- arquitectura modular;
- Server Components, Server Actions y API;
- reglas de dominio;
- transacciones;
- idempotencia;
- jobs;
- rendimiento;
- contratos tipados.

## Agente 3 — Supabase, Auth y RLS

- esquema PostgreSQL;
- migraciones;
- Auth;
- roles;
- políticas RLS;
- Storage;
- tests SQL;
- aislamiento;
- índices;
- backups;
- restauración.

## Agente 4 — Diseño y frontend profesional

- sistema de diseño;
- dashboard;
- agenda;
- clientes;
- consulta;
- antropometría;
- editor de dietas;
- responsive;
- accesibilidad.

## Agente 5 — Portal/PWA del cliente

- onboarding;
- plan;
- seguimiento;
- progreso;
- mensajes;
- documentos;
- consentimientos;
- móvil;
- PWA.

## Agente 6 — Motor nutricional

- alimentos;
- nutrientes;
- recetas;
- equivalencias;
- cálculos;
- macros;
- micros;
- unidades;
- fuentes;
- trazabilidad;
- tests numéricos.

## Agente 7 — Antropometría y seguridad clínica

- protocolos;
- medidas;
- repeticiones;
- discrepancias;
- ETM;
- ecuaciones;
- versionado;
- informes;
- revisión de riesgos clínicos.

## Agente 8 — Comunicación y operaciones

- email;
- notificaciones;
- chat;
- archivos;
- trabajos programados;
- observabilidad;
- runbooks;
- despliegue.

## Agente 9 — QA y accesibilidad

- unit;
- integración;
- E2E;
- Playwright;
- axe;
- móvil;
- regresión;
- datos de prueba;
- rendimiento.

## Agente 10 — Seguridad/red-team

No implementa inicialmente la misma funcionalidad que revisa.

Debe intentar:

- IDOR;
- acceso a otra organización;
- acceso entre clientes;
- bypass de roles;
- lectura de notas privadas;
- manipulación de UUID;
- subida maliciosa;
- XSS;
- CSV injection;
- fuga de logs;
- fuga de caché;
- fuga mediante URL firmada;
- uso de sesión revocada;
- acceso a borradores;
- modificación de campos de auditoría.

## Agente 11 — Revisor independiente

- revisa el diff;
- verifica criterios;
- busca funcionalidades falsas;
- verifica persistencia;
- verifica documentación;
- rechaza tareas incompletas.

## Regla de revisión

El agente que implementa no puede ser el único que apruebe.

Si el entorno no permite agentes paralelos, ejecuta los roles secuencialmente y documenta el rol de cada revisión.

---

# 6. Bucle obligatorio de autosupervisión

Para cada vertical:

1. Inspeccionar estado.
2. Escribir criterios de aceptación.
3. Diseñar UX.
4. Diseñar modelo de datos.
5. Diseñar permisos.
6. Crear migraciones.
7. Crear RLS.
8. Implementar backend.
9. Implementar frontend.
10. Implementar auditoría.
11. Crear datos ficticios.
12. Escribir tests unitarios.
13. Escribir tests SQL/RLS.
14. Escribir integración.
15. Escribir E2E.
16. Ejecutar accesibilidad.
17. Ejecutar build.
18. Ejecutar auditoría de dependencias.
19. Ejecutar secret scan.
20. Revisar rendimiento.
21. Revisar seguridad.
22. Revisar clínica cuando proceda.
23. Revisar el diff independientemente.
24. Corregir.
25. Repetir gates completos.
26. Actualizar documentación.
27. Abrir o actualizar PR.
28. Añadir capturas y evidencias.
29. Integrar solo si los gates pasan.

Prohibido:

- omitir un test fallido;
- desactivar tests para pasar;
- usar mocks en producción;
- mostrar botones no operativos sin indicarlo;
- marcar persistencia cuando solo hay estado en memoria;
- usar `any` sin justificación;
- dejar `TODO` críticos sin issue;
- ocultar riesgos;
- afirmar cumplimiento legal;
- afirmar certificación ISAK;
- introducir datos reales en desarrollo.

---

# 7. Stack técnico

Conserva el stack existente si ya está correctamente implementado.

Stack objetivo:

- Next.js App Router.
- React.
- TypeScript estricto.
- `pnpm`.
- Tailwind CSS.
- Radix UI o shadcn/ui personalizados.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Supabase Realtime únicamente donde aporte valor.
- Zod.
- React Hook Form.
- solución oficial vigente de Supabase para SSR.
- internacionalización.
- Playwright.
- Vitest.
- Testing Library.
- pgTAP o pruebas SQL equivalentes.
- ESLint.
- Prettier.
- GitHub Actions.
- Vercel.
- Supabase CLI.

Arquitectura:

- monolito modular;
- módulos por dominio;
- lógica clínica fuera de componentes UI;
- contratos tipados;
- migraciones versionadas;
- sin microservicios innecesarios;
- sin dependencia de vendors no justificada.

Registra cada dependencia relevante en `docs/DECISIONS.md`.

---

# 8. Diseño de producto

Nutri-Oli debe tener un diseño propio, moderno y profesional.

## Principios visuales

- identidad original;
- verde oliva y salvia como base;
- neutros claros;
- azul para información;
- ámbar para avisos;
- rojo solo para errores;
- alto contraste;
- tipografía legible;
- iconos consistentes;
- espaciado amplio;
- jerarquía clara;
- formularios complejos divididos por etapas;
- tablas responsive;
- dashboards útiles, no decorativos.

## Experiencia

- desktop para trabajo profesional;
- móvil prioritario para cliente;
- responsive real;
- navegación por teclado;
- WCAG 2.2 AA;
- focus visible;
- labels;
- errores asociados al campo;
- gráficos con alternativa tabular;
- estados loading;
- estado vacío;
- error recuperable;
- forbidden;
- offline cuando aplique;
- autosave en formularios largos;
- recuperación de borradores;
- confirmación de acciones destructivas.

## Navegación profesional

- Inicio.
- Agenda.
- Clientes.
- Consultas.
- Antropometría.
- Planificación.
- Alimentos.
- Recetas.
- Equivalencias.
- Recomendaciones.
- Seguimiento.
- Mensajes.
- Documentos.
- Plantillas.
- Pagos, opcional.
- Configuración.

## Navegación cliente

- Inicio.
- Mi plan.
- Mis citas.
- Mi seguimiento.
- Mi progreso.
- Recomendaciones.
- Mensajes.
- Documentos.
- Consentimientos.
- Cuenta.

No copies la disposición exacta de Nutrium o INDYA.

---

# 9. Usuarios, organizaciones y permisos

Modela una organización aunque inicialmente haya un solo nutricionista.

Roles:

- `owner`;
- `nutritionist`;
- `assistant`;
- `client`;
- `auditor`, opcional.

Principios:

- denegar por defecto;
- menor privilegio;
- aislamiento entre organizaciones;
- aislamiento entre clientes;
- notas privadas separadas;
- el asistente no accede a clínica por defecto;
- el cliente solo ve contenido publicado;
- service role solo en servidor;
- ninguna autorización depende solo del frontend.

## Autenticación real

Implementa:

- login;
- invitación;
- aceptación;
- verificación de email;
- recuperación;
- logout;
- renovación;
- revocación;
- desactivación;
- MFA profesional;
- rate limiting;
- gestión de sesiones;
- protección de rutas;
- autorización server-side.

Elimina de producción toda identidad demo basada en variables como:

- `NUTRI_OLI_ORGANIZATION_ID`;
- `NUTRI_OLI_PROFILE_ID`;
- `NUTRI_OLI_PROFESSIONAL_PROFILE_ID`.

Solo pueden usarse en tests aislados.

---

# 10. Dashboard profesional

Debe mostrar información real:

- agenda de hoy;
- próxima consulta;
- primeras visitas;
- seguimientos;
- mensajes no leídos;
- clientes nuevos;
- formularios pendientes;
- planes en borrador;
- planes por revisar;
- consentimientos pendientes;
- controles atrasados;
- registros recientes;
- tareas;
- incidencias;
- accesos rápidos.

Filtros:

- periodo;
- profesional;
- centro;
- estado.

No usar datos hardcodeados en producción.

---

# 11. Agenda y gestión de consulta

Implementa:

- día, semana y mes;
- servicios configurables;
- primera visita;
- seguimiento;
- antropometría;
- consulta online;
- servicios personalizados;
- duración;
- precio;
- ubicación;
- presencial/online;
- disponibilidad;
- excepciones;
- vacaciones;
- buffers;
- prevención de doble reserva;
- zona horaria;
- estados;
- historial;
- cancelación;
- no presentado;
- recordatorios;
- email;
- exportación ICS;
- enlace de videollamada;
- lista de espera opcional;
- reserva pública opcional;
- integración futura con Google Calendar.

Las notificaciones no deben incluir datos clínicos.

---

# 12. Gestión integral del cliente

## Listado

- nombre;
- identificador interno;
- contacto;
- estado;
- profesional;
- última consulta;
- próxima consulta;
- objetivo;
- etiquetas;
- búsqueda;
- filtros;
- paginación;
- exportación.

## Alta

- datos mínimos;
- contacto;
- nacimiento;
- sexo cuando sea clínicamente necesario;
- dirección opcional;
- emergencia;
- tutor;
- comunicación;
- consentimientos;
- profesional asignado;
- invitación.

## Ficha

Pestañas:

- resumen;
- anamnesis;
- consultas;
- antropometría;
- planes;
- objetivos;
- registros;
- analíticas;
- actividad;
- recomendaciones;
- mensajes;
- documentos;
- consentimientos;
- auditoría.

---

# 13. Historia nutricional, anamnesis y consulta

## Anamnesis

Incluye formularios versionados para:

- motivo;
- objetivos;
- antecedentes;
- patologías diagnosticadas;
- síntomas;
- digestivo;
- alergias;
- intolerancias;
- medicación;
- suplementos;
- cirugías;
- analíticas;
- historia ponderal;
- patrón;
- recordatorio 24 h;
- frecuencia;
- preferencias;
- aversiones;
- restricciones;
- horarios;
- cultura y contexto;
- presupuesto;
- cocina;
- trabajo;
- familia;
- sueño;
- estrés;
- actividad;
- deporte;
- hidratación;
- alcohol y tabaco;
- salud menstrual;
- embarazo;
- lactancia;
- menopausia;
- barreras;
- facilitadores;
- disposición al cambio.

Permite:

- borrador;
- autosave;
- formularios previos enviados al cliente;
- comparación entre revisiones;
- campos configurables;
- secciones desactivables.

## Consulta guiada

Una pantalla debe permitir:

1. revisar resumen;
2. revisar cambios;
3. revisar registros;
4. registrar evolución;
5. registrar síntomas;
6. medir;
7. revisar adherencia;
8. revisar objetivos;
9. modificar intervención;
10. modificar plan;
11. asignar tareas;
12. publicar resumen;
13. programar revisión.

## Notas clínicas

- ADIME opcional;
- PES opcional;
- nota privada;
- resumen compartido;
- borrador;
- final;
- addendum;
- historial;
- autor;
- fecha;
- motivo de corrección;
- adjuntos;
- auditoría.

Una nota finalizada no se sobrescribe silenciosamente.

---

# 14. Antropometría

Crea un módulo profesional compatible con metodología ISAK, sin afirmar certificación.

## Sesión

- cliente;
- fecha;
- antropometrista;
- acreditación opcional;
- protocolo;
- condiciones;
- instrumental;
- calibración;
- observaciones;
- estado;
- consentimiento.

## Medidas

- masa;
- talla;
- talla sentada;
- envergadura;
- pliegues;
- perímetros;
- diámetros;
- longitudes;
- medidas personalizadas.

## Calidad

- dos o tres repeticiones;
- valores brutos;
- discrepancia;
- tolerancia configurable;
- tercera medición;
- valor final;
- precisión;
- corrección auditada;
- ETM;
- ETM relativo;
- intraobservador;
- interobservador.

## Cálculos

- IMC;
- cintura/talla;
- sumatorios;
- cambio absoluto;
- cambio porcentual;
- somatotipo solo tras validación;
- ecuaciones de composición corporal;
- otras ecuaciones versionadas.

Cada ecuación debe registrar:

- nombre;
- fuente;
- población;
- entradas;
- unidades;
- fórmula segura;
- versión;
- limitaciones;
- estado;
- aprobación profesional.

No usar `eval`.

No inventar:

- fórmulas;
- tolerancias;
- poblaciones;
- rangos;
- interpretaciones.

## Informes

- valores brutos;
- finales;
- gráficos;
- comparación;
- calidad;
- método;
- ecuación;
- limitaciones;
- PDF;
- visibilidad configurable.

---

# 15. Bioimpedancia y composición corporal

- dispositivo;
- marca;
- modelo;
- algoritmo;
- condiciones;
- fecha;
- frecuencia;
- datos originales;
- masa grasa;
- masa libre;
- agua;
- datos segmentarios;
- otros indicadores;
- comparativa;
- importación CSV;
- advertencia al mezclar dispositivos.

No presentar una estimación como medida directa.

---

# 16. Motor de alimentos y nutrientes

Debe permitir contar macros y micros de manera trazable.

## Alimentos

- fuente;
- licencia;
- nombre;
- sinónimos;
- marca;
- categoría;
- estado;
- fecha;
- valores por 100 g o 100 ml;
- raciones;
- medidas caseras;
- densidad;
- alérgenos;
- nutrientes;
- alimento propio;
- verificación;
- duplicados.

## Nutrientes

Como mínimo:

- energía;
- proteína;
- hidratos;
- azúcares;
- fibra;
- grasas;
- saturadas;
- monoinsaturadas;
- poliinsaturadas;
- colesterol cuando exista;
- sodio;
- potasio;
- calcio;
- fósforo;
- magnesio;
- hierro;
- zinc;
- cobre;
- selenio;
- yodo;
- vitaminas A, D, E, K, C;
- tiamina;
- riboflavina;
- niacina;
- B6;
- folato;
- B12;
- otros nutrientes según la fuente.

No inventes ceros cuando falta un dato. Diferencia:

- cero real;
- dato no disponible;
- dato estimado;
- dato derivado.

## Importación

- CSV;
- preview;
- mapeo;
- unidades;
- validación;
- deduplicación;
- rollback;
- protección CSV injection;
- informe de errores.

No copies bases propietarias. Usa fuentes abiertas o con licencia y registra atribución.

---

# 17. Recetas y equivalencias

## Recetas

- título;
- versión;
- ingredientes;
- peso bruto;
- peso neto;
- merma;
- rendimiento;
- raciones;
- instrucciones;
- tiempo;
- etiquetas;
- patrón dietético;
- alérgenos;
- nutrientes;
- foto propia o licenciada;
- alternativas;
- visibilidad;
- duplicación;
- asignación;
- PDF.

## Equivalencias

- grupos;
- alimentos;
- porciones;
- medidas caseras;
- equivalencia energética;
- equivalencia de macros;
- reglas;
- sustituciones;
- plantillas;
- versión;
- vista sencilla para cliente.

---

# 18. Planificación nutricional

Este es uno de los núcleos del producto.

## Modalidades de intervención

- menú semanal;
- día tipo;
- dieta calibrada;
- equivalencias;
- intercambios;
- pauta abierta;
- método del plato;
- frecuencias;
- recomendaciones;
- objetivos conductuales;
- plan deportivo;
- plan por días de entrenamiento y descanso;
- combinación de modalidades.

## Necesidades nutricionales

- fórmulas versionadas;
- gasto energético;
- actividad;
- objetivo;
- energía;
- macros;
- micros;
- fibra;
- hidratación;
- deporte;
- ajuste manual;
- justificación;
- límites;
- fuente;
- unidades.

No elegir automáticamente una ecuación clínica sin mostrarla.

## Editor de plan

- días;
- bloques;
- comidas;
- horarios;
- alimentos;
- recetas;
- cantidades;
- medidas caseras;
- alternativas;
- sustituciones;
- comentarios;
- instrucciones;
- duplicar comida;
- duplicar día;
- duplicar semana;
- plantillas;
- favoritos;
- drag and drop accesible;
- búsqueda;
- filtros;
- autosave;
- undo;
- historial.

## Cálculo en tiempo real

Mostrar:

- kcal;
- proteína;
- hidratos;
- grasas;
- fibra;
- macros por kg;
- distribución por comida;
- media semanal;
- micronutrientes;
- objetivos;
- porcentaje de objetivo;
- incertidumbre;
- datos faltantes;
- alérgenos;
- restricciones;
- avisos.

Los cálculos deben:

- ejecutarse con precisión decimal adecuada;
- tener tests;
- indicar la fuente;
- conservar inputs;
- ser reproducibles;
- no ocultar datos faltantes.

## Publicación

- borrador;
- revisión;
- publicación;
- programación;
- retirada;
- archivo;
- versiones inmutables;
- comparación;
- fecha de vigencia;
- cliente solo ve publicado.

## Lista de compra

- agregación;
- categorías;
- cantidades;
- unidades;
- exclusión de elementos opcionales;
- PDF;
- móvil.

---

# 19. Nutrición deportiva y planificación adaptativa

Prepara una experiencia inspirada en los problemas que resuelven herramientas deportivas, sin copiar algoritmos propietarios.

## Funciones

- calendario de entrenamientos;
- tipo;
- duración;
- intensidad;
- hora;
- competición;
- objetivo;
- carga;
- estrategia preentreno;
- durante;
- post;
- hidratación;
- sodio;
- hidratos por hora;
- cafeína cuando el profesional lo indique;
- días de descanso;
- planificación de viajes;
- avituallamientos;
- cambios logísticos.

## Integraciones futuras

Mediante adaptadores y feature flags:

- Strava;
- TrainingPeaks;
- Apple Health;
- Google Health Connect;
- Garmin u otros mediante integraciones autorizadas.

No implementes scraping.

## Reajuste

El sistema puede proponer un borrador ante cambios de entrenamiento, pero:

- explica qué cambió;
- muestra el cálculo;
- requiere revisión;
- no publica solo;
- conserva versiones.

## Visibilidad

El profesional puede ocultar al cliente:

- kcal;
- macros;
- peso;
- IMC;
- métricas sensibles.

---

# 20. Portal/PWA del cliente

Debe ser plenamente operativo desde móvil.

## Inicio

- próxima cita;
- plan activo;
- tareas;
- objetivos;
- recomendaciones;
- mensajes;
- registros pendientes.

## Plan

- comidas;
- alternativas;
- recetas;
- equivalencias;
- instrucciones;
- lista de compra;
- modo claro;
- buscador;
- versión;
- fecha;
- confirmación de lectura.

## Seguimiento

El profesional activa o desactiva:

- peso;
- perímetros;
- fotos;
- comidas;
- hambre;
- saciedad;
- síntomas;
- digestivo;
- deposiciones;
- agua;
- sueño;
- pasos;
- entrenamiento;
- energía;
- ciclo menstrual;
- adherencia;
- comentarios.

## Progreso

- gráficos;
- tablas;
- hitos;
- objetivos;
- mensajes neutrales;
- métricas seleccionadas.

No fomentar conductas compulsivas.

## Cuenta

- perfil;
- preferencias;
- sesiones;
- privacidad;
- exportación;
- revocación;
- cierre de sesión.

---

# 21. Diario alimentario

- texto;
- alimentos;
- recetas;
- fotografía;
- vídeo opcional;
- fecha;
- hora;
- contexto;
- hambre;
- saciedad;
- síntomas;
- comentario;
- sustitución;
- feedback;
- análisis opcional;
- estado revisado.

No usar un lenguaje de aprobación moral de los alimentos.

---

# 22. Chat, email y notificaciones

## Chat interno

- conversaciones profesional-cliente;
- adjuntos;
- leído;
- no leído;
- archivado;
- búsqueda;
- categorías;
- respuestas;
- rate limiting;
- horario;
- aviso de no urgencias;
- auditoría;
- almacenamiento privado;
- no eliminar silenciosamente.

El cliente no puede conversar con otros clientes.

## Email

- invitación;
- verificación;
- recuperación;
- cita;
- cancelación;
- recordatorio;
- plan publicado;
- recomendación;
- mensaje pendiente;
- consentimiento.

Reglas:

- sin datos clínicos en asunto;
- sin plan completo por email;
- enlaces autenticados;
- plantillas profesionales;
- locale;
- unsubscribe para comunicaciones no esenciales;
- SPF;
- DKIM;
- DMARC;
- registro de envío;
- reintentos;
- idempotencia.

## Notificaciones in-app

- centro de notificaciones;
- leído;
- enlaces internos;
- preferencias;
- no duplicación;
- caducidad.

---

# 23. Recomendaciones y educación

Biblioteca de:

- textos;
- guías;
- PDF;
- enlaces;
- vídeos;
- infografías propias;
- recetas;
- plantillas.

Campos:

- autor;
- versión;
- fecha;
- población;
- categoría;
- etiquetas;
- fuente;
- revisión;
- estado;
- visibilidad.

Asignación:

- cliente;
- fecha;
- comentario;
- lectura;
- vencimiento.

No copies recursos de competidores.

---

# 24. Documentos, consentimientos y PDF

## Documentos

- privados;
- versionados;
- Storage;
- URL firmada;
- expiración;
- descarga auditada;
- tipo MIME;
- tamaño;
- nombre aleatorio;
- antivirus cuando sea viable.

## Consentimientos

- privacidad;
- tratamiento;
- asistencia;
- comunicaciones;
- fotografías;
- teleconsulta;
- menores;
- revocación;
- versión;
- fecha;
- evidencia;
- huella;
- copia.

Las plantillas deben marcarse como pendientes de revisión jurídica.

## PDF

Genera:

- consulta;
- antropometría;
- evolución;
- plan;
- recetas;
- equivalencias;
- recomendaciones;
- consentimiento;
- exportación.

Incluye:

- logo;
- datos profesionales;
- colegiación;
- fecha;
- versión;
- secciones configurables;
- confidencialidad;
- idioma;
- vista previa.

No confundas firma visual con firma electrónica avanzada.

---

# 25. Analíticas, medicación y suplementos

## Analíticas

- informe;
- laboratorio;
- fecha;
- parámetro;
- valor;
- unidad;
- rango aportado;
- alto/bajo según el rango;
- tendencia;
- comentario;
- dato original;
- conversión trazable.

No diagnosticar.

## Medicación y suplementos

- nombre;
- dosis;
- frecuencia;
- inicio;
- fin;
- motivo comunicado;
- prescriptor;
- observaciones;
- estado.

No recomendar cambios de medicación.

Una base de interacciones solo puede incluirse con fuente autorizada y mantenida.

---

# 26. Objetivos y adherencia

- objetivos SMART;
- cualitativos;
- cuantitativos;
- prioridad;
- fecha;
- revisión;
- métrica;
- progreso;
- barreras;
- acciones;
- comentarios;
- historial.

Evita gamificación agresiva de peso o restricción.

---

# 27. Administración, pagos y negocio

Módulo opcional después del núcleo:

- servicios;
- precios;
- bonos;
- pagos;
- recibos;
- Stripe Checkout;
- suscripciones;
- descuentos;
- estados;
- reembolsos;
- política de cancelación;
- exportación.

No afirmar cumplimiento fiscal español sin revisión profesional.

Preparar:

- multicentro;
- varios profesionales;
- asistente;
- asignación;
- configuración por organización;
- identidad;
- estadísticas operativas sin revelar salud.

---

# 28. Inteligencia artificial

Desactivada por defecto hasta completar privacidad y validación.

Puede:

- resumir notas;
- estructurar anamnesis;
- detectar campos incompletos;
- proponer borradores;
- sugerir sustituciones;
- preparar lista de compra;
- redactar un resumen.

No puede:

- diagnosticar;
- prescribir;
- publicar;
- cambiar medicación;
- interpretar analíticas como diagnóstico;
- decidir una ecuación sin revisión;
- enviar datos a terceros sin garantías.

Toda salida:

- borrador;
- trazable;
- revisable;
- con versión del modelo;
- con inputs minimizados;
- con aprobación humana.

---

# 29. Modelo de datos

Diseña o adapta entidades para:

## Organización y usuarios

- organizations;
- profiles;
- memberships;
- professional_profiles;
- client_profiles;
- assignments;
- preferences;
- feature_flags.

## Clínica

- clients;
- contacts;
- guardians;
- tags;
- health_summaries;
- conditions;
- allergies;
- intolerances;
- medications;
- supplements;
- goals;
- anamnesis_forms;
- anamnesis_versions;
- consultations;
- notes;
- note_revisions;
- tasks.

## Agenda

- services;
- availability;
- exceptions;
- appointments;
- status_history;
- reminders.

## Antropometría

- protocols;
- definitions;
- sessions;
- raw_measurements;
- final_measurements;
- equations;
- calculations;
- equipment;
- calibrations;
- anthropometrists.

## Nutrición

- foods;
- food_sources;
- nutrients;
- food_nutrients;
- portions;
- allergens;
- recipes;
- recipe_versions;
- ingredients;
- exchanges;
- diet_plans;
- diet_plan_versions;
- days;
- meals;
- meal_items;
- substitutions;
- shopping_lists;
- energy_calculations.

## Seguimiento

- tracking_definitions;
- tracking_settings;
- progress_entries;
- food_diary_entries;
- symptoms;
- activity;
- training_sessions;
- progress_comments;
- lab_reports;
- lab_results.

## Comunicación

- conversations;
- participants;
- messages;
- attachments;
- notifications;
- email_deliveries;
- recommendations;
- assignments.

## Documentos

- documents;
- document_versions;
- acceptances;
- consents.

## Operación

- audit_events;
- security_events;
- jobs;
- idempotency_keys;
- exports;
- erasure_requests;
- retention_holds.

Simplifica cuando sea correcto, pero conserva:

- permisos;
- trazabilidad;
- integridad;
- versionado;
- rendimiento.

---

# 30. RLS y Storage

Crea `docs/RLS_MATRIX.md`.

Prueba por tabla y rol.

## Cliente

- solo su perfil;
- solo sus citas;
- solo planes publicados;
- solo documentos compartidos;
- solo recomendaciones asignadas;
- solo conversaciones propias;
- solo registros habilitados;
- nunca notas privadas;
- nunca otros clientes;
- no cambia organización ni autor.

## Profesional

- organización autorizada;
- clientes asignados;
- clínica según rol;
- owner administra;
- asistente limitado.

## Anónimo

- sin acceso clínico.

## Storage

Buckets privados:

- clinical-documents;
- progress-photos;
- message-attachments;
- professional-assets.

Path:

`{organization_id}/{client_id}/{resource_type}/{uuid}.{ext}`

Prueba:

- path ajeno;
- URL caducada;
- upload ajeno;
- sesión revocada;
- enumeración;
- MIME falso.

---

# 31. Seguridad y privacidad

Datos de salud requieren privacidad desde el diseño.

Implementa:

- minimización;
- finalidad;
- retención;
- exportación;
- rectificación;
- restricción;
- borrado;
- revocación;
- auditoría;
- procedimiento de incidente;
- backups;
- restauración;
- región UE;
- datos ficticios en desarrollo;
- separación de entornos.

Hardening:

- RLS;
- grants mínimos;
- validación server-side;
- IDOR;
- CSRF;
- XSS;
- SQL injection;
- SSRF;
- path traversal;
- open redirect;
- rate limiting;
- upload seguro;
- CSP;
- cookies seguras;
- no PII en URL;
- no salud en logs;
- cache privada;
- secret scanning;
- dependency scanning;
- rotación;
- sesiones;
- service role protegida.

Auditoría:

- login;
- acceso;
- cambios;
- publicación;
- exportación;
- descarga;
- permisos;
- consentimiento;
- revocación;
- eliminación;
- addendum;
- administración.

No guardar contenido clínico completo en logs de auditoría.

---

# 32. Pruebas obligatorias

## Unitarias

- energía;
- macros;
- micros;
- unidades;
- recetas;
- porciones;
- totales;
- antropometría;
- ETM;
- ecuaciones;
- versionado;
- validaciones;
- permisos;
- fechas;
- publicación.

## SQL/RLS

- migración desde cero;
- constraints;
- funciones;
- triggers;
- organización;
- cliente;
- asistente;
- storage;
- revocación;
- ataques.

## Integración

- Auth;
- invitación;
- cliente;
- cita;
- consulta;
- antropometría;
- alimento;
- receta;
- plan;
- publicación;
- portal;
- seguimiento;
- mensaje;
- documento;
- consentimiento;
- exportación.

## E2E

Flujo completo:

1. owner entra;
2. crea cliente;
3. invita;
4. programa;
5. consulta;
6. antropometría;
7. crea receta;
8. crea plan;
9. publica;
10. cliente acepta;
11. cliente ve plan;
12. registra seguimiento;
13. envía mensaje;
14. profesional responde;
15. crea nueva versión;
16. retira antigua;
17. cliente intenta acceso ajeno;
18. asistente intenta nota privada;
19. exporta;
20. revoca sesión.

## Accesibilidad

- axe;
- teclado;
- foco;
- lector;
- labels;
- errores;
- contraste;
- modales;
- tablas;
- gráficos.

## Seguridad

- UUID;
- XSS;
- CSV injection;
- upload;
- URL firmada;
- caché;
- headers;
- rate limiting;
- secretos;
- dependencias.

---

# 33. CI/CD

## PR

- install lockfile;
- format;
- lint;
- typecheck;
- unit;
- componentes;
- Supabase local;
- migraciones;
- SQL/RLS;
- build;
- E2E;
- axe;
- audit;
- secret scan.

## Main

- repetir gates;
- migraciones seguras;
- desplegar;
- smoke;
- versión;
- rollback preparado.

## Preview

- Vercel Preview;
- datos ficticios;
- nunca producción;
- entorno aislado.

---

# 34. Producción

## Supabase

- desarrollo;
- staging;
- producción;
- región UE;
- Auth;
- redirect;
- SMTP;
- RLS;
- buckets;
- backups;
- restauración;
- migrations;
- no seeds demo.

## Vercel

- preview;
- staging;
- producción;
- variables;
- dominio;
- HTTPS;
- headers;
- logs redactados;
- cron;
- smoke.

## Observabilidad

- errores sin PII;
- health;
- jobs;
- alertas;
- versión;
- runbooks.

## Correo

- dominio;
- SPF;
- DKIM;
- DMARC;
- proveedor;
- plantillas;
- pruebas.

---

# 35. Roadmap de ejecución

## Fase 0 — Normalización

- PR;
- ramas;
- main;
- clon limpio;
- gates;
- release base.

## Fase 1 — Auth real

- sesiones;
- roles;
- invitaciones;
- MFA;
- revocación;
- eliminación identidad demo.

## Fase 2 — Expediente y consultas

- anamnesis;
- notas;
- controles;
- objetivos;
- tareas;
- PDF.

## Fase 3 — Antropometría

- sesiones;
- medidas;
- calidad;
- ecuaciones;
- gráficos;
- PDF.

## Fase 4 — Motor nutricional

- fuentes;
- alimentos;
- nutrientes;
- recetas;
- equivalencias;
- tests.

## Fase 5 — Planes

- editor;
- macros;
- micros;
- publicación;
- lista de compra;
- versiones.

## Fase 6 — Portal/PWA

- plan;
- citas;
- registros;
- progreso;
- cuenta.

## Fase 7 — Comunicación

- chat;
- email;
- notificaciones;
- recomendaciones;
- documentos.

## Fase 8 — Deporte

- entrenamientos;
- estrategia;
- borradores adaptativos;
- adaptadores de integración.

## Fase 9 — Seguridad y derechos

- privacidad;
- exportación;
- borrado;
- retención;
- red-team;
- restore.

## Fase 10 — Producción técnica

- Supabase;
- Vercel;
- dominio;
- correo;
- observabilidad;
- backups.

## Fase 11 — Validación humana

- clínica;
- jurídica;
- producción.

## Fase 12 — Piloto

- staging;
- datos ficticios;
- UAT;
- piloto limitado;
- correcciones.

## Fase 13 — Release

- `v1.0.0`;
- manuales;
- changelog;
- rollback;
- producción.

Continúa fase tras fase sin detenerte por decisiones reversibles.

---

# 36. Gates humanos

No marques automáticamente:

## Clinical sign-off

- fórmulas;
- antropometría;
- anamnesis;
- alertas;
- informes;
- lenguaje.

## Legal sign-off

- privacidad;
- consentimientos;
- cookies;
- términos;
- menores;
- fotos;
- teleconsulta;
- retención;
- encargados;
- EIPD.

## Production sign-off

- dominio;
- email;
- soporte;
- backups;
- restore;
- incidentes;
- datos profesionales;
- precios.

Crea:

- `docs/CLINICAL_SIGN_OFF.md`;
- `docs/LEGAL_SIGN_OFF.md`;
- `docs/PRODUCTION_SIGN_OFF.md`.

---

# 37. Documentación

Mantén:

- README;
- AGENTS;
- MASTER_PLAN;
- STATUS;
- ASSUMPTIONS;
- DECISIONS;
- ARCHITECTURE;
- DATA_MODEL;
- DATA_DICTIONARY;
- RLS_MATRIX;
- SECURITY;
- THREAT_MODEL;
- CLINICAL_VALIDATION;
- ISAK_COMPATIBILITY;
- PRIVACY_CHECKLIST;
- DEPLOYMENT;
- OPERATIONS;
- TEST_STRATEGY;
- USER_FLOWS;
- UAT;
- CHANGELOG;
- USER_MANUAL_PROFESSIONAL;
- USER_MANUAL_CLIENT.

`STATUS.md` debe contener:

- fase;
- completado;
- pendiente;
- bloqueos;
- riesgos;
- commit;
- PR;
- tests;
- próxima acción.

---

# 38. Informe de cada fase

Usa:

```text
FASE [n] — [nombre]

Implementado:
- ...

Persistencia real:
- PASS/FAIL

Autenticación real:
- PASS/FAIL/NO APLICA

RLS:
- PASS/FAIL

Unit:
- PASS/FAIL

SQL/RLS:
- PASS/FAIL

Integración:
- PASS/FAIL

E2E:
- PASS/FAIL

Accesibilidad:
- PASS/FAIL

Build:
- PASS/FAIL

Seguridad:
- PASS/FAIL

Elementos demo restantes:
- ...

Validación clínica:
- PASS/PENDIENTE HUMANO

Validación legal:
- PASS/PENDIENTE HUMANO

PR:
- ...

Bloqueos:
- ...

Próxima acción automática:
- ...
```

No uses expresiones vagas como “básicamente listo”.

---

# 39. Instrucción de inicio

Empieza ahora:

1. Lee este documento y todos los documentos existentes.
2. Inspecciona repositorio, ramas, PR y CI.
3. Normaliza la integración.
4. Actualiza `docs/STATUS.md`.
5. Crea o actualiza el backlog completo.
6. Identifica todos los mocks y módulos demo.
7. Prioriza autenticación real.
8. Implementa Auth y autorización por sesión.
9. Ejecuta todos los gates.
10. Abre o actualiza PR.
11. Continúa automáticamente con expediente y consultas.
12. Continúa con antropometría.
13. Continúa con motor nutricional.
14. Continúa con planes dietéticos.
15. Continúa con portal del cliente.
16. Continúa con seguimiento, chat, email y documentos.
17. Continúa con seguridad, despliegue y piloto.
18. No te detengas después de planificar.
19. No utilices datos reales hasta superar gates y sign-offs.
20. No declares Nutri-Oli terminado mientras quede una función esencial demo o sin pruebas.

Tu objetivo es entregar un producto operativo, no una propuesta.
