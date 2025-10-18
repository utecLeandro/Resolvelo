# Script para levantar todo el proyecto ReSolVelo
# Ejecutar desde la raíz del proyecto: .\start-all.ps1

Write-Host "Iniciando ReSolVelo..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Ejecuta este script desde la raíz del proyecto ReSolVelo" -ForegroundColor Red
    exit 1
}

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Verificar puertos necesarios
Write-Host "Verificando puertos..." -ForegroundColor Yellow
$ports = @{
    3000 = "Backend"
    5174 = "Frontend" 
    5433 = "PostgreSQL"
    6379 = "Redis"
    5555 = "Prisma Studio"
}

foreach ($port in $ports.Keys) {
    if (Test-Port $port) {
        Write-Host "Puerto $port ($($ports[$port])) ya está en uso" -ForegroundColor Yellow
    }
}

# 1. Verificar Docker y levantar servicios
Write-Host "Verificando Docker..." -ForegroundColor Cyan
try {
    docker --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está instalado"
    }
}
catch {
    Write-Host "Error: Docker no está instalado." -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker está corriendo
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está corriendo"
    }
}
catch {
    Write-Host "Error: Docker Desktop no está corriendo." -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y espera a que esté completamente cargado." -ForegroundColor Yellow
    Write-Host "Luego ejecuta este script nuevamente." -ForegroundColor Yellow
    exit 1
}

# Levantar servicios de Docker (PostgreSQL y Redis)
Write-Host "Levantando servicios de base de datos..." -ForegroundColor Cyan
try {
    docker-compose up -d postgres redis
    if ($LASTEXITCODE -ne 0) {
        throw "Error al levantar Docker"
    }
    Write-Host "Servicios de Docker iniciados" -ForegroundColor Green
}
catch {
    Write-Host "Error al levantar servicios de Docker." -ForegroundColor Red
    Write-Host "Verifica que Docker Desktop esté corriendo correctamente." -ForegroundColor Yellow
    exit 1
}

# Esperar a que PostgreSQL esté listo
Write-Host "Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $pgReady = Test-Port 5433
    if ($attempt -gt $maxAttempts) {
        Write-Host "PostgreSQL no está respondiendo después de $maxAttempts intentos" -ForegroundColor Red
        exit 1
    }
} while (-not $pgReady)
Write-Host "PostgreSQL está listo" -ForegroundColor Green

# 2. Verificar y configurar archivo .env
Write-Host "Verificando configuración..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Write-Host "Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Verificar si CORS_ORIGIN está configurado
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "CORS_ORIGIN") {
    Write-Host "Agregando configuración de CORS..." -ForegroundColor Yellow
    Add-Content ".env" "`nCORS_ORIGIN=http://localhost:5174,http://localhost:8080"
}

# 3. Instalar dependencias del backend
Write-Host "Instalando dependencias del backend..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al instalar dependencias del backend" -ForegroundColor Red
    exit 1
}

# 4. Ejecutar migraciones y seed
Write-Host "Ejecutando migraciones de base de datos..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al ejecutar migraciones" -ForegroundColor Red
    exit 1
}

Write-Host "Ejecutando seed de datos..." -ForegroundColor Cyan
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Error al ejecutar seed (puede ser normal si ya existen datos)" -ForegroundColor Yellow
}

# 5. Configurar frontend
Write-Host "Configurando frontend..." -ForegroundColor Cyan
Set-Location "frontend"

# Instalar dependencias del frontend
Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al instalar dependencias del frontend" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Verificar configuración del frontend
if (-not (Test-Path ".env")) {
    Write-Host "Creando archivo .env del frontend..." -ForegroundColor Yellow
    "VITE_API_BASE_URL=/api" | Out-File -FilePath ".env" -Encoding UTF8
}

Set-Location ".."

# 6. Iniciar todos los servicios
Write-Host "Iniciando servicios..." -ForegroundColor Green

# Iniciar backend en segundo plano
Write-Host "Iniciando backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev" -WindowStyle Minimized

# Esperar a que el backend esté listo
Write-Host "Esperando a que el backend esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $backendReady = Test-Port 3000
    if ($attempt -gt $maxAttempts) {
        Write-Host "Backend no está respondiendo después de $maxAttempts intentos" -ForegroundColor Red
        exit 1
    }
} while (-not $backendReady)
Write-Host "Backend está listo" -ForegroundColor Green

# Iniciar frontend en segundo plano
Write-Host "Iniciando frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev -- --port 5174" -WindowStyle Minimized

# Esperar a que el frontend esté listo
Write-Host "Esperando a que el frontend esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $frontendReady = Test-Port 5174
    if ($attempt -gt $maxAttempts) {
        Write-Host "Frontend no está respondiendo después de $maxAttempts intentos" -ForegroundColor Red
        exit 1
    }
} while (-not $frontendReady)
Write-Host "Frontend está listo" -ForegroundColor Green

# Iniciar Prisma Studio (opcional)
Write-Host "Iniciando Prisma Studio..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx prisma studio --browser none" -WindowStyle Minimized

Write-Host ""
Write-Host "ReSolVelo está listo!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Frontend:      http://localhost:5174" -ForegroundColor Cyan
Write-Host "Backend API:   http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "Prisma Studio: http://localhost:5555" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usuarios de prueba:" -ForegroundColor Yellow
Write-Host "   juan@test.com / JuanTest2024!" -ForegroundColor White
Write-Host "   maria@test.com / MariaTest2024!" -ForegroundColor White
Write-Host "   lolo@test.com / LoloTest2024!" -ForegroundColor White
Write-Host ""
Write-Host "Abriendo aplicación en el navegador..." -ForegroundColor Green
Start-Process "http://localhost:5174"

Write-Host ""
Write-Host "Para detener todos los servicios, cierra las ventanas de PowerShell que se abrieron." -ForegroundColor Yellow
Write-Host "O ejecuta: docker-compose down" -ForegroundColor Yellow