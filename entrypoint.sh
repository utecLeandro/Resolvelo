#!/bin/sh
set -eu
set -x # Activar debug log para ver cada comando ejecutado

echo "[Entrypoint] Iniciando script de arranque..."
echo "[Entrypoint] Verificando entorno..."
echo "[Entrypoint] NODE_ENV=${NODE_ENV:-no-definido}"
echo "[Entrypoint] PORT=${PORT:-3000}"
echo "[Entrypoint] Configuración de Base de Datos:"
echo "  - PRISMA_MIGRATE_DEPLOY: ${PRISMA_MIGRATE_DEPLOY:-0}"
echo "  - PRISMA_BASELINE: ${PRISMA_BASELINE:-0}"
echo "[Entrypoint] Configuración de Seed:"
echo "  - SEED_ADMIN_ON_START: ${SEED_ADMIN_ON_START:-0}"
echo "  - ADMIN_EMAIL: ${ADMIN_EMAIL:+Configurado (***)}"
echo "  - ADMIN_PASSWORD: ${ADMIN_PASSWORD:+Configurado (***)}"

# Baseline automático si se solicita (Para arreglar error P3005 en DB existente)
if [ "${PRISMA_BASELINE:-0}" = "1" ]; then
  echo "[Entrypoint] 🛠️ Iniciando Baseline de Migraciones (PRISMA_BASELINE=1)..."
  # Lista explícita de migraciones actuales para marcar como aplicadas
  MIGRATIONS="20251013011849_init 20251129120000_add_primer_login_pendiente 20251129133000_fix_schema_types"
  
  for MIGRATION in $MIGRATIONS; do
    echo "[Entrypoint] Intentando marcar migración como aplicada: $MIGRATION"
    # Intentamos resolver. Si falla (ej. ya aplicada), continuamos sin detener el script.
    npx prisma migrate resolve --applied "$MIGRATION" || echo "[Entrypoint] ⚠️ Nota: No se pudo marcar $MIGRATION (probablemente ya estaba aplicada)"
  done
  echo "[Entrypoint] Baseline finalizado."
fi

# Migraciones normales
if [ "${PRISMA_MIGRATE_DEPLOY:-0}" = "1" ]; then
  echo "[Entrypoint] Ejecutando 'prisma migrate deploy'..."
  if npx prisma migrate deploy; then
    echo "[Entrypoint] ✅ Migraciones aplicadas (o verificadas) correctamente"
  else
    echo "[Entrypoint] ⚠️ Falló 'prisma migrate deploy'. Si ves el error P3005, asegúrate de configurar PRISMA_BASELINE=1 y reiniciar."
  fi
else
  echo "[Entrypoint] PRISMA_MIGRATE_DEPLOY=0 → se omiten migraciones al iniciar"
fi

# Bloque para Seed de Admin en Producción
if [ "${SEED_ADMIN_ON_START:-0}" = "1" ]; then
  echo "[Entrypoint] 🛡️ Ejecutando seed de Admin..."
  
  if [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
     echo "[Entrypoint] ❌ Error: SEED_ADMIN_ON_START=1 pero faltan credenciales. Verifica ADMIN_EMAIL y ADMIN_PASSWORD."
  else
     # Ejecutamos el seed capturando errores para no detener el contenedor si falla
     if node prisma/seed-production.js; then
       echo "[Entrypoint] ✅ Seed de Admin completado exitosamente."
     else
       echo "[Entrypoint] ❌ Error en seed de Admin. Revisa los logs anteriores."
     fi
  fi
fi

echo "[Entrypoint] Iniciando aplicación NestJS..."
exec node dist/main
