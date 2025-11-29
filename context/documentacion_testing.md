# Documentación de Testing — ReSolVelo

Versión: 1.0
Fecha: 2025-11-23
Responsable: Equipo de QA y Desarrollo (NestJS + Prisma + Vue.js)

## Tabla de Contenidos
1. Metodología de testing
2. Tipos de pruebas implementadas
3. Reportes de testing
4. Herramientas utilizadas
5. Evidencias
6. Anexos

---

## 1. Metodología de testing

### 1.1 Enfoque metodológico
- Enfoque Agile con ciclos iterativos de Sprint y validación continua.
- Derivación de casos desde especificaciones BDD en Gherkin del documento de requisitos (`Resolvelo/context/requirements.md:12`).
- Estrategia TDD/BDD parcial: los casos E2E cubren criterios de aceptación clave (`Resolvelo/test/app.e2e-spec.ts:1`).
- Gestión de pruebas y trazabilidad en Linear: proyectos “QA Sprint 1” y “QA Sprint 2”.

### 1.2 Proceso de planificación y ejecución
- Planificación del alcance por Sprint: definición de historias, criterios de aceptación y riesgos.
- Diseño de casos: derivación desde Gherkin, identificación de datos y precondiciones.
- Preparación de entornos: `QA1` (integración estable) y `QA2` (validación final) con backend NestJS y frontend Vue.
- Ejecución:
  - Automatizadas con `jest` + `@nestjs/testing` + `supertest`.
  - Registro en Linear (estado, etiquetas, comentarios uniformes).
- Gestión de defectos: categorización por severidad y prioridad; ciclo de repro/validación y cierre.
- Cierre de Sprint: reporte de cobertura, calidad y decisiones de release.

### 1.3 Roles y responsabilidades
- QA Lead: define estrategia, criterios de calidad, plan de pruebas y seguimiento.
- QA Engineer: diseña casos, ejecuta pruebas, documenta evidencias y reportes.
- Desarrolladores: corrigen defectos, agregan/ajustan pruebas unitarias e integración.
- Product Owner: valida aceptación y prioriza historias/defectos.

— Página 1 —

## 2. Tipos de pruebas implementadas

### 2.1 Pruebas unitarias
- Framework: `Jest` con `ts-jest` (config por defecto desde `package.json`).
- Alcance actual: incipiente (se priorizaron E2E/integración en MVP).
- Cobertura alcanzada (ejecución 2025-11-23):
  - Statements: 29.2%
  - Branches: 5.93%
  - Functions: 16.21%
  - Lines: 28.24%
- Ejemplo de aislamiento/mocks: uso de `FakePrismaService` (`Resolvelo/test/gubuy.e2e-spec.ts:7`).
- Plan de mejora: cubrir `services`, `guards`, `validators` y utilidades con pruebas unitarias.

### 2.2 Pruebas de integración
- Estrategia: `@nestjs/testing` para levantar módulos y `supertest` para validar endpoints.
- Cobertura funcional clave:
  - Autenticación y registro (`Resolvelo/test/app.e2e-spec.ts:1`).
  - Mensajería vinculada a reservas con mocks controlados (`Resolvelo/test/mensajes.e2e-spec.ts:9`).
- Herramientas: `@nestjs/testing`, `supertest`, inyección de dependencias y dobles de prueba para Prisma.

### 2.3 Pruebas de sistema
- Verificación de requisitos del sistema end-to-end (flujo completo en entorno de integración).
- Ejemplo de salud del servicio: controlador de health (`Resolvelo/src/health/health.controller.ts:1`).
- Validación de rutas críticas: autenticación, publicaciones, reservas, mensajes.

### 2.4 Pruebas de aceptación
- Basadas en criterios de validación de historias y escenarios Gherkin (`Resolvelo/context/requirements.md:12`).
- Ejemplo: prueba E2E orientada a criterios de aceptación (ticket RES-5) (`Resolvelo/test/app.e2e-spec.ts:1`).
- Cierre de aceptación en Linear con comentarios uniformes por issue.

### 2.5 Pruebas de rendimiento
- Métricas evaluadas:
  - Latencia HTTP (`P50`, `P95`), throughput de peticiones, tasa de error (`HTTP 5xx/4xx`), consumo de CPU y memoria.
  - Tiempo total de ejecución de suite (observado: ~27.75s en última corrida de `jest`).
- Metodología: medición exploratoria con `supertest` y marcadores de tiempo; planificación de benchmarks en entorno `QA2`.
- Umbrales objetivo iniciales: `P95` < 300ms para endpoints críticos, tasa de error < 0.5% bajo carga moderada.

### 2.6 Pruebas de seguridad
- Lineamientos OWASP Top 10: validación de contraseñas, control de sesiones, sanitización.
- Artefactos relevantes:
  - Validador de contraseñas (`Resolvelo/src/auth/validators/password.validator.ts:13`).
  - Guard de autenticación JWT (`Resolvelo/src/auth/jwt-auth.guard.ts:1`).
  - Servicio de autenticación y verificación (`Resolvelo/src/auth/auth.service.ts:1`).
- Verificaciones: contraseñas comunes prohibidas, patrones repetitivos/teclado, uso de JWT y hashing seguro.

— Página 2 —

## 3. Reportes de testing

### 3.1 Matriz de trazabilidad requisitos–pruebas (resumen)
| Requisito (Gherkin) | Prueba asociada | Evidencia/Cobertura |
|---|---|---|
| Gestión de Usuarios y Perfiles (`requirements.md:12`) | `test/app.e2e-spec.ts:1` | E2E aceptación (RES-5) |
| Mensajes en Reservas | `test/mensajes.e2e-spec.ts:9` | Integración con `FakePrismaService` |
| Validación Gubuy | `test/gubuy-validate.e2e-spec.ts:1` | E2E auth/validación externa |
| Salud del sistema | `src/health/health.controller.ts:1` | Endpoint `GET /health` |

### 3.2 Resumen de ejecuciones
- Última ejecución automatizada: `npm test -- --coverage` (2025-11-23).
- Suites: 4 pasadas; Casos: 8 pasados; Fallidos: 0.
- Cobertura global: Statements 29.2% | Branches 5.93% | Functions 16.21% | Lines 28.24%.

### 3.3 Análisis de defectos encontrados
- Resultado de última corrida: sin fallos en suites automatizadas.
- Gestión de defectos: Linear con severidad (`Crítico`, `Mayor`, `Menor`) y prioridad (`Alta`, `Media`, `Baja`).
- Notas: el estado “Failed” se representa como etiqueta en Linear por limitaciones de estados.

### 3.4 Métricas de calidad
- Densidad de defectos: baja en última ejecución (0 fallos/8 casos).
- Eficiencia de pruebas: tiempo total ~27.75s; ejecución en `QA2` estable.
- Cobertura por área: foco en E2E/integración; unitarios en expansión.

— Página 3 —

## 4. Herramientas utilizadas

### 4.1 Automatización (backend)
- `Jest` + `ts-jest` + `@nestjs/testing` + `supertest`.
- Scripts útiles:
  - `npm test -- --coverage` para cobertura.
  - `npm run test:e2e` para suites E2E (`Resolvelo/package.json:6`).

### 4.2 Gestión de pruebas
- Linear: proyectos “QA Sprint 1” y “QA Sprint 2”, estados, etiquetas y comentarios uniformes.
- Uso de etiqueta `Failed` para marcar casos no aprobados.

### 4.3 Entornos de testing
- `QA1`: integración — estabilización de módulos y validaciones cruzadas.
- `QA2`: aceptación — verificación final y reporte consolidado.

— Página 4 —

## 5. Evidencias

### 5.1 Capturas de pantalla
- Incluir capturas de ejecuciones exitosas/fallidas de endpoints críticos y flujos.
- Ubicación sugerida: `Resolvelo/context/anexos/capturas/`.

### 5.2 Logs de pruebas
- Guardar salidas relevantes de `jest` y trazas de `supertest`.
- Ubicación sugerida: `Resolvelo/context/anexos/logs/`.

### 5.3 Reportes generados por herramientas
- Reporte de cobertura HTML: `Resolvelo/coverage/lcov-report/index.html`.
- Artefactos de cobertura: `Resolvelo/coverage/lcov.info`, `Resolvelo/coverage/coverage-final.json`.

— Página 5 —

## 6. Anexos

### Anexo A — Trazabilidad ampliada
- Lista detallada de escenarios Gherkin y casos asociados por módulo.

### Anexo B — Cobertura
- Exportar `lcov-report` a PDF para entregar en defensa final.

### Anexo C — Evidencias (capturas y logs)
- Capturas y logs organizados por Sprint (QA1/QA2) y por módulo.

---

## Cómo ejecutar las pruebas
- Backend (desde `Resolvelo/`):
  - `npm test -- --coverage`
  - `npm run test:e2e`
- Ver cobertura: abrir `Resolvelo/coverage/lcov-report/index.html` en el navegador.

## Observaciones finales
- El foco del MVP estuvo en pruebas E2E/integración para validar flujos clave.
- Se recomienda incrementar cobertura unitaria a ≥70% en servicios y validadores.
- Linear `QA2` mantiene comentarios uniformes de cierre: “testeo completado con éxito”.

— Página 6 —