# ============================================================================
# DOCKERFILE PARA RESOLVELO BACKEND - NESTJS + PRISMA
# ============================================================================
# Este Dockerfile crea una imagen optimizada para producción del backend
# de ReSolVelo (plataforma de alquiler de equipos musicales) utilizando 
# Node.js, NestJS, TypeScript y Prisma.
# ============================================================================

# Usar imagen base oficial de Node.js LTS (Long Term Support)
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para Prisma y compilación
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    dumb-init

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
# COPY context ./context/ (Removed as per user request)

# ============================================================================
# ETAPA DE DEPENDENCIAS
# ============================================================================
FROM base AS dependencies

# Instalar todas las dependencias (prod + dev). Usamos `npm install` para evitar
# errores de sincronización cuando el package-lock.json está desactualizado.
RUN npm ci --silent

# ============================================================================
# ETAPA DE CONSTRUCCIÓN
# ============================================================================
FROM base AS build

# Copiar dependencias desde la etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Generar cliente de Prisma usando schema por defecto (prisma/schema.prisma)
RUN npx prisma generate

# Compilar aplicación TypeScript
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# ============================================================================
# ETAPA DE PRODUCCIÓN
# ============================================================================
FROM base AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copiar archivos necesarios para producción
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

COPY --from=build --chown=nestjs:nodejs /app/healthcheck.js ./
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# Copiar script de entrada que intenta migrar (opcional) y arranca la app
COPY --from=build --chown=nestjs:nodejs /app/entrypoint.sh ./entrypoint.sh
# Corregir finales de línea (CRLF -> LF) para evitar errores en Linux (como root antes de cambiar de usuario)
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh && chown nestjs:nodejs entrypoint.sh

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto de la aplicación
EXPOSE 3000

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Variable para controlar si se ejecutan migraciones al iniciar
# Por defecto NO se ejecutan para evitar fallos de despliegue cuando la BD no está lista
ENV PRISMA_MIGRATE_DEPLOY=0

# Comando de inicio: usa dumb-init y el script de entrada
CMD ["./entrypoint.sh"]

# ============================================================================
# ETIQUETAS DE METADATOS
# ============================================================================
LABEL maintainer="ReSolVelo Team"
LABEL description="Backend API para ReSolVelo - Plataforma de alquiler de equipos musicales"
LABEL version="1.0.0"

# ============================================================================
# HEALTHCHECK
# ============================================================================
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
