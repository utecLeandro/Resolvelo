# Scripts de Despliegue, Migración y Datos Semilla

## Comandos Clave (Local)
- Construir backend: `npm run build`.
- Aplicar migraciones: `npx prisma migrate deploy --schema context/schema.prisma`.
- Poblar datos de prueba: `npx prisma db seed` (`prisma/seed.ts`).
- Iniciar backend: `npm run start:dev`.
- Verificar salud: `curl http://localhost:3000/api/health`.

## Docker
- La imagen de backend incluye `entrypoint.sh` que puede correr migraciones si `PRISMA_MIGRATE_DEPLOY=1` (`entrypoint.sh:12-22`).
- Health en contenedor: App Runner consulta `/api/health`.

## Publicación a ECR (us-east-1)
- Workflow `Backend - ECR Push (develop)`: `.github/workflows/backend-ecr-push.yml`.
- Tags generados: `sha` corto; usar el más reciente para App Runner.

## Despliegue a App Runner
- Ejecutar manualmente el workflow `.github/workflows/backend-app-runner.yml`.
- Variables y secretos necesarios: `AWS_REGION`, `ECR_REPOSITORY`, `AWS_DEPLOY_ROLE_ARN`, `DB_SECRET_ARN`, `JWT_SECRET_ARN`, y opcionales de VPC.
- Health path: `/api/health`.

## Seeds de Datos
- Usuarios de prueba: `juan@test.com`, `maria@test.com`, `lolo@test.com`, `gtbump2012@gmail.com` con contraseñas definidas en `prisma/seed.ts:20-28` y `prisma/seed.ts:213-219`.
- Publicaciones y reservas se crean automáticamente al correr el seed.