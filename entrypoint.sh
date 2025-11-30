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
  # Capturamos el error pero permitimos continuar si es un error de baseline (P3005)
  # o cualquier otro error de migración, para no detener el arranque en producción.
  if npx prisma migrate deploy; then
    echo "[Entrypoint] Migraciones aplicadas correctamente"
  else
    echo "[Entrypoint] ⚠️ Falló 'prisma migrate deploy'. Verifique logs (posible P3005 baseline required)."
    echo "[Entrypoint] Continuando arranque..."
  fi
else
  echo "[Entrypoint] PRISMA_MIGRATE_DEPLOY=0 → se omiten migraciones al iniciar"
fi

# Bloque para Seed de Admin en Producción
if [ "${SEED_ADMIN_ON_START:-0}" = "1" ]; then
  echo "[Entrypoint] 🛡️ Ejecutando seed de Admin..."
  if node prisma/seed-production.js; then
    echo "[Entrypoint] Seed de Admin completado."
  else
    echo "[Entrypoint] ❌ Error en seed de Admin. Verifique variables ADMIN_EMAIL/ADMIN_PASSWORD."
    # No detenemos el contenedor, pero el admin no se habrá creado.
  fi
fi

echo "[Entrypoint] Iniciando aplicación NestJS..."
exec node dist/main