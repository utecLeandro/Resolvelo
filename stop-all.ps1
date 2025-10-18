# Script para detener todos los servicios de ReSolVelo
# Ejecutar desde la raíz del proyecto: .\stop-all.ps1

Write-Host "🛑 Deteniendo ReSolVelo..." -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Detener servicios de Docker
Write-Host "🐳 Deteniendo servicios de Docker..." -ForegroundColor Yellow
try {
    docker-compose down
    Write-Host "✅ Servicios de Docker detenidos" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Error al detener Docker (puede que no esté corriendo)" -ForegroundColor Yellow
}

# Detener procesos de Node.js en los puertos específicos
$ports = @(3000, 5174, 5555)
foreach ($port in $ports) {
    Write-Host "🔍 Buscando procesos en puerto $port..." -ForegroundColor Yellow
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
                    Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($processId in $processes) {
            if ($processId -and $processId -ne 0) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "🔪 Deteniendo proceso: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
    catch {
        Write-Host "⚠️  No se encontraron procesos en puerto $port" -ForegroundColor Yellow
    }
}

# Detener procesos específicos de Node.js relacionados con el proyecto
Write-Host "🔍 Buscando procesos de Node.js del proyecto..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
                    Where-Object { $_.CommandLine -like "*start:dev*" -or 
                                  $_.CommandLine -like "*vite*" -or 
                                  $_.CommandLine -like "*prisma studio*" }
    
    foreach ($process in $nodeProcesses) {
        Write-Host "🔪 Deteniendo proceso Node.js: $($process.Id)" -ForegroundColor Red
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
}
catch {
    Write-Host "⚠️  No se encontraron procesos específicos de Node.js" -ForegroundColor Yellow
}

# Limpiar archivos temporales si existen
if (Test-Path "logs") {
    Write-Host "🧹 Limpiando archivos de logs..." -ForegroundColor Yellow
    Remove-Item "logs\*.pid" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✅ Todos los servicios han sido detenidos" -ForegroundColor Green
Write-Host "💡 Para volver a iniciar, ejecuta: .\start-all.ps1" -ForegroundColor Cyan