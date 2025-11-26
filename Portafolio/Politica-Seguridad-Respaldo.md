# Política de Seguridad y Respaldo

## Principios Generales
- Cumplir OWASP Top 10: control de acceso, validación de datos, gestión de secretos y protección de datos.
- Aplicar SOLID y separación de responsabilidades.

## Controles Técnicos
- Autenticación JWT y sesiones seguras.
- Hash y salt de contraseñas con bcrypt (ver `src/auth/auth.service.ts:1-19`).
- Validación y sanitización de entradas con DTOs y `ValidationPipe` (`src/main.ts:41-49`).
- CORS configurado por entorno (`src/main.ts:51-74`).
- Gestión de secretos via AWS Secrets Manager: `DATABASE_URL`, `JWT_SECRET`.
- Health y diagnósticos seguros: endpoints `/api/health` y endpoints de debug restringidos a entornos controlados (`src/main.ts:79-142`).
- Logs mínimos y sin datos sensibles.

## Seguridad en AWS
- RDS en subnets privadas sin acceso público.
- App Runner con VPC Connector para salida privada hacia RDS.
- S3 con `Block Public Access` y políticas mínimas de acceso.
- Amplify sirviendo HTTPS; headers de seguridad (CSP, HSTS, X-Frame-Options).

## Respaldo
- RDS: backups automáticos y snapshots manuales.
- S3: versionado y reglas de ciclo de vida.
- Procedimientos de restauración probados en entornos de ensayo.

## Política Operativa
- No almacenar secretos en el repo.
- Revisión de permisos IAM y principio de menor privilegio.
- Auditoría de acciones administrativas (ver `src/admin/admin.service.ts:126-183`).