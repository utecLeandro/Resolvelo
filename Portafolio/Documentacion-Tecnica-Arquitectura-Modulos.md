# Documentación Técnica de Arquitectura y Módulos

## Visión General
- Arquitectura limpia basada en **NestJS** (backend) y **Vue 3 + Composition API** (frontend) con **TypeScript**.
- ORM: **Prisma** contra **PostgreSQL** (RDS en producción).
- API REST con prefijo global `api` (`src/main.ts:76-77`).
- Seguridad y configuración: CORS configurable, validación con `ValidationPipe`, y secretos vía AWS Secrets Manager.

## Backend (NestJS)
- Punto de entrada: `src/main.ts` con CORS, prefijo `api` y endpoints de diagnóstico (`src/main.ts:79-142`).
- Salud del servicio: `src/health/health.controller.ts:11-14`.
- Acceso a BD: `src/prisma/prisma.service.ts:12-23` tolera fallo de conexión para que la API arranque y permita diagnósticos.
- Módulo Global Prisma: `src/prisma/prisma.module.ts:1-14`.
- Módulos principales:
  - `auth`: login/registro y verificación simulada (`src/auth/auth.service.ts:1-19`, manejo de errores y hashing con bcrypt).
  - `usuarios`: perfil y actualización (`src/usuarios/usuarios.service.ts:20-38`, `src/usuarios/usuarios.service.ts:40-76`).
  - `publicaciones`: CRUD y búsquedas avanzadas (`src/publicaciones/publicaciones.service.ts:1-24`, `src/publicaciones/publicaciones.module.ts:1-17`).
  - `reservas`: estados y flujos (`src/reservas/reservas.service.ts:1-24`).
  - `transacciones`: pagos simulados y preferencias de MercadoPago (`src/transacciones/transacciones.service.ts:1-48`, `src/transacciones/transacciones.service.ts:290-306`).
  - `admin`: gestión de usuarios y acciones administrativas (`src/admin/admin.service.ts:1-69`, `src/admin/admin.service.ts:126-183`).

## Frontend (Vue 3)
- Enrutador principal: `frontend/src/router/index.ts:1-27` define vistas y rutas públicas/administrativas.
- Estado: Vuex para gestión global.
- Estilos: Tailwind CSS siguiendo guía de estilo Airbnb.
- API base: `VITE_API_BASE_URL` apuntando a `/api` en desarrollo y a dominio de App Runner en producción.

## Integraciones y Servicios
- Pasarela de pago: simulada; responde `OK` en esta fase.
- Verificación de cuenta: servicio interno que retorna `OK` mientras se integra el proveedor externo.
- Subida de imágenes: S3 con URLs prefirmadas.

## Principios y Buenas Prácticas
- SOLID aplicado a servicios y módulos.
- Validación robusta con DTOs.
- Separación estricta de capas (controladores, servicios, acceso a datos).
- OWASP Top 10 considerado en autenticación, validación y gestión de secretos.