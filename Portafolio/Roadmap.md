# Roadmap de Evolución del Producto

## Fase MVP
- Registro y login con verificación simulada.
- Catálogo y detalle de publicaciones con imágenes.
- Reservas con estados básicos y notificaciones.
- Panel de administración inicial.
- Despliegue en AWS: App Runner (backend), Amplify (frontend), RDS (PostgreSQL), S3 (uploads).

## Fase Beta
- Pasarela de pago real (MercadoPago) reemplazando la simulación.
- Moderación avanzada de publicaciones y reputación.
- Búsqueda y filtros avanzados, ordenamientos por relevancia.
- Mejoras UI siguiendo guía Airbnb y accesibilidad.

## Versión 1.0
- Verificación de identidad con proveedor externo real.
- Sistema de calificaciones y comentarios.
- Notificaciones por email/SNS y panel de reportes.
- Hardening de seguridad y monitoreo ampliado (CloudWatch, alarmas).

## Referencias de Contexto
- Basado en `context/UTEC-LTI-ReSolVelo.md` (épicas y objetivos) y en el stack acordado.