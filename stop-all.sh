#!/bin/bash

# Script para detener todos los servicios de ReSolVelo
# Ejecutar desde la raíz del proyecto: ./stop-all.sh

echo "🛑 Deteniendo ReSolVelo..."
echo "================================="

# Detener servicios de Docker
echo "🐳 Deteniendo servicios de Docker..."
if docker-compose down; then
    echo "✅ Servicios de Docker detenidos"
else
    echo "⚠️  Error al detener Docker (puede que no esté corriendo)"
fi

# Detener procesos usando archivos PID si existen
if [ -d "logs" ]; then
    echo "🔍 Buscando archivos PID..."
    
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                echo "🔪 Deteniendo proceso PID: $pid"
                kill "$pid" 2>/dev/null
                sleep 2
                # Si el proceso sigue corriendo, forzar terminación
                if kill -0 "$pid" 2>/dev/null; then
                    echo "🔪 Forzando terminación del proceso PID: $pid"
                    kill -9 "$pid" 2>/dev/null
                fi
            fi
            rm -f "$pidfile"
        fi
    done
fi

# Detener procesos en puertos específicos
ports=(3000 5174 5555)
for port in "${ports[@]}"; do
    echo "🔍 Buscando procesos en puerto $port..."
    
    # Buscar procesos usando lsof
    if command -v lsof > /dev/null; then
        pids=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$pids" ]; then
            for pid in $pids; do
                echo "🔪 Deteniendo proceso en puerto $port (PID: $pid)"
                kill "$pid" 2>/dev/null
                sleep 1
                # Si el proceso sigue corriendo, forzar terminación
                if kill -0 "$pid" 2>/dev/null; then
                    echo "🔪 Forzando terminación del proceso PID: $pid"
                    kill -9 "$pid" 2>/dev/null
                fi
            done
        fi
    fi
done

# Detener procesos específicos de Node.js relacionados con el proyecto
echo "🔍 Buscando procesos de Node.js del proyecto..."
if command -v pgrep > /dev/null; then
    # Buscar procesos de node que contengan palabras clave del proyecto
    node_pids=$(pgrep -f "node.*start:dev\|node.*vite\|node.*prisma.*studio" 2>/dev/null)
    if [ -n "$node_pids" ]; then
        for pid in $node_pids; do
            echo "🔪 Deteniendo proceso Node.js: $pid"
            kill "$pid" 2>/dev/null
            sleep 1
            # Si el proceso sigue corriendo, forzar terminación
            if kill -0 "$pid" 2>/dev/null; then
                echo "🔪 Forzando terminación del proceso PID: $pid"
                kill -9 "$pid" 2>/dev/null
            fi
        done
    fi
fi

# Limpiar directorio de logs
if [ -d "logs" ]; then
    echo "🧹 Limpiando archivos de logs..."
    rm -f logs/*.pid
fi

echo ""
echo "✅ Todos los servicios han sido detenidos"
echo "💡 Para volver a iniciar, ejecuta: ./start-all.sh"