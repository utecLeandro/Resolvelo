  
**Licenciatura en**   
**Tecnologías de la Información**

**PROYECTO FINAL**  
8vo. Semestre \- 2025

Plataforma para alquiler de equipos musicales

*Solución que conecta a músicos/organizadores de eventos con propietarios de instrumentos, facilitando el alquiler seguro y eficiente mediante una aplicación web.*

Equipo: NucleoTec

Federico Fourcade   
Leandro Rivero

Tutor: Gerardo Gandara

**Declaración de Autoría**

*Declaramos que el presente trabajo fue realizado de forma original por los integrantes del equipo, sin incurrir en plagio, copia o uso indebido de material de terceros. Nos responsabilizamos íntegramente por el contenido aquí expuesto y reconocemos la contribución individual y grupal al desarrollo del mismo.*

| Federico Fourcade | Leandro Rivero |
| :---: | :---: |
| *Autor 1* | *Autor 2* |

**Dedicatoria**

Dedicamos este trabajo a nuestras familias y amigos, por su constante apoyo, paciencia y motivación a lo largo de nuestra formación. También lo dedicamos a todos los músicos y artistas que, con esfuerzo y pasión, hacen vibrar cada escenario.

**Agradecimientos**

Queremos agradecer a nuestros tutores por su guía, dedicación y comentarios constructivos durante el desarrollo del proyecto. y a quienes participaron como usuarios de prueba, aportando su tiempo y visión para mejorar la propuesta.  
**Resumen**

**Abstract**

**Tabla de Contenidos**

[1.1. Problema	10](#problema)

[1.2. Solución	10](#solución)

[1.3. Justificación	10](#justificación)

[1.4. Objetivos	10](#objetivos)

[1.5. Estructura del documento	10](#estructura-del-documento)

[2\. MARCO TEÓRICO Y ESTADO DEL ARTE	12](#marco-teórico-y-estado-del-arte)

[2.1. Marco Teórico	12](#marco-teórico)

[2.2. Estado del arte	12](#estado-del-arte)

[2.3. Síntesis	13](#síntesis)

[3\. METODOLOGÍA Y RESULTADOS	14](#metodología-y-resultados)

[3.1. Alcance	14](#alcance)

[Requerimientos funcionales en alcance	14](#requerimientos-funcionales-en-alcance)

[Requerimientos no funcionales en alcance	14](#requerimientos-no-funcionales-en-alcance)

[Fuera de alcance	14](#fuera-de-alcance)

[Producto Mínimo Viable (MVP)	14](#producto-mínimo-viable-\(mvp\))

[3.2. Tecnología	15](#tecnología)

[Resumen Ejecutivo	15](#resumen-ejecutivo)

[Stack Tecnológico Propuesto	15](#stack-tecnológico-propuesto)

[Componentes del Stack Tecnológico	15](#componentes-del-stack-tecnológico)

[Frontend	16](#frontend)

[Aplicación Web	16](#aplicación-web)

[Backend	16](#backend)

[Base de Datos	16](#base-de-datos)

[Infraestructura y Despliegue	16](#infraestructura-y-despliegue)

[Servicios Adicionales	16](#servicios-adicionales)

[Resumen Stack	17](#resumen-stack)

[3.3. Planificación	17](#planificación)

[Product Backlog Inicial	17](#product-backlog-inicial)

[Épicas	17](#épicas)

[Matriz de Priorización	18](#matriz-de-priorización)

[Matriz de Priorización de Requerimientos Funcionales	18](#matriz-de-priorización-de-requerimientos-funcionales)

[Plan de gestión de tiempo	19](#plan-de-gestión-de-tiempo)

[Metodología de Programación	19](#metodología-de-programación)

[Herramientas de Programación	19](#herramientas-de-programación)

[Nivel de Precisión y Unidades de Medida	19](#nivel-de-precisión-y-unidades-de-medida)

[Umbrales de Control	19](#umbrales-de-control)

[Reglas para la Medición del Desempeño	19](#reglas-para-la-medición-del-desempeño)

[Formatos de Informe	20](#formatos-de-informe)

[Definición de Actividades	20](#definición-de-actividades)

[Secuenciación de Actividades	20](#secuenciación-de-actividades)

[Estimación de Recursos	20](#estimación-de-recursos)

[Estimación de Duración	20](#estimación-de-duración)

[Desarrollo del Cronograma	21](#desarrollo-del-cronograma)

[Cronograma del Proyecto	21](#cronograma-del-proyecto)

[Hitos Principales	21](#hitos-principales)

[Control del Cronograma	22](#control-del-cronograma)

[Gestión de Cambios en el Cronograma	22](#gestión-de-cambios-en-el-cronograma)

[Consideraciones Adicionales	23](#consideraciones-adicionales)

[Plan de Gestión de Riesgos	23](#plan-de-gestión-de-riesgos)

[Metodología	23](#metodología)

[Roles y Responsabilidades	24](#roles-y-responsabilidades)

[Categorías de Riesgos	24](#categorías-de-riesgos)

[Definiciones de Probabilidad e Impacto	25](#definiciones-de-probabilidad-e-impacto)

[Escala de Probabilidad	25](#escala-de-probabilidad)

[Escala de Impacto	25](#escala-de-impacto)

[Matriz de Probabilidad e Impacto	26](#matriz-de-probabilidad-e-impacto)

[Principales Riesgos Identificados	26](#principales-riesgos-identificados)

[Identificación de Riesgos	27](#identificación-de-riesgos)

[Análisis Cualitativo de Riesgos	27](#análisis-cualitativo-de-riesgos)

[Análisis Cuantitativo de Riesgos	28](#análisis-cuantitativo-de-riesgos)

[Plan de Respuesta a los Riesgos	29](#plan-de-respuesta-a-los-riesgos)

[Estrategias de Respuesta Detalladas	29](#estrategias-de-respuesta-detalladas)

[Monitoreo y Control de Riesgos	35](#monitoreo-y-control-de-riesgos)

[Reservas de Contingencia y Gestión	35](#reservas-de-contingencia-y-gestión)

[Lecciones Aprendidas	36](#lecciones-aprendidas)

[Plan de Gestión de Costos	36](#plan-de-gestión-de-costos)

[Enlaces con los Procedimientos de la Organización	36](#enlaces-con-los-procedimientos-de-la-organización)

[Umbrales de Control	37](#umbrales-de-control-1)

[Reglas para la Medición del Desempeño	37](#reglas-para-la-medición-del-desempeño-1)

[Formatos de Informe	37](#formatos-de-informe-1)

[Proceso de Estimación de Costos	37](#proceso-de-estimación-de-costos)

[Estructura de Desglose de Costos	37](#estructura-de-desglose-de-costos)

[Estimación de Costos del Proyecto Final	38](#estimación-de-costos-del-proyecto-final)

[Análisis de Escenarios	39](#análisis-de-escenarios)

[Control de costos	40](#control-de-costos)

[Supuestos y Restricciones	41](#supuestos-y-restricciones)

[Consideraciones Adicionales	41](#consideraciones-adicionales-1)

[Enfoque de Calidad	42](#enfoque-de-calidad)

[Política de Calidad	42](#política-de-calidad)

[Objetivos de calidad	42](#objetivos-de-calidad)

[Roles y Responsabilidades de Calidad	43](#roles-y-responsabilidades-de-calidad)

[Estándares de Calidad Aplicables	43](#estándares-de-calidad-aplicables)

[Actividades de Aseguramiento de Calidad	44](#actividades-de-aseguramiento-de-calidad)

[Herramientas y Técnicas de Calidad	45](#herramientas-y-técnicas-de-calidad)

[Métricas de Calidad	46](#métricas-de-calidad)

[Enfoque de Pruebas	47](#enfoque-de-pruebas)

[Criterios de Aceptación de Calidad	48](#criterios-de-aceptación-de-calidad)

[Proceso de Mejora Continua	50](#proceso-de-mejora-continua)

[Gestión de No Conformidades	50](#gestión-de-no-conformidades)

[Revisiones de Calidad Planificadas	51](#revisiones-de-calidad-planificadas)

[Documentación de Calidad	51](#documentación-de-calidad)

[Integración con Otros Planes	51](#integración-con-otros-planes)

[Consideraciones para Implementación Futura	52](#consideraciones-para-implementación-futura)

[4\. BIBLIOGRAFÍA	53](#bibliografía)

[5\. APÉNDICES	54](#apéndices)

[Identificación de Riesgos	54](#identificación-de-riesgos-1)

[Plan de Respuesta a los Riesgos	56](#plan-de-respuesta-a-los-riesgos-1)

[**6\. Anexos	58**](#anexos)

[Aspectos Éticos y Sociales de ReSolVelo	58](#aspectos-éticos-y-sociales-de-resolvelo)

[1\. Introducción	58](#1.-introducción)

[2\. Análisis de Implicaciones Éticas y Medidas Adoptadas	58](#2.-análisis-de-implicaciones-éticas-y-medidas-adoptadas)

[2.1. Privacidad y Protección de Datos Personales	59](#2.1.-privacidad-y-protección-de-datos-personales)

[2.2. Confianza, Seguridad y Verificación de Identidad	59](#2.2.-confianza,-seguridad-y-verificación-de-identidad)

[2.3. Acceso Equitativo, Inclusión y Sostenibilidad	60](#2.3.-acceso-equitativo,-inclusión-y-sostenibilidad)

[3\. Aspectos Detectados	60](#3.-aspectos-detectados)

[Política de Privacidad	60](#política-de-privacidad)

[Objetivo	60](#objetivo)

[Alojamiento y Transferencia Internacional de Datos	60](#alojamiento-y-transferencia-internacional-de-datos)

[Diagrama de contexto	62](#diagrama-de-contexto)

[Diagrama conceptual	62](#diagrama-conceptual)

[Diagrama de arquitectura	63](#diagrama-de-arquitectura)

INTRODUCCIÓN

1. ## **Problema** {#problema}

¿Sabían que en Uruguay no existe una plataforma para alquiler de equipamiento musical?  
El alquiler de equipos musicales en Uruguay se caracteriza por la informalidad, la desconfianza y la falta de un mercado centralizado. Los músicos y organizadores de eventos enfrentan dificultades para encontrar instrumentos específicos y carecen de garantías en las transacciones, lo que genera inseguridad y pérdida de oportunidades.

2. ## **Solución** {#solución}

Para resolver esta problemática, se desarrolla ReSolVelo, una plataforma web que conecta a arrendadores y arrendatarios de equipamiento musical. La solución digitaliza y centraliza el proceso de alquiler, ofreciendo un catálogo de equipamiento, sistema de reputación, garantías, gestión de reservas y una pasarela de pagos segura.

3. ## **Justificación** {#justificación}

Actualmente la oferta está dispersa y se canaliza por contactos informales o redes sociales, lo que genera fricción, poca trazabilidad y baja confianza. Formalizar este mercado mediante una plataforma especializada democratiza el acceso, crea oportunidades de ingresos para propietarios y mejora la seguridad mediante verificación de identidad, reglas de reserva y registro de operaciones.

4. ## **Objetivos** {#objetivos}

## **Objetivo General:**  

Diseñar, desarrollar e implementar una plataforma web funcional que permita gestionar de forma segura y eficiente el alquiler de equipos musicales en Uruguay.

## **Objetivos Específicos**

- Implementar autenticación de usuarios con verificación de identidad  
- Permitir crear y editar publicaciones de equipos con descripción, fotos, precio y disponibilidad; y búsqueda con filtros.  
- Implementar flujo de reserva con estados y notificaciones.  
- Implementar una funcionalidad de pago seguro para la gestión de transacciones.  
- Validar la solución con usuarios reales mediante pruebas de usabilidad.  
- Desplegar la plataforma en una infraestructura cloud escalable y segura.

  5. ## **Estructura del documento** {#estructura-del-documento}

El presente documento se organiza en las siguientes secciones:

* Introducción: Plantea el problema en forma de pregunta, la solución propuesta, la justificación y los objetivos del proyecto.  
* Marco teórico y estado del arte: Revisión de conceptos, fundamentos y antecedentes de soluciones similares.  
* Metodología y resultados: Expone el alcance del proyecto, la tecnología empleada y la planificación de las actividades.  
* Conclusiones: Presenta reflexiones sobre los resultados, buenas prácticas, lecciones aprendidas y posibles trabajos futuros.  
* Bibliografía: Referencias bibliográficas utilizadas para fundamentar los apartados.  
* Apéndices: Material complementario, como tablas, diagramas o documentación técnica detallada.

2. # **MARCO TEÓRICO Y ESTADO DEL ARTE** {#marco-teórico-y-estado-del-arte}

   1. ## **Marco Teórico** {#marco-teórico}

La presente propuesta se enmarca en la economía colaborativa, entendida como un modelo socioeconómico basado en el intercambio de bienes y servicios a través de plataformas digitales que intermedian entre oferentes y demandantes (Botsman & Rogers, 2010). Dicho modelo ha transformado industrias como el transporte (Uber), el alojamiento (Airbnb) y el comercio electrónico (Mercado Libre), demostrando la capacidad de generar eficiencia mediante la optimización de recursos subutilizados.

En este contexto, la tecnología de plataformas digitales se constituye como el pilar fundamental. Estas plataformas requieren de:

Módulos de gestión de usuarios con verificación de identidad y reputación digital, para promover la confianza en las interacciones.

Procesamiento de pagos electrónicos conforme a estándares de seguridad internacionales como PCI DSS y OWASP Top 10, con el fin de garantizar la integridad y confidencialidad de las transacciones (OWASP, 2021).

Experiencia de usuario (UX) y usabilidad, guiadas por principios de diseño centrado en el usuario (ISO 9241-210) y pautas de accesibilidad web (WCAG 2.1, W3C, 2018), que aseguren inclusión y facilidad de uso para perfiles diversos.

Asimismo, el modelo de reputación digital desempeña un papel crítico en la sostenibilidad de estas plataformas. Los sistemas de calificación y comentarios permiten reducir la asimetría de información, fomentar conductas responsables y minimizar el riesgo de fraude. En el caso de la música y los espectáculos, este aspecto es central dado que los equipos poseen un alto valor económico y simbólico.

Finalmente, la seguridad de la información constituye un eje transversal. El manejo de datos sensibles, tanto personales como financieros, impone la necesidad de aplicar prácticas de cifrado, autenticación robusta y control de accesos. El proyecto incorpora este enfoque desde la concepción de la arquitectura, buscando garantizar la confianza de los usuarios finales.

2. ## **Estado del arte** {#estado-del-arte}

A nivel internacional, existen iniciativas que han explorado el alquiler de equipos musicales a través de plataformas digitales. Un ejemplo destacado:

* Fretish (Estados Unidos): orientada a conectar músicos independientes con un sistema de catálogo de instrumentos y gestión de alquileres.

Esta propuesta confirma la viabilidad del modelo, aunque presenta limitaciones de adaptación al contexto latinoamericano: falta de integración con medios de pago locales, escasa cobertura en mercados pequeños y barreras culturales en la adopción.

En la región, aunque se han identificado soluciones de alquiler de corto plazo en áreas como movilidad o vivienda, no se han consolidado plataformas especializadas en música. A nivel nacional, el mercado uruguayo carece de una herramienta digital formal que ofrezca servicios de alquiler de equipos musicales con trazabilidad, seguridad y soporte integral. Los músicos recurren principalmente a redes sociales, contactos informales o comercios físicos con oferta limitada, lo que conlleva a riesgos de incumplimientos, altos costos de coordinación y ausencia de garantías.

La revisión bibliográfica sobre plataformas colaborativas muestra que la confianza y la facilidad de uso son factores críticos para la adopción (Hamari, Sjöklint & Ukkonen, 2016). Esto reafirma la necesidad de una solución que contemple tanto la dimensión tecnológica (pasarela de pagos segura, mensajería interna, panel administrativo) como la dimensión social (validación de identidad, reputación, comunicación clara).

3. ## **Síntesis** {#síntesis}

El análisis del marco teórico y del estado del arte permite concluir que:

1. La economía colaborativa ofrece un sustento sólido para el modelo de negocio propuesto.  
2. Existen plataformas internacionales exitosas, pero no adaptadas a la realidad uruguaya.  
3. El contexto local evidencia un vacío en soluciones específicas para alquiler de equipos musicales.

En consecuencia, el proyecto plantea el desarrollo de una plataforma web que responda a este vacío mediante la integración de seguridad, usabilidad y reputación digital, constituyéndose como un aporte innovador al ecosistema musical uruguayo.

3. # **METODOLOGÍA Y RESULTADOS** {#metodología-y-resultados}

   1. ## **Alcance** {#alcance}

El proyecto abarca el desarrollo de una plataforma web para la gestión de alquiler de instrumentos y equipos musicales en Uruguay. El alcance se define a partir de los requerimientos funcionales, no funcionales y las historias de usuario priorizadas en el backlog, acotando la implementación a un Producto Mínimo Viable (MVP) que será presentado en la defensa.

### **Requerimientos funcionales en alcance** {#requerimientos-funcionales-en-alcance}

Se incluyen los siguientes módulos y funcionalidades principales (Must Have del backlog y requerimientos):

* Usuarios y perfiles: registro, autenticación, gestión de perfiles y recuperación de contraseñas.  
* Publicaciones y catálogo: creación, edición y eliminación de publicaciones con fotos, precio y disponibilidad; búsqueda y filtrado por criterios básicos.  
* Reservas: solicitud, aprobación/rechazo, notificaciones de estado y cancelación de reservas.  
* Sistema de calificación y reseñas.  
* Pagos: integración con pasarela (MercadoPago), cálculo de costos y liberación de pagos tras devolución.  
* Comunicación: mensajería interna y notificaciones por correo electrónico.  
* Administración: panel básico para gestión de usuarios y publicaciones.

### **Requerimientos no funcionales en alcance** {#requerimientos-no-funcionales-en-alcance}

El sistema cumplirá con los siguientes criterios:

* Usabilidad: interfaz intuitiva, accesible y responsive.  
* Seguridad: cifrado TLS, almacenamiento seguro de contraseñas, protección contra ataques OWASP Top 10\.  
* Disponibilidad: uptime ≥ 95% en etapa de pruebas y despliegue en servicios cloud.  
* Escalabilidad inicial: arquitectura modular y documentación técnica de soporte.  
* Compatibilidad: soporte en navegadores principales.  
* Legales: cumplimiento de normativa uruguaya de comercio electrónico y protección de datos.

### **Fuera de alcance** {#fuera-de-alcance}

* Desarrollo de aplicación móvil (Android/iOS).  
* Implementación de seguros y logística de transporte.  
* Funcionalidades de menor prioridad del backlog.  
* Expansión internacional.

### **Producto Mínimo Viable (MVP)** {#producto-mínimo-viable-(mvp)}

El MVP comprometido para la defensa incluye:

* Registro y login de usuarios.  
* Creación y búsqueda de publicaciones con filtros básicos.  
* Solicitud, aprobación/cancelación de reservas y notificaciones asociadas.  
* Integración con pasarela de pagos y registro de transacciones.  
* Mensajería interna y notificaciones por correo electrónico.  
* Sistema de calificaciones y reseñas.  
* Panel de administración para gestión básica de usuarios.

 

2. ## **Tecnología** {#tecnología}

### **Resumen Ejecutivo** {#resumen-ejecutivo}

El enfoque técnico combina tecnologías modernas que priorizan la escalabilidad, la experiencia del usuario y la facilidad de mantenimiento. Se opta por Vue.js en el frontend web, permitiendo obtener funcionalidad y cumplir con tiempos de desarrollo optimizados. El backend se basa en Node.js con NestJS, favoreciendo APIs estructuradas y flexibles.

La base de datos será PostgreSQL, por su robustez, confiabilidad y capacidad para manejar consultas complejas.

A nivel de infraestructura se apoyará en servicios cloud de Amazon Web Services (AWS), asegurando alta disponibilidad, despliegue automatizado y bajo costo operativo en las etapas iniciales.

Complementan la solución servicios externos como pasarelas de pago, almacenamiento multimedia, monitoreo y mensajería.

Esta arquitectura permite no solo atender los requerimientos actuales del sistema, sino también escalar y adaptarse a nuevas funcionalidades o incremento sustancial de usuarios en el futuro.

La propuesta ha sido elaborada considerando buenas prácticas de desarrollo, usabilidad y sostenibilidad, buscando no solo cumplir los objetivos del proyecto, sino también facilitar su validación por parte de potenciales aliados estratégicos.

### **Stack Tecnológico Propuesto** {#stack-tecnológico-propuesto}

Se propone un stack tecnológico robusto, escalable y flexible, capaz de soportar las funcionalidades requeridas y adaptarse a futuras expansiones. La elección de estas tecnologías se basa en su popularidad, el soporte de la comunidad, la disponibilidad de recursos y su alineación con los requisitos funcionales (RF) y no funcionales (RNF) definidos.

### **Componentes del Stack Tecnológico** {#componentes-del-stack-tecnológico}

* Frontend (Aplicación Web)  
* Backend (API y Lógica de Negocio)  
* Base de Datos  
* Infraestructura y Despliegue  
* Servicios Adicionales

  ### **Frontend** {#frontend}

  ### ***Aplicación Web*** {#aplicación-web}

* Framework: Vue.js. Framework progresivo, con gran comunidad.  
* Lenguaje: TypeScript  
* Gestor de Estado: Vuex  
* Estilos: Tailwind CSS 

  ### **Backend** {#backend}

* Entorno de Ejecución: Node.js  
* Framework Web: NestJS  
* Lenguaje: TypeScript  
* API: RESTful  
* Autenticación: JWT   
* ORM: Prisma

  ### **Base de Datos** {#base-de-datos}

* Tipo: Relacional  
* SGBD: PostgreSQL 

  ### **Infraestructura y Despliegue** {#infraestructura-y-despliegue}

* Proveedor Cloud: AWS  
* AWS Amplify (frontend), App Runner (backend), RDS (PostgreSQL), S3 (archivos)  
* Contenedores: Docker  
* CI/CD: GitHub Actions/AWS CodePipeline 

  ### **Servicios Adicionales** {#servicios-adicionales}

* Pasarela de Pago: Mercado Pago   
* Notificaciones: Firebase y SES   
* Monitoreo: Amazon CloudWatch 

  ### 

  ### **Resumen Stack** {#resumen-stack}

| Capa | Tecnología | Justificació principal |
| :---- | :---- | :---- |
| Frontend Web | Vue.js, TypeScript, Vuex | Interfaz fluida y curva de aprendizaje baja |
| Backend | Node.js, NestJS, Prisma | Escalabilidad y validaciones integradas |
| Base de Datos | PostgreSQL | Robustez y consultas complejas |
| Infraestructura | AWS, Docker, GitHub Actions | Alta disponibilidad y automatización |
| Servicios Externos | MercadoPago, S3, Firebase, SES | Pagos seguros y gestión de archivos |

  3. ## **Planificación** {#planificación}

### **Product Backlog Inicial** {#product-backlog-inicial}

De acuerdo con el marco de trabajo SCRUM seleccionada para el proyecto, se ha desarrollado el siguiente Product Backlog inicial que traduce los requerimientos identificados en historias de usuario priorizadas. Este backlog servirá como base para la planificación de sprints y el desarrollo incremental de la plataforma de alquiler de equipos musicales.

### **Épicas** {#épicas}

1. Gestión de Usuarios y Perfiles  
2. Publicación y Gestión de Equipos  
3. Búsqueda y Descubrimiento  
4. Reservas y Alquileres  
5. Pagos y Transacciones  
6. Comunicación y Notificaciones  
7. Administración y Seguridad  
8. Experiencia de Usuario y Diseño

### 

### 

### 

### **Matriz de Priorización** {#matriz-de-priorización}

Se ha realizado una evaluación sistemática de todos los requerimientos identificados en el anteproyecto. A continuación, se presenta la matriz de priorización resultante, que combina la clasificación MoSCoW con los valores numéricos calculados mediante la fórmula:

Prioridad \= (VU \+ VN) / (RT \+ EI)

Donde: \- VU: Valor para el Usuario (1-5) \- VN: Valor para el Negocio (1-5) \- RT: Riesgo Técnico (1-5) \- EI: Esfuerzo de Implementación (1-5)

### **Matriz de Priorización de Requerimientos Funcionales** {#matriz-de-priorización-de-requerimientos-funcionales}

| Descripción corta | MoSCoW | VU | VN | RT | EI | Prioridad | Justificación |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Registro de usuarios | Must Have | 5 | 5 | 2 | 2 | 2.5 | Funcionalidad básica para acceso al sistema |
| Autenticación de usuarios | Must Have | 5 | 5 | 2 | 1 | 3.3 | Seguridad básica del sistema |
| Publicación de equipos | Must Have | 5 | 5 | 3 | 2 | 2 | Esencial para disponer de oferta en la plataforma |
| Solicitar reservas | Must Have | 5 | 5 | 3 | 2 | 2 | Funcionalidad core del negocio |
| Pago con billeteras | Must Have | 3 | 3 | 2 | 2 | 1.5 | Crítico para la monetización digital |
| Mensajería interna | Must Have | 4 | 4 | 2 | 3 | 1.6 | Importante para la comunicación |
| Panel de admin | Must Have | 4 | 4 | 3 | 3 | 1.3 | Crítico para gestión |

Esta priorización servirá como guía para la planificación de sprints, asegurando que las funcionalidades más críticas se desarrollen primero, mientras se mantiene un balance entre valor entregado y factibilidad técnica.

### **Plan de gestión de tiempo** {#plan-de-gestión-de-tiempo}

El Plan de Gestión del Tiempo establece el marco para la planificación, desarrollo, gestión, ejecución y control del cronograma del proyecto.Este plan se centra principalmente en la planificación del Proyecto Final de Carrera, considerando un nivel de incertidumbre medio-alto, como es habitual en esta etapa de planificación.

### **Metodología de Programación** {#metodología-de-programación}

El proyecto utilizará un enfoque de programación iterativo e incremental, alineado con la metodología ágil, dentro del marco de trabajo SCRUM. El cronograma se estructura en sprints de dos semanas, con hitos claramente definidos al final de cada sprint para evaluar el progreso y realizar ajustes según sea necesario.

### **Herramientas de Programación** {#herramientas-de-programación}

Para la gestión del cronograma se utilizarán las siguientes herramientas:

* Trello para la gestión diaria de tareas  
* GitHub para el control de versiones y seguimiento de desarrollo  
* Diagrama de Gantt para la visualización del cronograma general

### **Nivel de Precisión y Unidades de Medida** {#nivel-de-precisión-y-unidades-de-medida}

* Las duraciones de las actividades se expresarán en días y semanas   
* El esfuerzo se medirá en horas-persona   
* La precisión de las estimaciones será de \+/- 20% debido al nivel de incertidumbre actual.

### **Umbrales de Control** {#umbrales-de-control}

Se establecen los siguientes umbrales de control para monitorear el desempeño del cronograma:

* Variación permitida: \+/- 10% en la duración de los sprints  
* Desviación significativa: \> 15% en la duración de las actividades críticas  
* Acción correctiva requerida: \> 20% de desviación en hitos principales

### **Reglas para la Medición del Desempeño** {#reglas-para-la-medición-del-desempeño}

 El desempeño del cronograma se medirá utilizando el método de Gestión del Valor Ganado (EVM) a través de los siguientes indicadores:

* Índice de Desempeño del Cronograma (SPI)  
* Variación del Cronograma (SV) 

Se realizarán evaluaciones al final de cada sprint para determinar si se requieren acciones correctivas.

### 

### **Formatos de Informe** {#formatos-de-informe}

Se generarán los siguientes informes de cronograma:

* Informe de estado semanal  
* Informe de fin de sprint (cada dos semanas)  
* Informe de hitos (cuando corresponda)  
* Informe de desviaciones (cuando se superen los umbrales de control)

### **Definición de Actividades** {#definición-de-actividades}

Las actividades del proyecto se han definido a partir de la descomposición de los entregables identificados en el alcance del proyecto. Se han considerado tanto las actividades de desarrollo como las de gestión y documentación.

### **Secuenciación de Actividades** {#secuenciación-de-actividades}

Las actividades se han secuenciado considerando:

* Dependencias obligatorias (técnicas)  
* Dependencias discrecionales (mejores prácticas)  
* Dependencias externas (factores fuera del control del equipo)

### **Estimación de Recursos** {#estimación-de-recursos}

Para cada actividad se han estimado los recursos necesarios:

* Recursos humanos: equipo de desarrollo (2 personas)  
* Recursos tecnológicos: equipos, software, servicios cloud  
* Otros recursos: materiales, espacios de trabajo

### **Estimación de Duración** {#estimación-de-duración}

La duración de las actividades se ha estimado utilizando:

* Estimación análoga (basada en proyectos similares)  
* Estimación paramétrica (cuando aplica)  
* Estimación por tres valores (optimista, más probable, pesimista)

### **Desarrollo del Cronograma** {#desarrollo-del-cronograma}

El cronograma se ha desarrollado considerando:

* Método de la ruta crítica  
* Optimización de recursos  
* Análisis de escenarios "¿Qué pasa si...?"  
* Nivelación de recursos para evitar sobreasignaciones

### **Cronograma del Proyecto** {#cronograma-del-proyecto}

A continuación, se presenta el cronograma del proyecto en formato de Diagrama de Gantt, que abarca desde agosto hasta noviembre de 2025\.

![][image1]

Figura 1: Visualización del Diagrama de Gantt del proyecto, mostrando todas las fases, actividades e hitos desde agosto hasta noviembre de 2025\. El mismo se encuentra disponible en la carpeta de adjuntos para una mejor visualización.

También se anexa la tabla de dependencias, con el detalle de las actividades por fase.

### **Hitos Principales** {#hitos-principales}

| ID | Hito | Fecha | Entregables |
| :---- | :---- | :---- | :---- |
| H1 | Inicio del proyecto | 01/08/2025 | Acta de constitución actualizada |
| H2 | Arquitectura definida | 20/08/2025 | Documento de arquitectura |
| H3 | Módulo de Usuarios completado | 12/09/2025 | Funcionalidades de registro y autenticación |
| H4 | Módulo de Publicación completado | 26/09/2025 | Funcionalidades de publicación y búsqueda |
| H5 | Módulo de Reservas completado | 10/10/2025 | Funcionalidades de reserva y alquiler |
| H6 | Módulos de Pagos y Comunicación completados | 24/10/2025 | Integración de pagos y mensajería |
| H7 | Sistema completo | 07/11/2025 | Plataforma funcional |
| H8 | Cierre del proyecto | 14/11/2025 | Documentación final y presentación |

### **Control del Cronograma** {#control-del-cronograma}

El control del cronograma se realizará mediante: 

1. Reuniones diarias: Seguimiento de avances y obstáculos   
2. Revisiones de sprint: Evaluación del progreso cada dos semanas   
3. Informes de estado: Documentación semanal del avance   
4. Actualización del cronograma: Ajustes según sea necesario

Se utilizarán las siguientes métricas para evaluar el desempeño:

* Velocidad del equipo (puntos de historia completados por sprint)  
* Índice de Desempeño del Cronograma (SPI)  
* Porcentaje de tareas completadas vs. planificadas

### **Gestión de Cambios en el Cronograma** {#gestión-de-cambios-en-el-cronograma}

Los cambios en el cronograma seguirán el siguiente proceso:

1. Identificación del cambio requerido  
2. Análisis de impacto en alcance, tiempo y costo  
3. Aprobación o rechazo del cambio  
4. Actualización del cronograma y comunicación al equipo  
5. Implementación y seguimiento del cambio 

Todos los cambios serán documentados en un registro de cambios para mantener la trazabilidad.

### **Consideraciones Adicionales** {#consideraciones-adicionales}

* El cronograma considera una dedicación de 16-20 horas semanales por integrante del equipo   
* Se han incluido buffers en actividades críticas para absorber posibles retrasos   
* Las fechas de inicio y fin de cada sprint son fijas, pero las actividades dentro de cada sprint pueden ajustarse según las necesidades   
* Se han considerado posibles interrupciones académicas durante el período de desarrollo

### **Plan de Gestión de Riesgos** {#plan-de-gestión-de-riesgos}

El Plan de Gestión de Riesgos establece el marco para identificar, analizar, responder y monitorear los riesgos que podrían afectar el éxito del proyecto.

Este plan se ha desarrollado siguiendo las recomendaciones de la Guía del PMBOK 6ª edición.

La gestión de riesgos es particularmente importante en este proyecto debido a:

* La naturaleza innovadora de la plataforma en el contexto uruguayo  
* El nivel de incertidumbre técnica en algunas funcionalidades  
* La limitación de recursos humanos (equipo de 2 personas)  
* La necesidad de cumplir con plazos académicos estrictos

### **Metodología** {#metodología}

El enfoque para la gestión de riesgos incluye los siguientes procesos:

1. Planificación de la Gestión de Riesgos: Definición de cómo se realizarán las actividades de gestión de riesgos.  
2. Identificación de Riesgos: Determinación de los riesgos que pueden afectar al proyecto y documentación de sus características.  
3. Análisis Cualitativo de Riesgos: Evaluación de la probabilidad e impacto de los riesgos identificados.  
4. Análisis Cuantitativo de Riesgos: Análisis numérico del efecto de los riesgos identificados en los objetivos generales del proyecto.  
5. Planificación de Respuesta a los Riesgos: Desarrollo de opciones y acciones para mejorar las oportunidades y reducir las amenazas.  
6. Implementación de Respuesta a los Riesgos: Implementación de planes de respuesta acordados.  
7. Monitoreo de Riesgos: Seguimiento de los riesgos identificados, identificación de nuevos riesgos y evaluación de la efectividad del proceso de gestión de riesgos.

### **Roles y Responsabilidades** {#roles-y-responsabilidades}

| Rol | Responsabilidades |
| :---- | :---- |
| Equipo completo | Identificación de riesgos, análisis cualitativo, planificación de respuestas |
| Leandro Rivero | Monitoreo de riesgos técnicos relacionados con backend, seguridad e infraestructura |
| Federico Fourcade | Monitoreo de riesgos relacionados con frontend, experiencia de usuario y diseño |
| Tutores | Asesoramiento en la gestión de riesgos, validación de estrategias de mitigación |

### **Categorías de Riesgos** {#categorías-de-riesgos}

Para facilitar la identificación sistemática de riesgos, se han establecido las siguientes categorías:

1. **Riesgos Técnicos**  
2. Desarrollo de software  
3. Infraestructura y despliegue  
4. Integración de sistemas  
5. Seguridad de la información  
6. **Riesgos de Gestión**  
7. Planificación y control  
8. Comunicación  
9. Recursos humanos  
10. Gestión de cambios  
11. **Riesgos Comerciales**   
12. Requisitos del mercado   
13. Competencia   
14. Modelo de negocio   
15. Aspectos legales y normativos   
16. **Riesgos Externos**   
17. Factores académicos   
18. Proveedores y servicios externos   
19. Factores económicos   
20. Factores sociales y culturales

### **Definiciones de Probabilidad e Impacto** {#definiciones-de-probabilidad-e-impacto}

### ***Escala de Probabilidad*** {#escala-de-probabilidad}

| Nivel | Descriptor | Definición |
| :---- | :---- | :---- |
| 1 | Muy baja | \<10% de probabilidad de ocurrencia |
| 2 | Baja | 10-30% de probabilidad de ocurrencia |
| 3 | Media | 30-50% de probabilidad de ocurrencia |
| 4 | Alta | 50-70% de probabilidad de ocurrencia |
| 5 | Muy alta | \>70% de probabilidad de ocurrencia |

### ***Escala de Impacto*** {#escala-de-impacto}

| Nivel | Descriptor | Impacto en Alcance | Impacto en Tiempo | Impacto en Costo | Impacto en Calidad |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | Muy bajo | Cambio apenas perceptible | \<1 semana | \<5% | Degradación apenas perceptible |
| 2 | Bajo | Áreas menores afectadas | 1-2 semanas | 5-10% | Afectación en elementos no críticos |
| 3 | Moderado | Áreas importantes afectadas | 2-3 semanas | 10-20% | Reducción de calidad requiere aprobación |
| 4 | Alto | Reducción del alcance inaceptable | 3-4 semanas | 20-40% | Reducción de calidad inaceptable |
| 5 | Muy alto | Producto final inservible | 3-4 semanas | \>40% | Producto final rechazado |

### ***Matriz de Probabilidad e Impacto*** {#matriz-de-probabilidad-e-impacto}

| Probabilidad/ Impacto | Muy bajo (1) | Bajo (2) | Moderado (3) | Alto (4) | Muy alto (5) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Muy alta (5) | 5 | 10 | 15 | 20 | 25 |
| Alta (4) | 4 | 8 | 12 | 16 | 20 |
| Media (3) | 3 | 6 | 9 | 12 | 15 |
| Baja (2) | 2 | 4 | 6 | 9 | 10 |
| Muy baja (1) | 1 | 2 | 3 | 4 | 5 |

**Niveles de prioridad:**

* Baja: 1-4   
* Media: 5-9   
* Alta: 10-16   
* Muy alta: 17-25 

  ### ***Principales Riesgos Identificados*** {#principales-riesgos-identificados}

A continuación, se presenta una tabla con los principales riesgos identificados para el proyecto:

| ID | Descripción del Riesgo |
| :---- | :---- |
| R01 | Cambios significativos en los requisitos durante el desarrollo |
| R02 | Dificultades en la integración con pasarelas de pago |
| R03 | Rendimiento insuficiente de la plataforma con alto volumen de datos |
| R04 | Problemas de seguridad en la gestión de datos sensibles |
| R05 | Retrasos en el desarrollo por complejidad técnica subestimada |

Para identificar los 5 principales riesgos, se utilizaron los siguientes criterios, basados en la información disponible en la tabla de riesgos:

* Impacto Potencial: Se priorizaron los riesgos que, de materializarse, tendrían un impacto significativo en el proyecto, afectando áreas críticas como el desarrollo, la seguridad, el rendimiento o la viabilidad comercial.  
* Probabilidad Implícita: Se infirió la probabilidad basándose en la descripción del riesgo y los disparadores. Por ejemplo, los cambios en los requisitos (R01) son un riesgo común en proyectos de software, lo que sugiere una probabilidad más alta.  
* Amplitud del Impacto: Se consideró si el riesgo afectaba a múltiples módulos o entregables del proyecto, lo que indicaría un impacto más generalizado y, por lo tanto, una mayor criticidad.  
* Naturaleza del Riesgo: Se buscó una representación equilibrada de diferentes categorías de riesgos (Gestión, Técnico) para ofrecer una visión integral de los desafíos más importantes.

Basado en estos criterios, los 5 riesgos seleccionados representan una combinación de alta probabilidad (implícita) y alto impacto potencial en áreas clave del proyecto.

### **Identificación de Riesgos** {#identificación-de-riesgos}

Se anexa tabla con el detalle de la identificación de los riesgos llamada “Tabla de identificación y plan de respuesta de riesgos”.

### **Análisis Cualitativo de Riesgos** {#análisis-cualitativo-de-riesgos}

Basado en la matriz de probabilidad e impacto, se ha realizado el siguiente análisis cualitativo:

| ID | Probabilidad | Impacto | Puntuación | Prioridad |
| :---- | :---- | :---- | :---- | :---- |
| R01 | 4 (Alta) | 4 (Alto) | 16 | Alta |
| R02 | 3 (Media) | 5 (Muy alto) | 15 | Alta |
| R03 | 3 (Media) | 4 (Alto) | 12 | Alta |
| R04 | 2 (Baja) | 5 (Muy alto) | 10 | Alta |
| R05 | 4 (Alta) | 3 (Moderado) | 12 | Alta |
| R06 | 3 (Media) | 3 (Moderado) | 9 | Media |
| R07 | 3 (Media) | 4 (Alto) | 12 | Alta |
| R08 | 2 (Baja) | 3 (Moderado) | 6 | Media |
| R09 | 3 (Media) | 4 (Alto) | 12 | Alta |
| R10 | 2 (Baja) | 3 (Moderado) | 6  | Media |
| R11 | 1 (Muy baja) | 4 (Alto) | 4 | Baja |
| R12 | 2 (Baja) | 3 (Moderado) | 6 | Media |
| R13 | 3 (Media) | 4 (Alto) | 12 | Alta |
| R14 | 2 (Baja) | 3 (Moderado) | 6 | Media |
| R15 | 3 (Media) | 2 (Bajo) | 6 | Media |

### **Análisis Cuantitativo de Riesgos** {#análisis-cuantitativo-de-riesgos}

Para los riesgos de alta prioridad, se ha realizado un análisis cuantitativo utilizando la técnica de Valor Monetario Esperado (VME) y análisis de impacto en el cronograma:

| ID | Probabilidad | Impacto en Costo (USD) | VME (USD) | Impacto en Cronograma (días) | VME Cronograma (días) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| R01 | 0.60 | 1500 | 900 | 10 | 6.0 |
| R02 | 0.40 | 2000 | 800 | 12 | 4.8 |
| R03 | 0.40 | 1800 | 720 | 8 | 3.2 |
| R04 | 0.25 | 2500 | 625 | 15 | 3.8 |
| R05 | 0.60 | 1200 | 720 | 14 | 8.4 |
| R07 | 0.40 | 1500 | 600 | 7 | 2.8 |
| R09 | 0.40 | 1800 | 720 | 5 | 2.0 |
| R13 | 0.40 | 2000 | 800 | 0 | 0.0 |

**Análisis de la Reserva para Contingencias:**

* Reserva para contingencias de costo: $5,885 USD  
* Reserva para contingencias de cronograma: 31 días

**Análisis de Sensibilidad:** Los riesgos R01 (Cambios en requisitos) y R05 (Retrasos por complejidad técnica) tienen el mayor impacto potencial en el cronograma, mientras que R02 (Integración con pasarelas de pago) y R13 (Resistencia de usuarios) tienen el mayor impacto potencial en los costos.

**Análisis de Árbol de Decisiones:** Para el riesgo R02 (Integración con pasarelas de pago), se evaluaron dos alternativas:

1. Desarrollar integración personalizada: Costo esperado $2,000 USD, probabilidad de éxito 60%  
2. Utilizar solución de pago pre-integrada: Costo esperado $1,200 USD, probabilidad de éxito 90% 

Valor Monetario Esperado:

* Opción 1: 0.6 × $0 \+ 0.4 × $2,000 \= $800 USD  
* Opción 2: 0.9 × $0 \+ 0.1 × $1,200 \= $120 USD 

Decisión: Utilizar solución de pago pre-integrada (Opción 2\)

### **Plan de Respuesta a los Riesgos** {#plan-de-respuesta-a-los-riesgos}

Se anexa tabla con el detalle del plan de respuesta a los riesgos llamada “Plan de respuesta a riesgos”.

### **Estrategias de Respuesta Detalladas** {#estrategias-de-respuesta-detalladas}

R01: Cambios significativos en los requisitos durante el desarrollo

Estrategia: Mitigar

La estrategia de mitigación se enfoca en reducir la probabilidad de cambios tardíos mediante validación continua y gestión estructurada de cambios:

1. **Implementar proceso de validación continua:**  
2. Realizar sesiones de revisión de requisitos al final de cada sprint  
3. Utilizar técnicas de prototipado rápido para visualizar funcionalidades  
4. Documentar y comunicar decisiones de diseño  
5. **Utilizar enfoque de MVP (Producto Mínimo Viable):**  
6. Definir claramente el alcance del MVP al inicio del proyecto  
7. Priorizar funcionalidades core en los primeros sprints  
8. Obtener feedback temprano sobre funcionalidades críticas  
9. **Establecer proceso formal de gestión de cambios:**  
10. Crear comité de control de cambios (equipo \+ tutores)  
11. Documentar solicitudes de cambio con análisis de impacto  
12. Implementar sistema de priorización para cambios solicitados

Costo de implementación: $300 USD (principalmente para herramientas de prototipado y sesiones con usuarios).

Responsable: Equipo completo 

Disparador para implementación: Inicio del proyecto

R02: Dificultades en la integración con pasarelas de pago

Estrategia: Transferir 

La estrategia de transferencia busca reducir el riesgo utilizando soluciones probadas y con soporte técnico:

1. **Utilizar solución de pago pre-integrada:**  
2. Seleccionar proveedor con API bien documentada y soporte local  
3. Implementar usando SDKs oficiales en lugar de integración personalizada  
4. Realizar pruebas exhaustivas en entorno sandbox  
5. **Establecer acuerdo de nivel de servicio:**  
6. Negociar términos de soporte técnico con el proveedor  
7. Definir tiempos de respuesta para incidencias críticas  
8. Establecer canales de comunicación directa con soporte técnico  
9. **Desarrollar modo offline para operaciones críticas:**  
10. Implementar sistema de reservas temporales sin pago inmediato  
11. Crear mecanismo de cola para procesar pagos cuando el servicio se restablezca  
12. Diseñar flujos alternativos para usuarios en caso de fallo del sistema de pagos

Costo de implementación: $500 USD (incluye costos de suscripción a servicios premium de API) 

Responsable: Leandro

Disparador para implementación: Antes del Sprint 5 (cuando se inicie el desarrollo del módulo de pagos).

R03: Rendimiento insuficiente de la plataforma con alto volumen de datos

Estrategia: Mitigar 

La estrategia de mitigación se enfoca en asegurar que la plataforma pueda manejar eficientemente altos volúmenes de datos desde las etapas iniciales del desarrollo: 

1. **Implementar pruebas de carga desde etapas tempranas:**   
2. Desarrollar escenarios de prueba que simulan condiciones de uso intensivo   
3. Utilizar herramientas como JMeter o Locust para simular múltiples usuarios concurrentes   
4. Establecer umbrales de rendimiento aceptables (tiempo de respuesta \< 3 segundos)   
5. **Diseñar arquitectura escalable con cachés:**   
6. Implementar una arquitectura de microservicios que permita escalar componentes críticos de forma independiente   
7. Utilizar sistemas de caché como Redis para almacenar resultados de consultas frecuentes   
8. Implementar estrategias de paginación para conjuntos de datos grandes   
9. **Optimizar consultas a la base de datos:**   
10. Diseñar índices eficientes basados en patrones de consulta más frecuentes   
11. Implementar consultas optimizadas y evitar operaciones costosas como JOINs complejos   
12. Utilizar técnicas de lazy loading para cargar datos solo cuando sean necesarios

Costo de implementación: $200 USD (principalmente para herramientas de prueba de carga y servicios de monitoreo) 

Responsable: Leandro

Disparador para implementación: Durante Sprint 1 (cuando se defina la arquitectura del sistema)

R04: Problemas de seguridad en la gestión de datos sensibles

Estrategia: Evitar

La estrategia de evitar busca prevenir completamente la ocurrencia de problemas de seguridad mediante la implementación de prácticas robustas desde el inicio:

1. **Implementar auditoría de seguridad por expertos externos:**  
2. Contratar un servicio de pentesting para evaluar vulnerabilidades  
3. Realizar análisis estático de código para identificar problemas de seguridad  
4. Establecer un proceso de revisión de seguridad antes de cada despliegue importante  
5. **Seguir estándares OWASP para desarrollo seguro:**  
6. Implementar protección contra las 10 vulnerabilidades principales de OWASP  
7. Utilizar bibliotecas y frameworks con actualizaciones de seguridad regulares  
8. Establecer políticas de contraseñas seguras y autenticación multifactor  
9. **Utilizar servicios certificados para datos sensibles:**  
10. Implementar cifrado de datos en reposo y en tránsito (SSL/TLS)  
11. Utilizar servicios de almacenamiento con certificaciones de seguridad (ISO 27001, SOC 2\)  
12. Implementar tokenización para información de pago y datos personales sensibles

Costo de implementación: $600 USD (incluye servicios de auditoría externa y herramientas de análisis de seguridad) 

Responsable: Leandro 

Disparador para implementación: Antes del Sprint 2 (cuando se inicie el desarrollo del módulo de usuarios)

R05: Retrasos en el desarrollo por complejidad técnica subestimada

Estrategia: Mitigar

La estrategia de mitigación se centra en mejorar la precisión de las estimaciones y crear mecanismos para absorber posibles retrasos:

1. **Incluir buffer de contingencia en estimaciones:**  
2. Aplicar la técnica de estimación PERT (Optimista, Más probable, Pesimista)  
3. Agregar un buffer del 20% en tareas con alta incertidumbre técnica  
4. Revisar y ajustar estimaciones basadas en la velocidad real del equipo  
5. **Realizar revisiones técnicas al inicio de cada sprint:**  
6. Implementar sesiones de planificación técnica detallada antes de comprometer tareas  
7. Descomponer historias complejas en tareas más pequeñas y manejables  
8. Identificar dependencias técnicas y riesgos específicos para cada tarea  
9. **Priorizar funcionalidades críticas en sprints tempranos:**  
10. Implementar enfoque de desarrollo basado en riesgos (abordar primero las áreas más inciertas)  
11. Establecer MVP claramente definido con funcionalidades esenciales  
12. Mantener un backlog priorizado con flexibilidad para ajustar alcance si es necesario

Costo de implementación: $0 USD (se implementa como parte del proceso de gestión

del proyecto)

Responsable: Equipo completo

Disparador para implementación: Inicio del proyecto

R07: Problemas de usabilidad que afecten la experiencia de usuario

Estrategia: Mitigar

La estrategia de mitigación busca identificar y resolver problemas de usabilidad

tempranamente mediante validación continua con usuarios:

1. **Realizar pruebas de usabilidad con usuarios reales:**  
2. Establecer un grupo de usuarios beta para pruebas periódicas  
3. Implementar metodología de pruebas de usabilidad con tareas específicas  
4. Recopilar y analizar métricas de usabilidad (tiempo de completitud, tasa de error, satisfacción)  
5. **Implementar diseño basado en componentes reutilizables:**  
6. Desarrollar una biblioteca de componentes UI consistentes  
7. Seguir principios de diseño responsivo para diferentes dispositivos  
8. Implementar patrones de interacción familiares y probados  
9. **Seguir guías de diseño establecidas:**  
10. Adoptar un sistema de diseño conocido (Material Design, Bootstrap)  
11. Mantener consistencia visual y de interacción en toda la plataforma  
12. Implementar principios de accesibilidad web (WCAG 2.1)

Costo de implementación: $300 USD (principalmente para herramientas de pruebas de usabilidad y compensación a usuarios de prueba) 

Responsable: Federico 

Disparador para implementación: Durante Sprint 2 (cuando se inicie el desarrollo de interfaces de usuario)

R09: Dificultades en el despliegue en la nube

Estrategia: Mitigar

La estrategia de mitigación se enfoca en reducir la probabilidad de problemas de despliegue mediante automatización y entornos consistentes:

1. **Crear entorno de staging similar a producción:**  
2. Implementar entornos de desarrollo, pruebas y producción con configuraciones similares  
3. Utilizar contenedores Docker para garantizar consistencia entre entornos  
4. Establecer procesos de promoción de código entre entornos  
5. **Automatizar proceso de despliegue:**  
6. Implementar integración continua (CI) y despliegue continuo (CD)  
7. Utilizar herramientas como GitHub Actions o Jenkins para automatizar pruebas y despliegue  
8. Establecer procesos de rollback automático en caso de fallos  
9. **Documentar configuración de infraestructura como código:**  
10. Utilizar herramientas de IaC como Terraform o CloudFormation  
11. Mantener toda la configuración de infraestructura en control de versiones  
12. Crear documentación detallada de la arquitectura y configuración del sistema

Costo de implementación: $200 USD (principalmente para servicios cloud adicionales para entorno de staging) 

Responsable: Leandro 

Disparador para implementación: Durante Sprint 1 (cuando se defina la arquitectura del sistema)

R13: Resistencia de usuarios potenciales a adoptar la plataforma

Estrategia: Mitigar

La estrategia de mitigación busca reducir las barreras de entrada y aumentar el valor percibido para fomentar la adopción:

1. **Desarrollar estrategia de onboarding simplificada:**  
2. Crear proceso de registro y primeros pasos intuitivo y rápido  
3. Implementar tutoriales interactivos para nuevos usuarios  
4. Reducir la fricción inicial minimizando campos obligatorios y validaciones complejas  
5. **Implementar programa de incentivos para primeros usuarios:**  
6. Ofrecer descuentos o beneficios para primeros adoptantes  
7. Crear sistema de referidos con recompensas para usuarios existentes  
8. Establecer programa de fidelización con beneficios progresivos  
9. **Realizar campañas de educación sobre beneficios:**  
10. Desarrollar contenido que destaque ventajas sobre métodos tradicionales  
11. Crear casos de estudio y testimonios de usuarios satisfechos  
12. Implementar estrategia de comunicación enfocada en resolver puntos de dolor específicos

Costo de implementación: $400 USD (incluye costos de incentivos iniciales y materiales de marketing) 

Responsable: Federico 

Disparador para implementación: Antes de pruebas beta (cuando la plataforma tenga funcionalidades básicas completas)

### **Monitoreo y Control de Riesgos** {#monitoreo-y-control-de-riesgos}

El proceso de monitoreo y control de riesgos incluirá:

1. **Revisiones periódicas de riesgos:**   
2. Revisión semanal de riesgos de alta prioridad  
3. Revisión quincenal de todos los riesgos identificados  
4. Actualización del registro de riesgos después de cada sprint  
5. **Métricas de seguimiento:**  
6. Estado actual de cada riesgo (no ocurrido, ocurrido, mitigado, cerrado)  
7. Efectividad de las acciones de respuesta implementadas  
8. Nuevos riesgos identificados por sprint  
9. **Informes de riesgos:**  
10. Informe de estado de riesgos en cada revisión de sprint  
11. Informe de lecciones aprendidas sobre riesgos materializados  
12. Dashboard visual de riesgos para seguimiento continuo  
13. **Proceso de escalamiento:**  
14. Definición de umbrales para escalamiento de riesgos  
15. Procedimiento de notificación a tutores cuando sea necesario  
16. Mecanismo de toma de decisiones para riesgos críticos emergentes

    ### **Reservas de Contingencia y Gestión** {#reservas-de-contingencia-y-gestión}

Basado en el análisis cuantitativo, se establecen las siguientes reservas:

1. **Reserva para Contingencias:**  
2. Reserva de tiempo: 31 días (distribuidos estratégicamente en el cronograma)  
3. Reserva de costo: $5,885 USD (aproximadamente 15% del presupuesto total)  
4. **Reserva de Gestión:**  
5. Reserva adicional de tiempo: 2 semanas (para riesgos no identificados)  
6. Reserva adicional de costo: $2,000 USD (aproximadamente 5% del presupuesto total)  
7. **Criterios para uso de reservas:**  
8. Las reservas para contingencias se utilizarán automáticamente cuando se materialicen riesgos identificados  
9. Las reservas de gestión requerirán aprobación de los tutores  
10. Todo uso de reservas será documentado y justificado

    ### **Lecciones Aprendidas** {#lecciones-aprendidas}

Se implementará un proceso de documentación de lecciones aprendidas relacionadas con riesgos:

1. **Registro de riesgos materializados:**  
2. Documentación de causas reales vs. anticipadas  
3. Efectividad de las respuestas planificadas  
4. Impacto real en el proyecto  
5. **Mejora continua:**  
6. Actualización de plantillas de identificación de riesgos  
7. Refinamiento de escalas de probabilidad e impacto  
8. Mejora de estrategias de respuesta basadas en experiencia  
9. **Conocimiento organizacional:**  
10. Creación de base de conocimiento de riesgos para futuros proyectos  
11. Compartir lecciones aprendidas con otros equipos académicos  
12. Documentación de mejores prácticas identificadas

### **Plan de Gestión de Costos** {#plan-de-gestión-de-costos}

El Plan de Gestión de Costos establece el marco para planificar, estimar, presupuestar, financiar, gestionar y controlar los costos del proyecto. Este plan se ha desarrollado siguiendo las recomendaciones de la Guía del PMBOK 6ª edición.

La gestión de costos es fundamental para asegurar que el proyecto se complete dentro del presupuesto aprobado y proporcione el valor esperado. 

      Unidades de Medida

* Todos los costos se expresarán en dólares estadounidenses (USD)  
* El trabajo se medirá en horas-persona  
* Los materiales se cuantifican en unidades específicas según su naturaleza  
  Nivel de Precisión y Exactitud  
* Nivel de precisión: Los costos se redondearán al dólar más cercano  
* Nivel de exactitud: Las estimaciones tendrán una precisión de \+/- 15% en esta etapa del proyecto

  ### **Enlaces con los Procedimientos de la Organización** {#enlaces-con-los-procedimientos-de-la-organización}

Al tratarse de un proyecto académico, no existen procedimientos organizacionales formales para la gestión de costos. Sin embargo, se seguirán las mejores prácticas recomendadas por la Guía del PMBOK 6ª edición y los lineamientos establecidos por la universidad.

### **Umbrales de Control** {#umbrales-de-control-1}

Se establecen los siguientes umbrales para monitorear el desempeño de los costos: 

* Variación permitida: \+/- 10% del presupuesto por entregable  
* Desviación significativa: \> 15% del presupuesto por fase  
* Acción correctiva requerida: \> 20% del presupuesto total

  ### **Reglas para la Medición del Desempeño** {#reglas-para-la-medición-del-desempeño-1}

El desempeño de los costos se medirá utilizando el método de Gestión del Valor Ganado (EVM):

* Índice de Desempeño del Costo (CPI)  
* Variación del Costo (CV)

Se realizarán evaluaciones al final de cada sprint para determinar si se requieren acciones correctivas.

### **Formatos de Informe** {#formatos-de-informe-1}

Se generarán los siguientes informes de costos:

* Informe de costos mensual  
* Informe de fin de sprint (cada dos semanas)  
* Informe de variaciones (cuando se superen los umbrales de control)  
* Informe de pronóstico de costos al término (EAC)

  ### **Proceso de Estimación de Costos** {#proceso-de-estimación-de-costos}

La estimación de costos se ha realizado utilizando una combinación de las siguientes técnicas:

1. Estimación Análoga: Basada en proyectos similares desarrollados anteriormente  
2. Estimación Paramétrica: Utilizando relaciones estadísticas entre datos históricos y variables  
3. Estimación Ascendente: Descomponiendo el trabajo en componentes más pequeños  
4. Estimación por Tres Valores (PERT): Considerando escenarios optimista, más probable y pesimista  
5. Análisis de Reservas: Incluyendo reservas para contingencias y gestión

   ### **Estructura de Desglose de Costos** {#estructura-de-desglose-de-costos}

Los costos del proyecto se han categorizado en las siguientes categorías principales:

1. **Costos de Personal**  
2. Horas de desarrollo técnico (backend, frontend, testing)  
3. Horas de gestión de proyecto  
4. Horas de documentación y diseño  
5. **Costos de Infraestructura y Tecnología**  
6. Servicios cloud (AWS o Google Cloud)  
7. Herramientas y licencias de software  
8. Dominios y certificados SSL  
9. **Costos de Servicios Externos**  
10. Servicios de pasarela de pago  
11. Servicios de notificaciones  
12. Servicios de almacenamiento  
13. **Costos de Equipamiento**  
14. Hardware para desarrollo  
15. Dispositivos para pruebas  
16. **Otros Costos**  
17. Materiales de oficina  
18. Gastos de comunicación  
19. Contingencias y reservas

    ### **Estimación de Costos del Proyecto Final** {#estimación-de-costos-del-proyecto-final}

La siguiente tabla presenta la estimación detallada de costos para la fase de proyecto final:

| Categoría | Descripción | Cantidad | Unidad | Costo Unitario (USD) | Costo Total (USD) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Personal | Horas de desarrollo backend | 320 | Horas | 30 | 9600 |
|  | Horas de desarrollo frontend | 280 | Horas | 30 | 8400 |
|  | Horas de testing | 120 | Horas | 30 | 3600 |
|  | Horas de documentación | 80 | Horas | 30 | 2400 |
|  | Horas de gestión | 60 | Horas | 30 | 1800 |
| Infraestructura | Servicios cloud (desarrollo) | 4 | Meses | 100 | 400 |
|  | Servicios cloud (producción) | 1 | Mes | 150 | 150 |
|  | Dominio y certificados SSL | 1 | Año | 50 | 50 |
|  | Servicios de pasarela de pago | 1 | Implementación | 300 | 300 |
|  | Servicios de notificaciones | 4 | Meses | 30 | 120 |
| Equipamiento | Amortización de equipos de desarrollo | 2 | Equipos | 200 | 400 |
|  | Dispositivos para pruebas | 2 | Dispositivos | 100 | 200 |
| Otros | Materiales de oficina | 1 | Global | 100 | 100 |
|  | Comunicaciones | 4 | Meses | 30 | 120 |
| Subtotal |  |  |  |  | 27640 |
| Reserva para Contingencias (15%) |  |  |  |  | 4146 |
| Reserva de Gestión (5%) |  |  |  |  | 1382 |
| Total Proyecto Final |  |  |  |  | 33168 |

### **Análisis de Escenarios** {#análisis-de-escenarios}

Para contemplar diferentes realidades de incertidumbre y riesgo, se han desarrollado tres escenarios de costos:

**Escenario Optimista:**

Supuestos:

* Desarrollo más rápido de lo previsto (10% menos de horas)  
* Menor necesidad de recursos cloud (20% menos)  
* Sin materialización de riesgos significativos

| Fase | Costo Base (USD) | Reducción (%) | Costo Optimista (USD) |
| :---- | :---- | :---- | :---- |
| Proyecto Final | 27640 | 15 | 23948 |
| Reservas | 5528 | 30 | 3870 |
| Total | 33168 |  | 27818 |

**Escenario Más Probable:**

Este escenario corresponde a la estimación base presentada anteriormente, con un costo total de 40678 USD.

**Escenario Pesimista:**

Supuestos:

* Desarrollo más lento de lo previsto (20% más de horas)  
* Mayor necesidad de recursos cloud (30% más)  
* Materialización de algunos riesgos identificados

| Fase | Costo Base (USD) | Incremento (%) | Costo Pesimista (USD) |
| :---- | :---- | :---- | :---- |
| Proyecto Final | 27640 | 25 | 34550 |
| Reservas | 5528 | 10 | 6081 |
| Total | 33168 |  | 40631 |

  ### **Control de costos** {#control-de-costos}

El proceso de control de costos incluirá:

1. **Monitoreo regular:**  
2. Seguimiento semanal de horas dedicadas  
3. Revisión quincenal de gastos en servicios cloud  
4. Actualización mensual del presupuesto  
5. **Análisis de variaciones:**  
6. Cálculo de variaciones de costo (CV) e índice de desempeño del costo (CPI)  
7. Identificación de causas raíz de desviaciones  
8. Implementación de acciones correctivas cuando sea necesario  
9. **Gestión de cambios en el presupuesto:**  
10. Evaluación del impacto de cambios en el alcance  
11. Actualización del presupuesto cuando se aprueben cambios  
12. Documentación de todas las modificaciones  
13. **Informes de desempeño:**  
14. Generación de informes de estado de costos en cada sprint  
15. Proyecciones de costo al término (EAC)  
16. Análisis de tendencias

    ### **Supuestos y Restricciones** {#supuestos-y-restricciones}

Supuestos:

* La tarifa estándar para horas técnicas se establece en 30 USD/hora  
* El proyecto se desarrollará principalmente con herramientas de código abierto  
* Se utilizarán servicios cloud con modelo PaaS para el despliegue  
* No se consideran costos de adquisición de nuevos equipos, solo amortización

Restricciones:

* No se consideran categorías especiales como inflación o costo de financiamiento  
* No se incluyen costos de marketing o promoción post-lanzamiento  
* No se consideran costos de mantenimiento más allá del período del proyecto

  ### **Consideraciones Adicionales** {#consideraciones-adicionales-1}

1. **Optimización de costos:**  
2. Uso de servicios cloud con escalado automático  
3. Aprovechamiento de planes gratuitos y créditos académicos  
4. Selección de tecnologías con bajo costo de operación  
5. **Gestión de riesgos financieros:**  
6. Monitoreo continuo de consumo de recursos cloud  
7. Establecimiento de alertas de presupuesto  
8. Planificación de alternativas en caso de restricciones presupuestarias  
9. **Sostenibilidad financiera:**  
10. Análisis preliminar de costos operativos post-proyecto  
11. Identificación de potenciales fuentes de ingresos  
12. Evaluación de modelos de monetización

### **Enfoque de Calidad** {#enfoque-de-calidad}

El Enfoque de Calidad establece el marco para planificar, asegurar y controlar la calidad a lo largo del ciclo de vida del proyecto. Este enfoque se ha desarrollado siguiendo las recomendaciones de la Guía del PMBOK 6ª edición.

La calidad es un factor crítico para el éxito de la plataforma, ya que impacta directamente en la experiencia del usuario, la seguridad de las transacciones y la confiabilidad del sistema. Este enfoque inicial de calidad servirá como base para el desarrollo de un Plan de Gestión de Calidad completo en etapas posteriores del proyecto.

### **Política de Calidad** {#política-de-calidad}

La política de calidad del proyecto se basa en los siguientes principios:

1. Enfoque en el usuario: Todas las decisiones de diseño y desarrollo se tomarán considerando las necesidades y expectativas de los usuarios finales.  
2. Mejora continua: Se implementará un ciclo de retroalimentación constante para identificar oportunidades de mejora en todos los aspectos del proyecto.  
3. Prevención sobre inspección: Se priorizará la prevención de defectos mediante buenas prácticas de desarrollo, en lugar de depender exclusivamente de la detección a través de pruebas.  
4. Cumplimiento normativo: Se asegurará el cumplimiento de todas las normativas legales y estándares técnicos aplicables.  
5. Transparencia: Se mantendrá una comunicación clara y abierta sobre los aspectos de calidad con todos los interesados del proyecto.

   ### **Objetivos de calidad** {#objetivos-de-calidad}

Los objetivos específicos de calidad para el proyecto son:

1. Funcionalidad: Desarrollar una plataforma que cumpla con todos los requisitos funcionales especificados, con un nivel de completitud del 100% para requisitos "Must Have" y al menos 90% para requisitos "Should Have".  
2. Usabilidad: Lograr una puntuación de usabilidad de al menos 4/5 en pruebas con usuarios reales, medida a través de métricas como la tasa de éxito en tareas, tiempo de completitud y satisfacción subjetiva.  
3. Rendimiento: Asegurar tiempos de respuesta inferiores a 2 segundos para el 95% de las operaciones en condiciones normales de uso.  
4. Seguridad: Implementar todas las medidas de seguridad requeridas y superar evaluaciones de vulnerabilidad con cero hallazgos de severidad alta.  
5. Fiabilidad: Mantener una disponibilidad del sistema del 99.5% durante las fases de prueba y una tasa de errores inferior al 1% en transacciones críticas.  
6. Mantenibilidad: Lograr una cobertura de código de al menos 80% en pruebas automatizadas y mantener una deuda técnica controlada según métricas de SonarQube.

   ## 

### 

### **Roles y Responsabilidades de Calidad** {#roles-y-responsabilidades-de-calidad}

| Rol | Responsabilidades |
| :---- | :---- |
| Equipo completo | Implementación de estándares de calidad, revisiones de código, pruebas unitarias |
| Leandro Rivero | Aseguramiento de calidad en backend, seguridad y rendimiento |
| Federico Fourcade  | Aseguramiento de calidad en frontend, usabilidad y experiencia de usuario |
| Tutores | Revisión de entregables, validación de cumplimiento de estándares académicos |

### 

### **Estándares de Calidad Aplicables** {#estándares-de-calidad-aplicables}

El proyecto adoptará los siguientes estándares y mejores prácticas:

1. **Desarrollo de Software:**  
2. Estándares de codificación: ESLint para JavaScript, PEP 8 para Python  
3. Control de versiones: Gitflow Workflow  
4. Revisión de código: Revisión por pares obligatoria para todos los cambios  
5. **Seguridad:**  
6. OWASP Top 10 para seguridad web  
7. GDPR y normativa uruguaya de protección de datos  
8. PCI DSS para el manejo de información de pagos  
9. **Usabilidad:**  
10. Principios de diseño centrado en el usuario (ISO 9241-210)  
11. Pautas de accesibilidad web (WCAG 2.1, nivel AA)  
12. **Arquitectura:**  
13. Principios SOLID para diseño orientado a objetos  
14. Patrones de arquitectura limpia (Clean Architecture)  
15. Microservicios para componentes críticos

### **Actividades de Aseguramiento de Calidad** {#actividades-de-aseguramiento-de-calidad}

Planificación de la Calidad

1. **Definición de estándares y métricas:**  
2. Establecimiento de umbrales de aceptación para cada métrica de calidad  
3. Documentación de convenciones de código y arquitectura  
4. Creación de plantillas para documentación técnica  
5. **Planificación de revisiones:**  
6. Programación de revisiones técnicas formales al final de cada sprint  
7. Definición de criterios de entrada y salida para cada fase de desarrollo  
8. Establecimiento de listas de verificación para revisiones  
9. **Planificación de pruebas:**  
10. Desarrollo de estrategia de pruebas (unitarias, integración, sistema, aceptación)  
11. Identificación de herramientas de automatización de pruebas  
12. Definición de entornos de prueba (desarrollo, staging, producción)

Aseguramiento de la Calidad

1. **Revisiones técnicas:**  
2. Revisiones de arquitectura al inicio del proyecto  
3. Revisiones de diseño antes de la implementación de módulos críticos  
4. Revisiones de código mediante pull requests  
5. **Auditorías de calidad:**  
6. Auditorías de cumplimiento de estándares de codificación  
7. Verificación de implementación de medidas de seguridad  
8. Evaluación de adherencia a principios de arquitectura  
9. **Pruebas continuas:**  
10. Integración de pruebas unitarias en el proceso de desarrollo  
11. Implementación de integración continua (CI)  
12. Pruebas de regresión automatizadas

Control de Calidad

1. **Inspecciones de código:**  
2. Análisis estático de código con herramientas automatizadas  
3. Revisión manual de componentes críticos  
4. **Pruebas específicas:**  
5. Pruebas de seguridad (penetración, análisis de vulnerabilidades)  
6. Pruebas de rendimiento y carga  
7. Pruebas de usabilidad con usuarios reales  
8. **Gestión de defectos:**  
9. Registro y clasificación de defectos  
10. Análisis de causa raíz  
11. Verificación de correcciones

### 

### 

### **Herramientas y Técnicas de Calidad** {#herramientas-y-técnicas-de-calidad}

Herramientas de Calidad

1. **Herramientas de desarrollo:**  
2. ESLint/Prettier para formateo y análisis de código JavaScript  
3. Pylint/Black para formateo y análisis de código Python  
4. SonarQube para análisis continuo de calidad de código  
5. **Herramientas de pruebas:**  
6. Jest para pruebas unitarias de frontend  
7. Pytest para pruebas unitarias de backend  
8. Cypress para pruebas end-to-end  
9. JMeter para pruebas de carga y rendimiento  
10. **Herramientas de integración continua:**  
11. GitHub Actions para automatización de CI/CD  
12. Docker para entornos de desarrollo consistentes

Técnicas de Calidad

1. **Técnicas de prevención:**  
2. Programación en parejas para componentes críticos  
3. Desarrollo guiado por pruebas (TDD)  
4. Modelado de amenazas para seguridad  
5. **Técnicas de inspección:**  
6. Revisiones de código estructuradas  
7. Análisis de cobertura de código  
8. Pruebas exploratorias  
9. **Técnicas de análisis:**  
10. Análisis de causa raíz  
11. Diagramas de Pareto para priorización de defectos  
12. Análisis de tendencias de calidad

### **Métricas de Calidad** {#métricas-de-calidad}

Se utilizarán las siguientes métricas para evaluar la calidad del proyecto:

**Métricas de Producto**

| Métrica | Descripción | Objetivo | Método de Medición |
| :---- | :---- | :---- | :---- |
| Defectos por módulo | Número de defectos identificados por módulo | \<5 defectos críticos por módulo | Sistema de seguimiento de issues |
| Cobertura de código | Porcentaje de código cubierto por pruebas automatizadas | \>80% | Herramientas de análisis de cobertura |
| Tiempo de respuesta | Tiempo promedio de respuesta de la aplicación | \<2 segundos para el 95% de operaciones | Pruebas de rendimiento |
| Usabilidad | Satisfacción del usuario y facilidad de uso | \>4/5 en evaluaciones de usuarios | Encuestas y pruebas de usabilidad |
| Deuda técnica | Tiempo estimado para resolver problemas técnicos | \<10% del esfuerzo total | SonarQube |

**Métricas de Proceso**

| Métrica | Descripción | Objetivo | Método de Medición |
| :---- | :---- | :---- | :---- |
| Velocidad de corrección | Tiempo promedio para corregir defectos | \<2 días para defectos críticos | Sistema de seguimiento de issues |
| Eficiencia de pruebas | Defectos encontrados por hora de prueba | \>2 defectos/ hora | Registro de actividades de prueba |
| Tasa de aprobación de código | Porcentaje de código aprobado en primera revisión | \>80% | Sistema de control de versiones |
| Densidad de defectos | Número de defectos por 1000 líneas de código | \<5 | Análisis de código y registro de defectos |
| Cumplimiento de estándares | Porcentaje de cumplimiento con estándares definidos | \>95% | Auditorías de calidad |

### 

### **Enfoque de Pruebas** {#enfoque-de-pruebas}

El enfoque de pruebas se basa en una estrategia de múltiples niveles:

Niveles de Prueba

1. **Pruebas Unitarias:**  
2. Objetivo: Verificar el funcionamiento correcto de componentes individuales  
3. Responsable: Desarrolladores  
4. Automatización: 100%  
5. Frecuencia: Con cada commit  
6. **Pruebas de Integración:**  
7. Objetivo: Verificar la interacción correcta entre componentes  
8. Responsable: Desarrolladores  
9. Automatización: \>80%  
10. Frecuencia: Diaria (integración continua)  
11. **Pruebas de Sistema:**  
12. Objetivo: Verificar el comportamiento del sistema completo  
13. Responsable: Equipo completo  
14. Automatización: \>60%  
15. Frecuencia: Al final de cada sprint  
16. **Pruebas de Aceptación:**  
17. Objetivo: Validar que el sistema cumple con los requisitos del usuario  
18. Responsable: Equipo completo y usuarios de prueba  
19. Automatización: \<40%  
20. Frecuencia: Al final de cada sprint

Tipos de Prueba

1. **Pruebas Funcionales:**  
2. Verificación de requisitos funcionales  
3. Pruebas de casos de uso completos  
4. Pruebas de flujos de negocio  
5. **Pruebas No Funcionales:**   
6. Pruebas de rendimiento y carga  
7. Pruebas de seguridad  
8. Pruebas de usabilidad  
9. Pruebas de accesibilidad  
10. Pruebas de compatibilidad  
11. **Pruebas Estructurales:**  
12. Pruebas de cobertura de código  
13. Pruebas de integración de componentes  
14. Pruebas de base de datos  
15. **Pruebas de Cambios:**  
16. Pruebas de regresión  
17. Pruebas de sanidad  
18. Pruebas de humo

### **Criterios de Aceptación de Calidad** {#criterios-de-aceptación-de-calidad}

Se establecen los siguientes criterios de aceptación para los entregables principales:

**Módulo de Usuarios**

1. **Criterios Funcionales:**  
2. Registro exitoso de usuarios con validación de correo  
3. Autenticación segura con manejo adecuado de sesiones  
4. Gestión completa de perfiles de usuario  
5. **Criterios No Funcionales:**  
6. Tiempo de registro inferior a 3 minutos  
7. Almacenamiento seguro de contraseñas (hash \+ salt)  
8. Validación en tiempo real de campos de formulario

**Módulo de Publicación y Búsqueda**

1. **Criterios Funcionales:**  
2. Creación de publicaciones con todos los campos requeridos  
3. Búsqueda con múltiples criterios de filtrado  
4. Visualización correcta de resultados con paginación  
5. **Criterios No Funcionales:**  
6. Tiempo de respuesta de búsqueda \<1.5 segundos  
7. Carga de imágenes optimizada (\<2MB por imagen)  
8. Resultados de búsqueda relevantes según criterios

**Módulo de Reservas y Alquileres**

1. **Criterios Funcionales:**  
2. Creación de publicaciones con todos los campos requeridos  
3. Búsqueda con múltiples criterios de filtrado  
4. Visualización correcta de resultados con paginación  
5. **Criterios No Funcionales:**  
6. Tiempo de respuesta de búsqueda \<1.5 segundos  
7. Carga de imágenes optimizada (\<2MB por imagen)  
8. Resultados de búsqueda relevantes según criterios

**Módulo de Reservas y Alquileres**

1. **Criterios Funcionales:**  
2. Proceso completo de solicitud y confirmación de reservas  
3. Gestión de calendario de disponibilidad sin conflictos  
4. Manejo correcto de cancelaciones según políticas  
5. **Criterios No Funcionales:**  
6. Bloqueo efectivo de fechas reservadas  
7. Notificaciones en tiempo real de cambios de estado  
8. Cálculo preciso de costos totales

**Módulo de Pagos**

1. **Criterios Funcionales:**  
2. Procesamiento exitoso de pagos con tarjetas  
3. Gestión de depósitos de garantía  
4. Liberación correcta de pagos tras confirmación  
5. **Criterios No Funcionales:**  
6. Cumplimiento de estándares de seguridad PCI DSS  
7. Tiempo de procesamiento de pago \<5 segundos  
8. Generación de comprobantes de pago válidos

### **Proceso de Mejora Continua** {#proceso-de-mejora-continua}

Se implementará un proceso de mejora continua basado en el ciclo PDCA (Planificar-Hacer-Verificar-Actuar):

1. **Planificar:**  
2. Identificar áreas de mejora basadas en métricas y retroalimentación  
3. Establecer objetivos específicos de mejora  
4. Desarrollar planes de acción  
5. **Hacer:**  
6. Implementar cambios en procesos o productos  
7. Capacitar al equipo en nuevas prácticas  
8. Documentar las acciones realizadas  
9. **Verificar:**  
10. Medir el impacto de los cambios implementados  
11. Comparar resultados con objetivos establecidos  
12. Identificar lecciones aprendidas  
13. **Actuar:**  
14. Estandarizar mejoras exitosas  
15. Ajustar enfoques según sea necesario  
16. Iniciar nuevo ciclo de mejora

### **Gestión de No Conformidades** {#gestión-de-no-conformidades}

Se establecerá un proceso para gestionar no conformidades (desviaciones de los estándares de calidad):

1. **Identificación:**  
2. Detección durante revisiones, pruebas o auditorías  
3. Registro en sistema de seguimiento  
4. **Evaluación:**  
5. Clasificación por severidad e impacto  
6. Análisis de causa raíz  
7. **Resolución:**  
8. Implementación de acciones correctivas  
9. Verificación de efectividad  
10. **Prevención:**  
11. Implementación de acciones preventivas  
12. Actualización de estándares y procesos

### **Revisiones de Calidad Planificadas** {#revisiones-de-calidad-planificadas}

Se programan las siguientes revisiones formales de calidad:

| Revisión | Frecuencia | Participantes | Objetivos |
| :---- | :---- | :---- | :---- |
| Revisión de Arquitectura | Inicio del proyecto | Equipo completo, Tutores | Validar diseño arquitectónico |
| Revisión de Sprint | Cada 2 semanas | Equipo completo | Evaluar calidad de entregables del sprint |
| Auditoría de Código | Mensual | Equipo técnico | Verificar cumplimiento de estándares |
| Revisión de Seguridad | Antes de cada release | Equipo técnico | Identificar vulnerabilidades |
| Revisión de Usabilidad | Cada 2 sprints | Equipo completo, Usuarios de prueba | Evaluar experiencia de usuario |

### 

### **Documentación de Calidad** {#documentación-de-calidad}

Se mantendrán los siguientes documentos relacionados con la calidad:

1. Plan de Gestión de Calidad (a desarrollar en etapas posteriores)  
2. Estándares de Codificación y Desarrollo  
3. Plan de Pruebas  
4. Informes de Revisiones y Auditorías  
5. Registro de No Conformidades  
6. Métricas de Calidad y Tendencias

### **Integración con Otros Planes** {#integración-con-otros-planes}

El enfoque de calidad se integra con otros planes de gestión de la siguiente manera:

1. **Plan de Gestión del Tiempo:**  
2. Inclusión de actividades de calidad en el cronograma  
3. Asignación de tiempo adecuado para pruebas y revisiones  
4. Consideración de impacto de retrabajos en estimaciones  
5. **Plan de Gestión de Riesgos:**  
6. Identificación de riesgos relacionados con la calidad  
7. Estrategias de mitigación para riesgos de calidad  
8. Uso de métricas de calidad como indicadores tempranos  
9. **Plan de Gestión de Costos:**  
10. Presupuesto para actividades de aseguramiento de calidad  
11. Análisis de costo-beneficio de inversiones en calidad  
12. Consideración del impacto financiero de problemas de calidad

### **Consideraciones para Implementación Futura** {#consideraciones-para-implementación-futura}

Para el desarrollo completo del Plan de Gestión de Calidad en etapas posteriores, se recomienda:

1. **Refinamiento de métricas:**  
2. Establecer líneas base para todas las métricas  
3. Definir umbrales de alerta y acción  
4. Implementar dashboard de calidad  
5. **Automatización**:  
6. Configurar pipeline de CI/CD completo  
7. Implementar análisis de código automatizado  
8. Desarrollar suite de pruebas automatizadas  
9. **Capacitación**:  
10. Formación en técnicas avanzadas de pruebas  
11. Entrenamiento en seguridad aplicativa  
12. Workshops de mejores prácticas de desarrollo  
13. **Procesos formales:**  
14. Definición detallada de Definition of Done  
15. Establecimiento de ceremonias de calidad  
16. Implementación de revisiones por pares estructuradas

4. # **BIBLIOGRAFÍA** {#bibliografía}

Botsman, R., & Rogers, R. (2010). What’s mine is yours: The rise of collaborative consumption. Harper Business.

Hamari, J., Sjöklint, M., & Ukkonen, A. (2016). The sharing economy: Why people participate in collaborative consumption. Journal of the Association for Information Science and Technology, 67(9), 2047–2059. https://doi.org/10.1002/asi.23552

OWASP Foundation. (2021). OWASP Top Ten Web Application Security Risks – 2021\. OWASP. https://owasp.org/Top10

Resnick, P., Zeckhauser, R., Friedman, E., & Kuwabara, K. (2000). Reputation systems. Communications of the ACM, 43(12), 45–48. https://doi.org/10.1145/355112.355122

World Wide Web Consortium (W3C). (2018). Web Content Accessibility Guidelines (WCAG) 2.1. https://www.w3.org/TR/WCAG21/

Fretish. (2025). Fretish – Rent Musical Instruments. https://fretish.com

5. # **APÉNDICES** {#apéndices}

### **Identificación de Riesgos** {#identificación-de-riesgos-1}

A continuación, se presenta el registro de riesgos identificados para el proyecto:

| ID | Descripción del riesgo | Categoría | Causa Raíz | Disparadores | Entregables Afectados |
| :---- | :---- | :---- | :---- | :---- | :---- |
| R01 | Cambios significativos en los requisitos durante el desarrollo | Gestión | Comprensión incompleta de necesidades de usuarios | Feedback de usuarios que contradice requisitos iniciales | Todos los módulos |
| R02 | Dificultades en la integración con pasarelas de pago | Técnico | Complejidad de APIs de terceros | Errores persistentes en pruebas de integración | Módulo de Pagos |
| R03 | Rendimiento insuficiente de la plataforma con alto volumen de datos | Técnico | Diseño de base de datos ineficiente | Tiempos de respuesta superiores a 3 segundos | Módulos de Búsqueda y Reservas |
| R04 | Problemas de seguridad en la gestión de datos sensibles | Técnico | Implementación inadecuada de protocolos de seguridad | Detección de vulnerabilidades en pruebas | Módulos de Usuarios y Pagos |
| R05 | Retrasos en el desarrollo por complejidad técnica subestimada | Gestión | Estimaciones optimistas | Velocidad de sprint inferior a lo planificado | Cronograma completo |
| R06 | Indisponibilidad temporal de algún miembro del equipo | Gestión | Factores personales o académicos | Ausencia en reuniones programadas | Cronograma completo |
| R07 | Problemas de usabilidad que afecten la experiencia de usuario | Técnico | Diseño de interfaz no centrado en usuario | Feedback negativo en pruebas de usabilidad | Todos los módulos |
| R08 | Incompatibilidad con navegadores o dispositivos específicos | Técnico | Falta de pruebas en múltiples plataformas | Errores reportados en navegadores específicos | Frontend completo |
| R09 | Dificultades en el despliegue en la nube | Técnico | Configuración incorrecta de servicios cloud | Errores persistentes en entorno de producción | Despliegue final |
| R10 | Costos de infraestructura superiores a lo estimado | Comercial | Estimación inadecuada de recursos necesarios | Alertas de consumo de recursos cloud | Presupuesto del proyecto |
| R11 | Cambios en normativas legales que afecten al modelo de negocio | Externo | Nuevas regulaciones gubernamentales | Anuncios de cambios legislativos | Modelo de negocio |
| R12 | Aparición de competidores directos durante el desarrollo | Comercial | Atractivo del mercado | Lanzamiento de plataformas similares | Diferenciación del producto |
| R13 | Resistencia de usuarios potenciales a adoptar la plataforma | Comercial | Hábitos arraigados de alquiler informal | Baja tasa de registro en pruebas beta | Adopción del producto |
| R14 | Problemas con servicios de terceros (almacenamiento, notificaciones) | Externo | Dependencia de proveedores externos | Interrupciones de servicio reportadas | Funcionalidades dependientes |
| R15 | Dificultades para implementar el sistema de calificaciones y reputación | Técnico | Complejidad del algoritmo de reputación | Inconsistencias en cálculos de reputación | Módulo de Usuarios |

### **Plan de Respuesta a los Riesgos** {#plan-de-respuesta-a-los-riesgos-1}

A continuación, se presenta el plan de respuesta para los riesgos de alta prioridad:

| ID | Estrategia | Acciones de Respuesta | Responsable | Costo | Disparador para Implementación |
| :---- | :---- | :---- | :---- | :---- | :---- |
| R01 | Mitigar | 1\. Implementar proceso de validación continua de requisitos con usuarios 2\. Utilizar prototipos y MVP para validación temprana 3\. Establecer proceso formal de gestión de cambios | Equipo completo | $300 | Inicio del proyecto |
| R02 | Transferir | 1\. Utilizar solución de pago preintegrada con soporte técnico 2\. Establecer acuerdo de nivel de servicio con el proveedor 3\. Desarrollar modo offline para operaciones críticas | Leandro | $500 | Antes del Sprint 5 |
| R03 | Mitigar | 1\. Implementar pruebas de carga desde etapas tempranas 2\. Diseñar arquitectura escalable con cachés 3\. Optimizar consultas a la base de datos | Leandro | $200 | Durante Sprint 1 |
| R04 | Evitar | 1\. Implementar auditoría de seguridad por expertos externos 2\. Seguir estándares OWASP para desarrollo seguro 3\. Utilizar servicios certificados para datos sensibles | Leandro | $600 | Antes del Sprint 2 |
| R05 | Mitigar | 1\. Incluir buffer de contingencia en estimaciones 2\. Realizar revisiones técnicas al inicio de cada sprint 3\. Priorizar funcionalidades críticas en sprints tempranos | Equipo completo | $0 | Inicio del proyecto |
| R07 | Mitigar | 1\. Realizar pruebas de usabilidad con usuarios reales 2\. Implementar diseño basado en componentes reutilizables 3\. Seguir guías de diseño establecidas | Federico | $300 | Durante Sprint 2 |
| R09 | Mitigar | 1\. Crear entorno de staging similar a producción 2\. Automatizar proceso de despliegue 3\. Documentar configuración de infraestructura como código | Leandro | $200 | Leandro |
| R13 | Mitigar | 1\. Desarrollar estrategia de onboarding simplificada 2\. Implementar programa de incentivos para primeros usuarios 3\. Realizar campañas de educación sobre beneficios | Federico | $400 | Antes de pruebas beta |

6. # **Anexos** {#anexos}

   ## **Aspectos Éticos y Sociales de ReSolVelo** {#aspectos-éticos-y-sociales-de-resolvelo}

### 1\. **Introducción** {#1.-introducción}

La plataforma para alquiler de equipos musicales fue concebida considerando no sólo su viabilidad técnica y económica, sino también su impacto social y ético. En ese sentido, se contemplaron varios aspectos clave:

* Privacidad y protección de datos personales: se implementarán mecanismos de cifrado, control de acceso y uso de proveedores confiables para garantizar que los datos sensibles de los usuarios (identidad, medios de pago, ubicación) sean gestionados de forma segura y responsable.  
* Acceso equitativo y reducción de brechas: la solución busca democratizar el acceso a instrumentos y recursos musicales, promoviendo la economía colaborativa. Además, al ser multiplataforma (web y móvil), mejora el alcance a diferentes perfiles socioeconómicos y zonas geográficas.  
* Confianza y reputación digital: se integran funcionalidades como calificaciones, verificación de identidad y mensajería interna para fomentar relaciones de confianza, evitando posibles abusos o fraudes entre los usuarios.  
* Sostenibilidad y reutilización: el modelo promueve el uso compartido de bienes, alineándose con principios de consumo responsable y economía circular.  
* Inclusión y diversidad: se trabajará en un diseño accesible e intuitivo, con principios de usabilidad para todos los públicos. Se proyecta incluir criterios de accesibilidad para personas con discapacidad.

Esta perspectiva ética y social fue considerada de forma transversal durante el desarrollo del proyecto, buscando que la tecnología esté al servicio de las personas, potenciando la comunidad musical uruguaya de forma responsable, inclusiva y segura.

### **2\. Análisis de Implicaciones Éticas y Medidas Adoptadas** {#2.-análisis-de-implicaciones-éticas-y-medidas-adoptadas}

A continuación, se detallan los principales aspectos éticos considerados y las soluciones implementadas.

#### **2.1. Privacidad y Protección de Datos Personales** {#2.1.-privacidad-y-protección-de-datos-personales}

La gestión de datos es el pilar de la confianza en ReSolVelo. El proyecto maneja datos personales (nombre, contacto), datos de reputación (calificaciones) y datos transaccionales (pagos).

* **Cumplimiento Normativo:** La plataforma se desarrollará en cumplimiento de la Ley Nº 18.331 de Protección de Datos Personales de Uruguay. Se procederá al registro de la base de datos ante la Unidad Reguladora y de Control de Datos Personales (URCDP) y se seguirán los principios de legalidad, finalidad y reserva.  
    
* **Medidas de Seguridad:** Se implementarán medidas técnicas para proteger la información, incluyendo el cifrado de datos en tránsito (SSL/TLS) y en reposo, el uso de algoritmos de hash seguros (bcrypt) para contraseñas y el cumplimiento del estándar PCI DSS para el manejo de información de tarjetas de crédito.  
    
* **Transferencia Internacional de Datos:** Somos conscientes de que el uso de servicios en la nube (AWS) y pasarelas de pago (MercadoPago) implica la transferencia internacional de datos. Para cumplir con la normativa, se solicitará el consentimiento explícito e informado del usuario en nuestra Política de Privacidad, detallando que sus datos pueden ser alojados en servidores ubicados fuera de Uruguay.

#### **2.2. Confianza, Seguridad y Verificación de Identidad** {#2.2.-confianza,-seguridad-y-verificación-de-identidad}

Para mitigar los riesgos inherentes a una plataforma de economía colaborativa (daños, fraudes, abusos), hemos diseñado un sistema de confianza multifacético.

* **Validación de identidad mediante gub.uy**:  
   Para la verificación de identidad de los usuarios utilizaremos el servicio de validación digital proporcionado por gub.uy, que contrasta la información del documento de identidad con los registros oficiales del Estado uruguayo.

* **Mitigación de riesgos y equidad**:  
   Al tratarse de un servicio estatal, se reducen los riesgos de sesgos algorítmicos asociados a soluciones privadas de IA.

* **Minimización de Datos Biométricos:** Entendemos que los datos faciales son sensibles. Por ello, hemos decidido no realizar verificación de usuarios mediante amazon rekognition. Si bien, este proceso ayuda a brindar confianza para los propietarios de equipamientos, va en detrimento de cuestiones éticas que para nosotros son primordiales en esta fase del proyecto.


#### **2.3. Acceso Equitativo, Inclusión y Sostenibilidad** {#2.3.-acceso-equitativo,-inclusión-y-sostenibilidad}

ReSolVelo fue pensado con un impacto social positivo como objetivo central.

* **Democratización del Acceso:** La plataforma busca eliminar barreras económicas y geográficas, permitiendo que más artistas accedan a equipos de calidad para desarrollar su trabajo.  
* **Sostenibilidad:** Al promover el uso compartido de bienes existentes, ReSolVelo se alinea con los principios de la economía circular, fomentando un consumo más responsable y sostenible.  
* **Accesibilidad:** Nos comprometemos a seguir las pautas de accesibilidad web (como WCAG 2.1) para asegurar que ReSolVelo pueda ser utilizada por el mayor número de personas posible, incluyendo aquellas con discapacidades.

### **3\. Aspectos Detectados** {#3.-aspectos-detectados}

Si bien hemos establecido un marco ético, somos conscientes de que existen áreas que requieren acciones una vez ReSolVelo esté en producción.

* **Definición de Plazos de Conservación de Datos:** Necesitamos definir políticas claras sobre por cuánto tiempo se conservarán los datos de los usuarios una vez que una cuenta quede inactiva o sea eliminada. Esto incluye datos de perfil, historial de alquileres y mensajes.  
* **Gestión de Disputas:** Aunque contamos con un sistema de calificaciones y garantías, es necesario diseñar un protocolo detallado y justo para la mediación y resolución de conflictos entre usuarios (ej. daño de un equipo).  
* **Registro de la base de datos:** Una vez ReSolVelo esté en producción contamos con 90 días para registrar la BD en la biblioteca nacional..

Este enfoque reflexivo sobre la ética es un pilar para el éxito y la aceptación de ReSolVelo en la comunidad musical uruguaya.

## **Política de Privacidad** {#política-de-privacidad}

### **Objetivo** {#objetivo}

En este documento  se presentan las cláusulas clave para la Política de Privacidad de ReSolVelo, enfocadas en el consentimiento para el uso y la transferencia internacional de datos.

### **Alojamiento y Transferencia Internacional de Datos** {#alojamiento-y-transferencia-internacional-de-datos}

ReSolVelo es un servicio digital con infraestructura global para garantizar su rendimiento y disponibilidad.

* **Consentimiento para la Transferencia Internacional:** Para operar nuestra plataforma, utilizamos los servicios de infraestructura en la nube de proveedores líderes como Amazon Web Services (AWS). Esto significa que la información que nos proporcionas, incluidos tus datos personales, puede ser almacenada y procesada en servidores ubicados fuera de tu país de residencia (incluyendo, pero no limitándose a, Estados Unidos, Brasil y países de la Unión Europea), donde las leyes de protección de datos pueden ser diferentes.  
    
* **Finalidad de la Transferencia:** Esta transferencia es necesaria para poder prestarte el servicio de ReSolVelo de manera eficiente y segura.  
    
* **Aceptación:** Al crear una cuenta y utilizar nuestros servicios, aceptas y consientes explícitamente esta transferencia, almacenamiento y procesamiento de tus datos en el extranjero. Nos comprometemos a que nuestros proveedores de servicios cumplan con altos estándares de seguridad y protección de datos.  
* **Principio de finalidad:** Los datos serán tratados únicamente para los fines específicos que garantizan el correcto funcionamiento de la plataforma. 

  ## **Diagrama de contexto** {#diagrama-de-contexto}

  ## **Diagrama conceptual** {#diagrama-conceptual}

  ## **Diagrama de arquitectura** {#diagrama-de-arquitectura}

**Explicación de la Arquitectura Simplificada**

Este diagrama agrupa los componentes de la siguiente manera, reflejando directamente la arquitectura de despliegue:

**AWS Amplify (Capa de Presentación):** Este bloque representa tanto el servicio de hosting de AWS como el componente Frontend (Vue.js) que se ejecuta dentro de él. Es la puerta de entrada para el usuario y se encarga de toda la interfaz visual y la interacción. Su única responsabilidad de comunicación es consumir la API del backend.  
**AWS App Runner (Capa de Aplicación):** De manera similar, este bloque representa el servicio de ejecución de contenedores y el componente Backend (NestJS) dockerizado que corre en su interior. Es el núcleo central que ejecuta toda la lógica de negocio y orquesta la comunicación con la base de datos y los servicios de terceros.  
**Capa de Datos (AWS RDS y S3):** Esta capa permanece separada ya que son servicios de persistencia a los que el backend accede, pero no están "dentro" de él. AWS RDS aloja la base de datos PostgreSQL y AWS S3 almacena los archivos multimedia como fotos.  
**Servicios Externos:** Estos servicios (Mercado Pago, gub.uy, Firebase/SES.) se mantienen como entidades externas, ya que la plataforma los consume a través de sus APIs, pero no forman parte de su infraestructura propia.

[image1]: <data:image/png;base64,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>