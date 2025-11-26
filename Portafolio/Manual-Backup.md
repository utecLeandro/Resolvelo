# Manual de Backup

## RDS (PostgreSQL)
- Backups automáticos: habilitar período de retención (ej. 7 días) y ventana de mantenimiento.
- Snapshots manuales: crear antes de despliegues mayores.
- Restauración:
  - Crear instancia desde snapshot y actualizar `DATABASE_URL`.
  - Validar conectividad vía App Runner y correr migraciones si fuese necesario.
- Monitoreo: configurar alarmas en CloudWatch (`CPUUtilization`, `DatabaseConnections`, `FreeStorageSpace`).

## S3 (uploads)
- Versionado habilitado para el bucket de uploads.
- Reglas de ciclo de vida: mover a `GLACIER` después de X días si aplica.
- Restauración: recuperar versiones específicas o objetos desde GLACIER.

## Amplify y App Runner
- Amplify: reconstruir artefactos desde el repo; stateless.
- App Runner: servicio stateless; re-desplegar imagen desde ECR si fuera necesario.

## Procedimiento de Backup Periódico
- RDS: snapshots automáticos diarios y uno manual semanal.
- Exportar esquema: `pg_dump -s` para respaldar estructura ante cambios.
- S3: verificar estado de versionado y reglas de retención.