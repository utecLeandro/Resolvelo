# Levantar servicios en desarrollo local (Windows)

Este documento define el procedimiento estándar para levantar el frontend y backend de ReSolVelo en local, hasta que se migre la infraestructura a la nube.

## Prerrequisitos
- Docker Desktop corriendo y contenedores de base de datos disponibles:
  - `postgres` en `5433` (host) / `5432` (contenedor)
  - `redis` en `6379`
- Node.js 18+ instalado.
- Puertos libres: `3006` (backend), `5174` (frontend).

## Variables de entorno
- Backend (`.env` en `Resolvelo/`):
  - `DATABASE_URL` y `REDIS_URL` apuntando a los contenedores locales.
  - `CORS_ORIGIN` debe incluir `http://127.0.0.1:5174`.
    - Ejemplo: `CORS_ORIGIN=http://127.0.0.1:5174,http://localhost:5174`
- Frontend (`Resolvelo/frontend/.env`):
  - `VITE_API_BASE_URL=/api`

## Arranque del Backend (NestJS)
- Directorio: `D:\TRAE\ReSolVelo\Resolvelo`
- Comando:

```powershell
npm run start:dev:3006
```

- Qué hace:
  - Define `HOST=127.0.0.1` y `PORT=3006`.
  - Configura URLs de retorno para Mercado Pago (`FRONTEND_URL`, `MP_SUCCESS_URL`, `MP_FAILURE_URL`, `MP_PENDING_URL`).
  - Expone la API con prefijo `\api`.

- Verificación rápida:
  - `http://127.0.0.1:3006/api/__routes`
  - `http://127.0.0.1:3006/api/__marker`

## Arranque del Frontend (Vite + Vue 3)
- Directorio: `D:\TRAE\ReSolVelo\Resolvelo\frontend`
- Comando:

```powershell
npm run dev -- --port 5174 --host 127.0.0.1
```

- Configuración relevante:
  - Proxy en `Resolvelo/frontend/vite.config.ts` apunta a `http://127.0.0.1:3006` para la ruta `\api`.
  - Base de API en `Resolvelo/frontend/.env` es `VITE_API_BASE_URL=/api`.

- Acceso:
  - `http://127.0.0.1:5174/`

## Flujo de URLs y conectividad
- Frontend consume `\api` que Vite proxya hacia `http://127.0.0.1:3006`.
- Backend expone endpoints bajo `http://127.0.0.1:3006/api`.

## Resolución de problemas
- `net::ERR_CONNECTION_REFUSED http://127.0.0.1:5174/...`:
  - El frontend no está corriendo o el puerto `5174` está ocupado.
  - Solución: iniciar el comando de Vite arriba o usar otro puerto: `npm run dev -- --port 5175 --host 127.0.0.1`.
- `Failed to fetch` desde el frontend:
  - Verificar que el backend esté disponible en `3006`.
  - Confirmar `CORS_ORIGIN` en `.env` del backend incluye `http://127.0.0.1:5174`.
  - Validar que el proxy de Vite apunta a `http://127.0.0.1:3006`.
- Diferencias `localhost` vs `127.0.0.1`:
  - Usar siempre `127.0.0.1` para evitar redirecciones y bloqueos en integración de pagos.

## Comandos de referencia
- Backend: `npm run start:dev:3006`
- Frontend: `npm run dev -- --port 5174 --host 127.0.0.1`
- Prisma Studio (opcional):

```powershell
cd D:\TRAE\ReSolVelo\Resolvelo
npx prisma studio --browser none
```

## Notas
- En desarrollo local la notificación `notification_url` de Mercado Pago requiere HTTPS público; usa verificación manual cuando sea necesario.
- No almacenar ni exponer credenciales sensibles en documentación o consola.