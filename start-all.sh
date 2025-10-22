#!/bin/bash

# Script para levantar todo el proyecto ReSolVelo
# Ejecutar desde la raíz del proyecto: ./start-all.sh

echo "🚀 Iniciando ReSolVelo..."
echo "================================="

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto ReSolVelo"
    exit 1
fi

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Verificar puertos necesarios
echo "🔍 Verificando puertos..."
declare -A ports=(
    [3000]="Backend"
    [5174]="Frontend"
    [5433]="PostgreSQL"
    [6379]="Redis"
    [5555]="Prisma Studio"
)

for port in "${!ports[@]}"; do
    if check_port $port; then
        echo "⚠️  Puerto $port (${ports[$port]}) ya está en uso"
    fi
done

# 1. Detectar origen de base de datos y levantar servicios necesarios
echo "🐳 Detectando y levantando servicios de base de datos..."
# Cargar .env para leer DATABASE_URL
if [ -f ".env" ]; then
    set -a
    . ./.env
    set +a
fi

USE_REMOTE_DB=0
if [[ -n "$DATABASE_URL" ]]; then
    if echo "$DATABASE_URL" | grep -Eqi '@(localhost|127\.0\.0\.1):5433/'; then
        USE_REMOTE_DB=0
    else
        USE_REMOTE_DB=1
    fi
fi

if [ "$USE_REMOTE_DB" -eq 1 ]; then
    echo "🗄️  Usando base de datos remota (RDS). No se levantará PostgreSQL en Docker."
    # Levantar solo Redis (opcional)
    if docker-compose up -d redis; then
        echo "✅ Redis iniciado (Docker)"
    else
        echo "⚠️  No se pudo iniciar Redis. Si lo necesitas, inicia Docker y vuelve a intentar."
    fi
else
    echo "🗄️  Usando base de datos local (Docker). Levantando PostgreSQL y Redis..."
    if ! docker-compose up -d postgres redis; then
        echo "❌ Error al levantar Docker. Asegúrate de que Docker esté instalado y corriendo."
        exit 1
    fi
    echo "✅ Servicios de Docker iniciados"

    # Esperar a que PostgreSQL esté listo
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    max_attempts=30
    attempt=0
    while ! check_port 5433; do
        sleep 2
        attempt=$((attempt + 1))
        if [ $attempt -gt $max_attempts ]; then
            echo "❌ PostgreSQL no está respondiendo después de $max_attempts intentos"
            exit 1
        fi
    done
    echo "✅ PostgreSQL está listo"
fi

# 2. Verificar y configurar archivo .env
echo "⚙️  Verificando configuración..."
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
fi

# Verificar si CORS_ORIGIN está configurado
if ! grep -q "CORS_ORIGIN" .env; then
    echo "📝 Agregando configuración de CORS..."
    echo "" >> .env
    echo "CORS_ORIGIN=http://localhost:5174,http://localhost:8080" >> .env
fi

# 3. Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
if ! npm install; then
    echo "❌ Error al instalar dependencias del backend"
    exit 1
fi

# 4. Ejecutar migraciones y seed
echo "🗄️  Ejecutando migraciones de base de datos..."
if ! npx prisma migrate deploy --schema prisma/schema.prisma; then
    echo "❌ Error al ejecutar migraciones"
    exit 1
fi

echo "🌱 Ejecutando seed de datos..."
if ! npx prisma db seed --schema prisma/schema.prisma; then
    echo "⚠️  Warning: Error al ejecutar seed (puede ser normal si ya existen datos)"
fi

# 5. Configurar frontend
echo "🎨 Configurando frontend..."
cd frontend

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
if ! npm install; then
    echo "❌ Error al instalar dependencias del frontend"
    cd ..
    exit 1
fi

# Verificar configuración del frontend
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env del frontend..."
    echo "VITE_API_BASE_URL=/api" > .env
fi

cd ..

# 6. Iniciar todos los servicios
echo "🚀 Iniciando servicios..."

# Crear directorio para logs si no existe
mkdir -p logs

# Iniciar backend en segundo plano
echo "🔧 Iniciando backend..."
nohup npm run start:dev > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend.pid

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
max_attempts=30
attempt=0
while ! check_port 3000; do
    sleep 2
    attempt=$((attempt + 1))
    if [ $attempt -gt $max_attempts ]; then
        echo "❌ Backend no está respondiendo después de $max_attempts intentos"
        echo "📋 Logs del backend:"
        tail -20 logs/backend.log
        exit 1
    fi
done
echo "✅ Backend está listo"

# Iniciar frontend en segundo plano
echo "🎨 Iniciando frontend..."
cd frontend
nohup npm run dev -- --port 5174 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# Esperar a que el frontend esté listo
echo "⏳ Esperando a que el frontend esté listo..."
max_attempts=30
attempt=0
while ! check_port 5174; do
    sleep 2
    attempt=$((attempt + 1))
    if [ $attempt -gt $max_attempts ]; then
        echo "❌ Frontend no está respondiendo después de $max_attempts intentos"
        echo "📋 Logs del frontend:"
        tail -20 logs/frontend.log
        exit 1
    fi
done
echo "✅ Frontend está listo"

# Iniciar Prisma Studio (opcional)
echo "🔍 Iniciando Prisma Studio..."
nohup npx prisma studio --browser none > logs/prisma.log 2>&1 &
PRISMA_PID=$!
echo $PRISMA_PID > logs/prisma.pid

echo ""
echo "🎉 ¡ReSolVelo está listo!"
echo "================================="
echo "📱 Frontend:      http://localhost:5174"
echo "🔧 Backend API:   http://localhost:3000/api"
echo "🗄️  Prisma Studio: http://localhost:5555"
echo ""
echo "👥 Usuarios de prueba:"
echo "   📧 juan@test.com / JuanTest2024!"
echo "   📧 maria@test.com / MariaTest2024!"
echo "   📧 lolo@test.com / LoloTest2024!"
echo ""
echo "📋 Logs disponibles en:"
echo "   🔧 Backend: logs/backend.log"
echo "   🎨 Frontend: logs/frontend.log"
echo "   🔍 Prisma: logs/prisma.log"
echo ""
echo "🛑 Para detener todos los servicios, ejecuta: ./stop-all.sh"
echo "   O manualmente: docker-compose down && kill \$(cat logs/*.pid)"

# Intentar abrir el navegador (funciona en algunos sistemas)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:5174
elif command -v open > /dev/null; then
    open http://localhost:5174
fi