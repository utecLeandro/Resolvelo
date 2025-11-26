#!/bin/sh
# ==========================================================================
# Script de entrada del contenedor (production)
# - Ejecuta migraciones Prisma de forma opcional y no bloqueante
# - Arranca la aplicación NestJS en el puerto configurado
# ==========================================================================

set -eu

echo "[Entrypoint] NODE_ENV=${NODE_ENV:-no-definido} PORT=${PORT:-3000} PRISMA_MIGRATE_DEPLOY=${PRISMA_MIGRATE_DEPLOY:-0}"

# Intentar migraciones de forma opcional
if [ "${PRISMA_MIGRATE_DEPLOY:-0}" = "1" ]; then
  echo "[Entrypoint] Ejecutando 'prisma migrate deploy'..."
  if npx prisma migrate deploy --schema context/schema.prisma; then
    echo "[Entrypoint] Migraciones aplicadas correctamente"
  else
    echo "[Entrypoint] ⚠️ No se pudieron aplicar migraciones. Continuando sin bloquear el arranque."
  fi
else
  echo "[Entrypoint] PRISMA_MIGRATE_DEPLOY=0 → se omiten migraciones al iniciar"
fi

echo "[Entrypoint] Iniciando aplicación NestJS..."
exec node dist/main