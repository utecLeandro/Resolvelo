#!/bin/bash

# Script de desarrollo completo para ReSolVelo
# Levanta frontend, backend y conecta a RDS automáticamente
# Autor: NUCLEOTEC ReSolVelo
# Fecha: $(date +%Y-%m-%d)

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "🚀 ReSolVelo - Script de Desarrollo Completo"
    echo "=================================================="
    echo -e "${NC}"
}

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para verificar dependencias
check_dependencies() {
    print_info "Verificando dependencias..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_success "Dependencias verificadas"
}

# Función para verificar configuración de base de datos
check_database_config() {
    print_info "Verificando configuración de base de datos..."
    
    if [ ! -f ".env" ]; then
        print_error "Archivo .env no encontrado"
        print_info "Copia .env.example a .env y configura DATABASE_URL"
        exit 1
    fi
    
    # Leer DATABASE_URL del archivo .env
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL no está configurado en .env"
        exit 1
    fi
    
    if [[ $DATABASE_URL == *"localhost:5433"* ]]; then
        print_warning "DATABASE_URL apunta a PostgreSQL local"
        print_info "Se intentará levantar PostgreSQL con Docker"
        USE_LOCAL_DB=true
    else
        print_success "DATABASE_URL configurado para RDS"
        USE_LOCAL_DB=false
    fi
}

# Función para levantar servicios de base de datos si es necesario
start_database_services() {
    if [ "$USE_LOCAL_DB" = true ]; then
        print_info "Iniciando servicios de base de datos local..."
        
        # Verificar si Docker está disponible
        if ! command -v docker &> /dev/null; then
            print_error "Docker no está disponible pero DATABASE_URL apunta a localhost"
            print_info "Instala Docker o configura DATABASE_URL para RDS"
            exit 1
        fi
        
        # Intentar levantar servicios con docker-compose
        if docker-compose up -d postgres redis 2>/dev/null; then
            print_success "Servicios de base de datos iniciados"
            
            # Esperar a que PostgreSQL esté listo
            print_info "Esperando a que PostgreSQL esté listo..."
            for i in {1..30}; do
                if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
                    print_success "PostgreSQL está listo"
                    break
                fi
                if [ $i -eq 30 ]; then
                    print_error "PostgreSQL no respondió después de 30 segundos"
                    exit 1
                fi
                sleep 1
            done
        else
            print_error "No se pudieron iniciar los servicios de base de datos"
            exit 1
        fi
    else
        print_info "Usando RDS - no se requieren servicios locales de base de datos"
        
        # Intentar levantar solo Redis si Docker está disponible
        if command -v docker &> /dev/null && docker-compose up -d redis 2>/dev/null; then
            print_success "Redis iniciado (opcional)"
        else
            print_warning "Redis no disponible - continuando sin Redis"
        fi
    fi
}

# Función para aplicar migraciones de Prisma
apply_migrations() {
    print_info "Aplicando migraciones de Prisma..."
    
    if npx prisma migrate deploy --schema prisma/schema.prisma; then
        print_success "Migraciones aplicadas correctamente"
    else
        print_error "Error al aplicar migraciones"
        exit 1
    fi
}

# Función para verificar puertos
check_ports() {
    print_info "Verificando puertos..."
    
    # Backend (puerto 3000)
    if check_port 3000; then
        print_warning "Puerto 3000 (backend) ya está en uso"
        print_info "Deteniendo proceso existente..."
        pkill -f "npm run start:dev" || true
        sleep 2
    fi
    
    # Frontend (puerto 5173)
    if check_port 5173; then
        print_warning "Puerto 5173 (frontend) ya está en uso"
        print_info "Deteniendo proceso existente..."
        pkill -f "npm run dev" || true
        sleep 2
    fi
    
    print_success "Puertos verificados"
}

# Función para abrir el frontend en Google Chrome
open_frontend_in_chrome() {
    local url=${1:-"http://localhost:5173"}
    # macOS
    if command -v open >/dev/null 2>&1; then
        if open -Ra "Google Chrome" >/dev/null 2>&1; then
            print_info "Abriendo frontend en Google Chrome: $url"
            open -a "Google Chrome" "$url" >/dev/null 2>&1 || open "$url"
        else
            print_warning "Google Chrome no encontrado, abriendo navegador predeterminado"
            open "$url" >/dev/null 2>&1
        fi
    # Linux
    elif command -v xdg-open >/dev/null 2>&1; then
        if command -v google-chrome >/dev/null 2>&1; then
            print_info "Abriendo frontend en Google Chrome: $url"
            google-chrome "$url" >/dev/null 2>&1 &
        elif command -v chromium >/dev/null 2>&1; then
            print_info "Abriendo frontend en Chromium: $url"
            chromium "$url" >/dev/null 2>&1 &
        else
            print_warning "Google Chrome no encontrado, abriendo navegador predeterminado"
            xdg-open "$url" >/dev/null 2>&1 &
        fi
    else
        print_warning "No se pudo abrir el navegador automáticamente. Abre manualmente: $url"
    fi
}

# Función para instalar dependencias del backend
install_backend_deps() {
    print_info "Instalando dependencias del backend..."
    
    if npm install; then
        print_success "Dependencias del backend instaladas"
    else
        print_error "Error al instalar dependencias del backend"
        exit 1
    fi
}

# Función para instalar dependencias del frontend
install_frontend_deps() {
    print_info "Instalando dependencias del frontend..."
    
    cd frontend
    if npm install; then
        print_success "Dependencias del frontend instaladas"
    else
        print_error "Error al instalar dependencias del frontend"
        exit 1
    fi
    cd ..
}

# Función para iniciar el backend
start_backend() {
    print_info "Iniciando backend en puerto 3000..."
    
    # Iniciar backend en background
    npm run start:dev > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Esperar a que el backend esté listo
    print_info "Esperando a que el backend esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
            print_success "Backend iniciado correctamente en http://localhost:3000"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend no respondió después de 30 segundos"
            print_info "Revisa backend.log para más detalles"
            exit 1
        fi
        sleep 1
    done
}

# Función para iniciar el frontend
start_frontend() {
    print_info "Iniciando frontend en puerto 5173..."
    
    cd frontend
    # Iniciar frontend en background
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Esperar a que el frontend esté listo
    print_info "Esperando a que el frontend esté listo..."
    for i in {1..20}; do
        if curl -s http://localhost:5173 >/dev/null 2>&1; then
            print_success "Frontend iniciado correctamente en http://localhost:5173"
            # Abrir en Google Chrome por defecto
            open_frontend_in_chrome "http://localhost:5173"
            break
        fi
        if [ $i -eq 20 ]; then
            print_error "Frontend no respondió después de 20 segundos"
            print_info "Revisa frontend.log para más detalles"
            exit 1
        fi
        sleep 1
    done
}

# Función para mostrar información final
show_final_info() {
    echo -e "${GREEN}"
    echo "=================================================="
    echo "🎉 ¡ReSolVelo está listo para desarrollo!"
    echo "=================================================="
    echo -e "${NC}"
    echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3000"
    echo -e "${BLUE}🏥 Health Check:${NC} http://localhost:3000/api/health"
    echo ""
    echo -e "${YELLOW}📋 Comandos útiles:${NC}"
    echo "  • Ver logs del backend: tail -f backend.log"
    echo "  • Ver logs del frontend: tail -f frontend.log"
    echo "  • Detener servicios: ./stop-all.sh"
    echo ""
    echo -e "${BLUE}🗄️  Base de datos:${NC}"
    if [ "$USE_LOCAL_DB" = true ]; then
        echo "  • PostgreSQL local (Docker)"
        echo "  • Acceso: localhost:5433"
    else
        echo "  • AWS RDS PostgreSQL"
        echo "  • Conexión configurada en .env"
    fi
    echo ""
    echo -e "${GREEN}✨ ¡Feliz desarrollo!${NC}"
}

# Función para cleanup en caso de error
cleanup() {
    print_warning "Limpiando procesos..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Trap para cleanup en caso de interrupción
trap cleanup EXIT

# Función principal
main() {
  SCRIPT_SOURCE="${BASH_SOURCE[0]:-$0}"
  SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  cd "$SCRIPT_DIR"
  print_info "Ejecutando desde: $SCRIPT_DIR"
    
    print_header
    
    # Verificaciones iniciales
    check_dependencies
    check_database_config
    check_ports
    
    # Instalar dependencias
    install_backend_deps
    install_frontend_deps
    
    # Iniciar servicios de base de datos
    start_database_services
    
    # Aplicar migraciones
    apply_migrations
    
    # Iniciar servicios
    start_backend
    start_frontend
    
    # Mostrar información final
    show_final_info
    
    # Mantener el script corriendo
    print_info "Presiona Ctrl+C para detener todos los servicios"
    wait
}

# Ejecutar función principal
main "$@"