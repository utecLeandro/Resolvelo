# 🚀 Scripts de Automatización - ReSolVelo

## Inicio Rápido

### Para levantar todo el proyecto:

**Windows:**
```powershell
.\start-all.ps1
```

**Linux/Mac:**
```bash
./start-all.sh
```

### Para detener todo:

**Windows:**
```powershell
.\stop-all.ps1
```

**Linux/Mac:**
```bash
./stop-all.sh
```

## ¿Qué incluyen los scripts?

### 🚀 `start-all` - Inicia todo el proyecto

#### Lo que hace automáticamente:
1. **Verificación de puertos** - Detecta si hay conflictos
2. **Docker** - Levanta PostgreSQL y Redis
3. **Configuración** - Crea/actualiza archivos .env
4. **Dependencias** - Instala npm packages del backend y frontend
5. **Base de datos** - Ejecuta migraciones y seed
6. **Servicios** - Inicia backend, frontend y Prisma Studio
7. **Navegador** - Abre automáticamente la aplicación

#### URLs disponibles después del inicio:
- 🌐 **Aplicación**: http://localhost:5174
- 🔧 **API Backend**: http://localhost:3000/api
- 🗄️ **Prisma Studio**: http://localhost:5555

#### Usuarios de prueba:
- `juan@test.com` / `JuanTest2024!`
- `maria@test.com` / `MariaTest2024!`
- `lolo@test.com` / `LoloTest2024!`
- `gtbump2012@gmail.com` / `FedericoTest2024!`

### 🛑 `stop-all` - Detiene todo

#### Lo que hace:
1. **Docker** - Detiene PostgreSQL y Redis
2. **Procesos** - Termina backend, frontend y Prisma Studio
3. **Limpieza** - Elimina archivos temporales y PIDs

## Requisitos Previos

### Software necesario:
- **Docker** - Para PostgreSQL y Redis
- **Node.js** - Para backend y frontend
- **npm** - Para gestión de dependencias

### Verificar instalación:
```bash
docker --version
node --version
npm --version
```

## Solución de Problemas

### Error: "Docker no está corriendo"
```bash
# Iniciar Docker Desktop (Windows/Mac)
# O en Linux:
sudo systemctl start docker
```

### Error: "Puerto ya en uso"
El script detecta automáticamente puertos ocupados. Si necesitas liberar puertos manualmente:

**Windows:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3000
# Terminar proceso por PID
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Ver qué está usando el puerto
lsof -i :3000
# Terminar proceso
kill -9 <PID>
```

### Error: "Migraciones fallan"
```bash
# Resetear base de datos
npx prisma migrate reset
# O ejecutar manualmente
npx prisma migrate deploy
npx prisma db seed
```

### Error: "Frontend no conecta con backend"
El script configura automáticamente:
- CORS en el backend
- Proxy en Vite
- Variables de entorno

Si persiste el problema, verifica que ambos servicios estén corriendo.

## Logs y Debugging

### Windows:
- Los servicios se abren en ventanas separadas de PowerShell
- Cada ventana muestra los logs en tiempo real

### Linux/Mac:
- Los logs se guardan en archivos:
  - `logs/backend.log`
  - `logs/frontend.log` 
  - `logs/prisma.log`

### Ver logs en tiempo real (Linux/Mac):
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

## Personalización

### Cambiar puertos:
Edita las variables en los scripts:
- Backend: Puerto 3000
- Frontend: Puerto 5174
- PostgreSQL: Puerto 5433
- Redis: Puerto 6379
- Prisma Studio: Puerto 5555

### Agregar servicios adicionales:
Los scripts están diseñados para ser extensibles. Puedes agregar nuevos servicios siguiendo el patrón existente.

## Ventajas vs Inicio Manual

| Aspecto | Script Automático | Manual |
|---------|------------------|--------|
| Tiempo | ~2 minutos | ~10-15 minutos |
| Configuración | Automática | Manual |
| Errores | Detecta y reporta | Debugging manual |
| Consistencia | Siempre igual | Puede variar |
| Logs | Organizados | Dispersos |

## Contribuir

Si encuentras problemas o mejoras para los scripts:
1. Reporta issues específicos
2. Incluye logs de error
3. Especifica tu sistema operativo
4. Propón mejoras via PR

---

💡 **Tip**: Usa siempre los scripts para desarrollo. Solo usa el método manual si necesitas debugging específico o configuraciones especiales.