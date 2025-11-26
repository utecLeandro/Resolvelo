#!/usr/bin/env bash
set -euo pipefail

# Publica la imagen del backend en ECR (us-east-1)
# Requiere AWS CLI autenticada y Docker instalado.

AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-197946144414}
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY=${ECR_REPOSITORY:-resolvelo-backend}

REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
SHA_TAG=$(git rev-parse --short HEAD || echo "local")
TS=$(date +%Y%m%d-%H%M%S)
UNIQUE_TAG="${SHA_TAG}-${TS}"

echo "Registry: ${REGISTRY}"
docker --version
aws --version

echo "Login en ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"

echo "Construyendo imagen (no cache) con tag único: ${UNIQUE_TAG}"
docker build --no-cache --progress=plain \
  -t "${REGISTRY}/${ECR_REPOSITORY}:${UNIQUE_TAG}" \
  -f Dockerfile .

echo "Empujando tag..."
docker push "${REGISTRY}/${ECR_REPOSITORY}:${UNIQUE_TAG}"

echo "Detalle del tag publicado tras el push:"
aws ecr describe-images --repository-name "${ECR_REPOSITORY}" --region "${AWS_REGION}" --image-ids imageTag="${UNIQUE_TAG}" --output json | sed -n '1,200p'

echo "✅ Publicación completada"