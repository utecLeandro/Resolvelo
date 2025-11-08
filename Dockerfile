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
COPY context ./context/

# ============================================================================
# ETAPA DE DEPENDENCIAS
# ============================================================================
FROM base AS dependencies

# Instalar todas las dependencias (prod + dev). Usamos `npm install` para evitar
# errores de sincronización cuando el package-lock.json está desactualizado.
RUN npm install --silent

# ============================================================================
# ETAPA DE CONSTRUCCIÓN
# ============================================================================
FROM base AS build

# Copiar dependencias desde la etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Generar cliente de Prisma usando schema en context
RUN npx prisma generate --schema context/schema.prisma

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

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto de la aplicación
EXPOSE 3000

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Script de inicio que ejecuta migraciones y luego inicia la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy --schema context/schema.prisma && node dist/main"]

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