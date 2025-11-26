# Manual de Usuario Final

Este manual describe, paso a paso, cómo usar la plataforma ReSolVelo para alquilar y gestionar instrumentos y equipos musicales. Está orientado a usuarios finales y administradores.

## Acceso y Registro
- Ir al frontend alojado en `AWS Amplify`.
- Crear cuenta con correo y contraseña seguras.
- Confirmación de cuenta: por ahora se verifica con un servicio interno que devuelve `OK` (implementación simulada).
- Iniciar sesión con el correo y contraseña registrados.

## Navegación Principal
- Catálogo: explorar instrumentos por categoría, marca y filtros.
- Detalle de publicación: ver fotos, descripción, ubicación y precios.
- Búsqueda: usar barra de búsqueda y filtros por disponibilidad y precio.

## Crear y Gestionar Publicaciones
- Desde “Mis Publicaciones” crear una nueva publicación:
  - Completar título, descripción, categoría, marca, modelo, precios y ubicación.
  - Subir imágenes: se gestionan desde el backend mediante URLs prefirmadas de `S3`.
- Editar publicaciones existentes: actualizar precios, fotos y disponibilidad.
- Estados de moderación: las publicaciones nuevas se marcan como “pendientes” y pueden pasar a “aprobadas” o “rechazadas” según revisión.

## Reservas
- Solicitar reserva desde una publicación: elegir fechas y método de entrega (retiro/envío acordado).
- Estados de reserva: `PENDIENTE`, `CONFIRMADA`, `EN_CURSO`, `CANCELADA`, `COMPLETADA`, `RECHAZADA`.
- Notificaciones: el sistema muestra mensajes y estados en las pantallas clave.

## Pagos
- Flujo de pago: por ahora la pasarela está simulada; ante una solicitud de pago, el sistema responde `OK` y marca la transacción como aprobada.
- En futuras versiones se integrará MercadoPago u otro proveedor (ver Roadmap).

## Perfil de Usuario
- Actualizar datos personales: nombre, apellido, teléfono, dirección y avatar.
- Estado de verificación: se muestra `VERIFICADA` cuando el servicio externo confirma el usuario; en esta fase se simula.

## Panel de Administración
- Acceso para administradores: gestión de usuarios, publicaciones y verificaciones.
- Acciones administrativas registradas para auditoría.

## Salud del Servicio
- Endpoint de salud del backend: `GET /api/health` devuelve `{status: "OK"}`.
- Referencia de código: `src/health/health.controller.ts:11-14`.

## Consejos de Seguridad (Usuario)
- Usar contraseñas robustas y únicas.
- Verificar siempre la URL oficial en Amplify (HTTPS).
- No compartir credenciales.

## Soporte
- Si notas errores de carga o mensaje “Base de datos no disponible”, intenta nuevamente o contacta soporte. El backend arranca aun sin BD para permitir diagnósticos (`src/prisma/prisma.service.ts:12-23`).