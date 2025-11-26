# Pipeline de CI/CD con GitHub Actions

## Objetivos
- Construir y publicar imágenes Docker del backend en ECR (`develop`).
- Desplegar manualmente a App Runner usando la imagen más reciente.

## Workflows
- `Backend - ECR Push (develop)`: `.github/workflows/backend-ecr-push.yml:4-15`.
  - OIDC hacia AWS, login ECR, build `linux/amd64`, push con tag `sha`.
- `Backend Deploy to App Runner`: `.github/workflows/backend-app-runner.yml:8-20`, `.github/workflows/backend-app-runner.yml:69-90`, `.github/workflows/backend-app-runner.yml:91-154`.
  - Valida configuración, construye y empuja imagen, actualiza/crea servicio App Runner.

## Secrets necesarios
- `AWS_REGION=us-east-1`.
- `ECR_REPOSITORY=resolvelo-backend`.
- `AWS_DEPLOY_ROLE_ARN` (role OIDC para Actions).
- `APP_RUNNER_SERVICE_ARN` (opcional en primera creación; luego se captura).
- `VPC_CONNECTOR_ARN` (si usas VPC privada).
- `DB_SECRET_ARN`, `JWT_SECRET_ARN` (ARNs desde Secrets Manager).

## Uso
- En `develop`, push al repo publica la imagen en ECR.
- Ejecutar manualmente el workflow de App Runner desde Actions → Run workflow.
- Seleccionar tag `sha` más reciente en App Runner (si aplicara creación manual).

## Referencias
- Prefijo API y health: `src/main.ts:76-77`, `src/health/health.controller.ts:11-14`.
- Entrypoint y migraciones: `entrypoint.sh:12-22`.