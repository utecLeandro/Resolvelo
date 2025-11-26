# Manual de Instalación y Configuración (Docker / AWS)

Este manual resume cómo levantar el entorno local con Docker y cómo desplegar en AWS (ECR, App Runner, RDS, Secrets Manager, Amplify y S3).

## Requisitos
- Docker y Docker Compose instalados.
- Node.js 18+ para desarrollo local.
- Cuenta AWS con permisos sobre ECR, App Runner, RDS, Secrets Manager y Amplify.

## Backend Local con Docker
- Variables de entorno principales:
  - `DATABASE_URL=postgresql://usuario:password@host:5432/base?schema=public`
  - `JWT_SECRET=<secreto>`
  - `CORS_ORIGIN=http://localhost:5174`
- Ejecución de migraciones y seeds:
  - `npx prisma migrate deploy --schema context/schema.prisma`
  - `npx prisma db seed`
- Arranque manual (sin Docker): `npm run start:dev` y verificar `http://localhost:3000/api/health`.

## Sugerencia de docker-compose (ejemplo)
> No se crea un archivo en el repo en esta fase; usa este ejemplo como base.

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: resolvelo
      POSTGRES_USER: resolvelo_user
      POSTGRES_PASSWORD: Utec2025!
    ports:
      - "5433:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    networks:
      - resolvelo_net

volumes:
  pg_data:

networks:
  resolvelo_net:
```

## Despliegue en AWS
- ECR (us-east-1): repositorio `resolvelo-backend`.
- App Runner:
  - Source: ECR privado; `Port: 3000`; health path `/api/health`.
  - VPC Connector: subnets privadas; SG con salida a RDS.
  - Runtime env: `NODE_ENV=production`, `PORT=3000`, `PRISMA_MIGRATE_DEPLOY=0`.
  - Secrets: `DATABASE_URL` y `JWT_SECRET` desde Secrets Manager.
- RDS (PostgreSQL): subnets privadas, sin acceso público, backups automáticos.
- Secrets Manager: guardar `DATABASE_URL` y `JWT_SECRET` y referenciarlos por ARN.
- Amplify (frontend): conectar repo, `preBuild: npm ci`, `build: npm run build`, SPA rewrites 200 a `/index.html`.
- S3 (uploads): bucket privado con políticas mínimas, uso de URLs prefirmadas.

## CI/CD (resumen)
- Publicación automática de imagen a ECR en `develop`: `.github/workflows/backend-ecr-push.yml`.
- Despliegue manual a App Runner: `.github/workflows/backend-app-runner.yml`.

## Health y Validación
- Probar `GET https://<app-runner-domain>/api/health` (debe responder `OK`).
- Referencias:
  - Prefijo API: `src/main.ts:76-77`.
  - Health: `src/health/health.controller.ts:11-14`.
  - Entrypoint y migraciones: `entrypoint.sh:12-22`.