# Guía de Inicio - ReSolVelo

## 🚀 Inicio Rápido (Recomendado)

### Un solo comando para levantar todo:

**Windows (PowerShell):**
```powershell
.\start-all.ps1
```

**Linux/Mac (Bash):**
```bash
./start-all.sh
```

### Para detener todo:

**Windows (PowerShell):**
```powershell
.\stop-all.ps1
```

**Linux/Mac (Bash):**
```bash
./stop-all.sh
```

---

## 📋 Pasos manuales (si prefieres control total)

### 1. Preparación del Backend

#### Configurar variables de entorno
Asegúrate de que el archivo `.env` en la raíz del proyecto contenga:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/resolvelo_db"

# Redis
REDIS_URL="redis://localhost:6379"

# CORS - IMPORTANTE para conectividad frontend
CORS_ORIGIN=http://localhost:5174,http://localhost:8080

# Otras configuraciones...
```

#### Levantar servicios de base de datos
```bash
# Desde la raíz del proyecto
docker-compose up -d postgres redis
```

#### Instalar dependencias y ejecutar migraciones
```bash
# Instalar dependencias
npm install

# Ejecutar migraciones de Prisma
npx prisma migrate deploy

# Ejecutar seed (datos de prueba)
npx prisma db seed
```

#### Iniciar el backend
```bash
npm run start:dev
```

### 2. Preparación del Frontend

#### Configurar Vite con proxy
El archivo `vite.config.ts` debe tener la configuración de proxy:

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

#### Configurar variables de entorno del frontend
El archivo `frontend/.env` debe contener:

```env
VITE_API_BASE_URL=/api
```

#### Configurar la API para usar el proxy
En `frontend/src/services/api.ts`, la URL base debe ser:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
```

#### Instalar dependencias e iniciar frontend
```bash
# Desde el directorio frontend
cd frontend
npm install
npm run dev -- --port 5174
```

### 3. Verificación

#### URLs de acceso:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000/api
- **Prisma Studio**: http://localhost:5555 (ejecutar `npx prisma studio --browser none`)

#### Usuarios de prueba:
- `juan@test.com` / `JuanTest2024!`
- `maria@test.com` / `MariaTest2024!`
- `lolo@test.com` / `LoloTest2024!`
- `gtbump2012@gmail.com` / `FedericoTest2024!`

### 4. Comandos de inicio rápido

#### Terminal 1 - Backend:
```bash
cd D:/TRAE/ReSolVelo/Resolvelo
npm run start:dev
```

#### Terminal 2 - Frontend:
```bash
cd D:/TRAE/ReSolVelo/Resolvelo/frontend
npm run dev -- --port 5174
```

#### Terminal 3 - Prisma Studio (opcional):
```bash
cd D:/TRAE/ReSolVelo/Resolvelo
npx prisma studio --browser none
```

### 5. Solución de problemas comunes

#### Error "Failed to fetch":
- Verificar que CORS_ORIGIN esté configurado en el .env del backend
- Verificar que el proxy esté configurado en vite.config.ts
- Verificar que VITE_API_BASE_URL=/api en frontend/.env

#### Error de base de datos:
- Verificar que PostgreSQL esté corriendo en puerto 5433
- Ejecutar `npx prisma migrate deploy`
- Ejecutar `npx prisma db seed`

#### Error de puertos ocupados:
- Backend: cambiar puerto en main.ts (por defecto 3000)
- Frontend: usar `--port` diferente (por defecto 5174)

### 6. Orden de ejecución recomendado

1. Levantar Docker (PostgreSQL + Redis)
2. Configurar .env del backend con CORS_ORIGIN
3. Ejecutar migraciones y seed
4. Iniciar backend
5. Verificar configuración de proxy en frontend
6. Iniciar frontend
7. Verificar conectividad en http://localhost:5174

## 🤖 Scripts de Automatización

### ¿Qué hacen los scripts?

**`start-all.ps1` / `start-all.sh`:**
1. ✅ Verifica puertos disponibles
2. 🐳 Levanta Docker (PostgreSQL + Redis)
3. ⚙️ Configura archivos .env automáticamente
4. 📦 Instala dependencias (backend y frontend)
5. 🗄️ Ejecuta migraciones y seed de base de datos
6. 🚀 Inicia backend, frontend y Prisma Studio
7. 🌐 Abre la aplicación en el navegador
8. 📋 Muestra información de acceso y usuarios de prueba

**`stop-all.ps1` / `stop-all.sh`:**
1. 🛑 Detiene todos los servicios de Docker
2. 🔪 Termina procesos de Node.js en puertos específicos
3. 🧹 Limpia archivos temporales y PIDs

### Ventajas de usar los scripts:
- ⚡ **Rapidez**: Todo listo en un comando
- 🔧 **Configuración automática**: No necesitas recordar configuraciones
- 🛡️ **Verificaciones**: Detecta problemas comunes automáticamente
- 📊 **Feedback visual**: Muestra el progreso paso a paso
- 🎯 **Consistencia**: Siempre se ejecuta de la misma manera

### Logs y debugging:
- **Windows**: Los servicios se abren en ventanas separadas de PowerShell
- **Linux/Mac**: Los logs se guardan en `logs/backend.log`, `logs/frontend.log`, `logs/prisma.log`

## Notas importantes

- **CORS**: La configuración de CORS_ORIGIN en el backend es crucial
- **Proxy**: El proxy de Vite evita problemas de CORS en desarrollo
- **Puertos**: Backend en 3000, Frontend en 5174, PostgreSQL en 5433
- **Base de datos**: Siempre verificar que PostgreSQL esté corriendo antes del backend
- **Scripts**: Usar los scripts de automatización para mayor comodidad y consistencia