# Guía Paso a Paso: Migración de ReSolVelo a AWS

Explicaciones claras orientadas a usuarios sin conocimientos avanzados de DevOps. Incluye validaciones y resolución de problemas.

> Nota: Mantén los nombres técnicos en inglés (servicios/recursos). Las explicaciones están en español.

## 1. Preparativos
- Cuenta AWS con acceso a **IAM**, **VPC**, **RDS**, **S3**, **App Runner**, **Amplify**.
- Repositorio GitHub con permisos de `Actions` y OIDC configurado.
- Variables necesarias (anótalas): `AWS_REGION`, `AWS_ACCOUNT_ID`, `GitHub repo URL`.

## 2. Crear VPC
1. Abre `VPC` → `Create VPC`.
2. Selecciona `VPC and more`.
3. Configura:
   - `IPv4 CIDR`: `10.0.0.0/16`
   - `Subnets`: 2 privadas (en 2 AZ) y 1 pública opcional.
4. Habilita `DNS hostnames` y `DNS resolution`.

Validación:
- En `Subnets`, verifica que las privadas no tengan `auto-assign public IP`.

Captura: `docs/img/vpc-create.png` (añadir captura).

## 3. Crear RDS (PostgreSQL 15)
1. Ve a `RDS` → `Create database`.
2. Tipo: `Standard create`.
3. Engine: `PostgreSQL`, versión `15.x`.
4. Template: `Dev/Test`.
5. Instancia: `db.t3.micro`, almacenamiento `gp3 20GB`.
6. Desactiva `Public access`.
7. `DB Subnet Group`: selecciona subnets privadas.
8. `Security Group`: crea `rds-sg` (no abras al público).
9. Credenciales: usuario/contraseña; guarda en **Secrets Manager**.
10. Backups: `retention=7` días.

Validación:
- `Connectivity`: VPC y subnets privadas.
- `Security groups`: sin reglas públicas.

Troubleshooting:
- Error de conexión: revisa `VPC Connector` en App Runner y reglas del SG.

Capturas: `docs/img/rds-create.png`, `docs/img/rds-sg.png`.

## 4. Crear S3 Bucket (uploads)
1. `S3` → `Create bucket` → nombre `resolvelo-uploads-dev`.
2. Activa `Block Public Access` (todas las opciones).
3. Desactiva `ACLs`; mantén `Bucket versioning` opcional.

Validación:
- `Public access` bloqueado.

Troubleshooting:
- 403 al subir: faltan permisos IAM del backend.

Captura: `docs/img/s3-create.png`.

## 5. Secrets (DATABASE_URL, JWT_SECRET)
1. `Secrets Manager` → `Store a new secret`.
2. Tipo: `Other type of secrets`.
3. Clave `DATABASE_URL` (formato Prisma) y `JWT_SECRET`.
4. Define `Secret name`: `resolvelo/dev/DATABASE_URL` y `resolvelo/dev/JWT_SECRET`.

Validación:
- Prueba `Retrieve secret value`.

Captura: `docs/img/secrets-create.png`.

## 6. App Runner y VPC Connector
1. `App Runner` → `Create service`.
2. Source: `Container registry` → `ECR private`.
3. Imagen: se completará desde GitHub Actions.
4. `Port`: `3000`. `Health check path`: `/api/health`.
5. `Auto scaling`: `minSize=1`, `maxSize=3`, `maxConcurrency=50`.
6. `Network`: `Egress type: VPC` → `Create VPC Connector` → subnets privadas + SG que permite salida a RDS.
7. `Runtime environment secrets`: añade `DATABASE_URL` y `JWT_SECRET` (ARNs de Secrets Manager).

Validación:
- Al iniciar, `Logs` muestran `Prisma conectado` o aviso tolerado.

Troubleshooting:
- 5xx: revisa health y variables; confirma `PORT` y `Health check path`.

Capturas: `docs/img/apprunner-create.png`, `docs/img/vpc-connector.png`.

## 7. Amplify Hosting (frontend)
1. `Amplify` → `New app` → `Host web app` → `GitHub`.
2. Selecciona repo y rama.
3. `Build settings`: usa `frontend/amplify.yml`.
4. Variables: `VITE_API_BASE_URL=https://<app-runner-domain>/api`.

Validación:
- Abrir la URL de Amplify; SPA routing funciona.

Troubleshooting:
- 404 en rutas: verifica `redirects` 200 a `/index.html`.

Capturas: `docs/img/amplify-connect.png`, `docs/img/amplify-env.png`.

## 8. GitHub Actions (backend)
1. Crear Role OIDC en AWS y anotar `AWS_DEPLOY_ROLE_ARN`.
2. Añadir secrets en GitHub:
   - `AWS_REGION`, `ECR_REPOSITORY`, `APP_RUNNER_SERVICE_ARN`, `VPC_CONNECTOR_ARN`, `AUTO_SCALING_CONFIG_ARN` (opcional), `DB_SECRET_ARN`, `JWT_SECRET_ARN`, `AWS_DEPLOY_ROLE_ARN`.
3. El workflow `.github/workflows/backend-app-runner.yml` construye y empuja a ECR y actualiza App Runner.

Validación:
- Ver `Actions` → job verde; `App Runner` muestra nueva `Image ID`.

Troubleshooting:
- Fallo OIDC: revisa confianza del Role y permisos `apprunner:*`, `ecr:*` limitados.

## 9. Seguridad (IAM Mínimo)
- Backend Role (App Runner) con permisos:
  - `secretsmanager:GetSecretValue`
  - `ssm:GetParameters` (si usas SSM)
  - `logs:CreateLogStream`, `logs:PutLogEvents`
  - `ec2:CreateNetworkInterface` limitado al VPC Connector
- Amplify Role: acceso de lectura al repo y a logs.

Validación:
- CloudTrail registra llamadas; IAM Access Analyzer sin findings críticos.

## 10. Monitorización
- CloudWatch Alarms:
  - RDS: `CPUUtilization > 70% (5m)`, `DatabaseConnections > 80%`, `FreeStorageSpace < 2GB`.
  - App Runner: `HTTPCodeELB5XXCount`, `ServiceCPUUtilization`, `ServiceMemoryUtilization`.

## 11. Validaciones Finales
- `GET https://<app-runner-domain>/api/health` devuelve `{status:"OK"}`.
- Amplify sirve SPA y assets con caché/headers correctos.
- RDS sin acceso público; conexiones únicamente desde App Runner.
- S3 sin acceso público; operaciones vía backend.

## 12. Checklist Final
- [ ] Amplify desplegado con `amplify.yml` activo
- [ ] App Runner conectado a VPC, health OK
- [ ] RDS en subnets privadas, backups activos
- [ ] Secrets configurados y leídos por backend
- [ ] Alarms en CloudWatch creadas
- [ ] CI/CD backend funcionando (ECR → App Runner)

## 13. Anexos
- Comandos útiles (AWS CLI):
```bash
aws apprunner describe-service --service-arn <arn>
aws apprunner update-service --service-arn <arn> --source-configuration file://src.json
aws ecr describe-repositories --repository-names resolvelo-backend
```

> Agrega las capturas en `docs/img/` usando los nombres indicados para una guía completa.