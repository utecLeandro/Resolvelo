# 🎵 ReSolVelo - Plataforma de Alquiler de Equipos Musicales

![ReSolVelo Logo](https://via.placeholder.com/800x200/1a1a1a/ffffff?text=ReSolVelo)

## 📖 Descripción

**ReSolVelo** es una plataforma web innovadora que conecta músicos, productores y entusiastas de la música para el alquiler de instrumentos y equipos musicales. Nuestra misión es democratizar el acceso a equipos musicales de alta calidad, permitiendo que cualquier persona pueda crear música sin la necesidad de grandes inversiones iniciales.

## ✨ Características Principales

### 🎸 Para Arrendatarios
- **Catálogo Extenso**: Amplia variedad de instrumentos y equipos musicales
- **Búsqueda Avanzada**: Filtros por categoría, ubicación, precio y disponibilidad
- **Sistema de Reservas**: Proceso simple y seguro de reserva
- **Calificaciones y Reseñas**: Sistema de reputación basado en experiencias reales
- **Geolocalización**: Encuentra equipos cerca de tu ubicación

### 🎤 Para Propietarios
- **Publicación Fácil**: Sube tus equipos con fotos y descripciones detalladas
- **Gestión de Disponibilidad**: Control total sobre fechas y horarios
- **Ingresos Pasivos**: Monetiza tus equipos musicales
- **Protección de Equipos**: Sistema de verificación y seguros
- **Comunicación Directa**: Chat integrado con arrendatarios

### 🛡️ Seguridad y Confianza
- **Verificación de Usuarios**: Proceso de verificación de identidad
- **Sistema de Pagos Seguro**: Transacciones protegidas
- **Seguros Incluidos**: Protección para equipos de alto valor
- **Soporte 24/7**: Atención al cliente especializada
- **Sistema de Disputas**: Resolución de conflictos profesional

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework**: Vue.js 3
- **Lenguaje**: TypeScript
- **Gestión de Estado**: Vuex
- **Estilos**: Tailwind CSS
- **Despliegue**: AWS Amplify

#### Backend
- **Runtime**: Node.js
- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **API**: RESTful
- **Autenticación**: JWT
- **ORM**: Prisma

#### Base de Datos
- **SGBD**: PostgreSQL
- **Hosting**: AWS RDS

#### Infraestructura
- **Cloud Provider**: AWS
- **Contenedores**: Docker
- **CI/CD**: GitHub Actions
- **Almacenamiento**: AWS S3
- **Backend Hosting**: AWS App Runner

## 🗄️ Modelo de Datos

### Entidades Principales

#### 👤 Usuarios
- Información personal y de contacto
- Sistema de roles (Usuario, Moderador, Administrador)
- Verificación de identidad
- Configuraciones de privacidad y notificaciones
- Sistema de reputación

#### 🎵 Publicaciones (Equipos)
- Información detallada del instrumento/equipo
- Categorización por tipo de instrumento
- Galería de imágenes
- Precios y disponibilidad
- Ubicación y condiciones de entrega
- Estado de moderación

#### 📅 Reservas
- Gestión de fechas y horarios
- Estados de reserva (pendiente, confirmada, activa, completada)
- Información de entrega y devolución
- Términos y condiciones específicos

#### 💳 Transacciones
- Procesamiento de pagos
- Historial de transacciones
- Reembolsos y disputas
- Comisiones de la plataforma

#### ⭐ Sistema de Calificaciones
- Calificaciones bidireccionales
- Comentarios y reseñas
- Métricas de calidad de servicio

#### 🛡️ Administración y Moderación
- Panel administrativo completo
- Sistema de moderación de contenido
- Gestión de disputas
- Auditoría de acciones
- Estadísticas y métricas del sistema

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- Docker y Docker Compose
- PostgreSQL
- Git

### Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/resolvelo.git
   cd resolvelo
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Levantar servicios con Docker**
   ```bash
   docker-compose up -d
   ```

4. **Instalar dependencias**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

5. **Generar cliente de Prisma y aplicar esquema**
   ```bash
   npm run prisma:generate
   npm run prisma:db:push
   ```

6. **Sembrar datos iniciales (opcional)**
   ```bash
   npm run prisma:seed
   ```

7. **Iniciar la aplicación**
   ```bash
   # Backend (puerto 3000)
   npm run start:dev
   
   # Frontend (puerto 5173) - en otra terminal
   cd frontend && npm run dev
   ```

### 🧪 Datos de Prueba

Después de ejecutar `npm run prisma:seed`, tendrás disponibles los siguientes usuarios de prueba:

| Usuario | Email | Contraseña | Descripción |
|---------|-------|------------|-------------|
| Juan Pérez | `juan@test.com` | `JuanTest2024!` | Usuario con guitarra acústica |
| María García | `maria@test.com` | `MariaTest2024!` | Usuario con batería |

**Publicaciones de ejemplo:**
- **Guitarra Acústica Yamaha FG800** - $25/día (Juan)
- **Batería Pearl Export Series** - $50/día (María)

**Datos incluidos:**
- ✅ Usuarios verificados con contraseñas hasheadas
- ✅ Publicaciones con imágenes de ejemplo
- ✅ Reserva de prueba confirmada
- ✅ Transacción de pago completada

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción

# Base de datos
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Sembrar datos
npm run db:studio    # Abrir Prisma Studio

# Testing
npm run test         # Ejecutar tests
npm run test:e2e     # Tests end-to-end
npm run test:cov     # Coverage de tests

# Linting y formato
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier
```

## 📁 Estructura del Proyecto

```
resolvelo/
├── src/
│   ├── modules/           # Módulos de la aplicación
│   │   ├── auth/         # Autenticación y autorización
│   │   ├── users/        # Gestión de usuarios
│   │   ├── publications/ # Publicaciones de equipos
│   │   ├── reservations/ # Sistema de reservas
│   │   ├── payments/     # Procesamiento de pagos
│   │   ├── ratings/      # Sistema de calificaciones
│   │   ├── admin/        # Panel administrativo
│   │   └── common/       # Utilidades compartidas
│   ├── config/           # Configuraciones
│   ├── database/         # Configuración de BD
│   └── main.ts          # Punto de entrada
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   ├── migrations/      # Migraciones
│   └── seeds/           # Datos iniciales
├── docker-compose.yml   # Configuración de Docker
├── Dockerfile          # Imagen de la aplicación
└── README.md           # Este archivo
```

## 🔐 Seguridad

### Medidas Implementadas
- **Autenticación JWT**: Tokens seguros con expiración
- **Validación de Datos**: Sanitización de inputs
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS Configurado**: Control de acceso entre dominios
- **Encriptación de Contraseñas**: Hash + salt con bcrypt
- **Validación de Contraseñas Seguras**: Cumple estándares OWASP
  - Mínimo 8 caracteres, máximo 128
  - Requiere mayúsculas, minúsculas, números y caracteres especiales
  - Bloquea contraseñas comunes y patrones inseguros
  - Validación en tiempo real con endpoint `/auth/validar-contrasena`
- **Validación de Archivos**: Control de tipos y tamaños
- **Auditoría Completa**: Log de todas las acciones administrativas

### Cumplimiento OWASP Top 10
- ✅ Injection Prevention
- ✅ Broken Authentication Protection
- ✅ Sensitive Data Exposure Prevention
- ✅ XML External Entities (XXE) Protection
- ✅ Broken Access Control Prevention
- ✅ Security Misconfiguration Protection
- ✅ Cross-Site Scripting (XSS) Prevention
- ✅ Insecure Deserialization Protection
- ✅ Using Components with Known Vulnerabilities Prevention
- ✅ Insufficient Logging & Monitoring Protection

## 🤝 Contribución

¡Bienvenido al equipo de desarrollo de ReSolVelo! Para mantener un flujo de trabajo organizado y colaborativo, seguimos una estrategia específica de ramas y procesos.

### 📋 Guía Rápida de Desarrollo

Para información detallada sobre el proceso de contribución, consulta nuestro [**CONTRIBUTING.md**](CONTRIBUTING.md).

### 🌿 Estrategia de Ramas

#### **Ramas Principales**
- **`main`**: Producción estable - ⚠️ **Protegida contra pushes directos**
- **`develop`**: Integración de funcionalidades completadas
- **`feature/*`**: Desarrollo de nuevas funcionalidades
- **`bugfix/*`**: Corrección de errores
- **`hotfix/*`**: Correcciones críticas en producción

#### **Flujo de Trabajo**
```bash
# 1. Crear nueva funcionalidad
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-funcionalidad

# 3. Crear Pull Request a develop
# 4. Revisión de código obligatoria
# 5. Merge después de aprobación
```

### 🔍 Pull Requests

**Requisitos Obligatorios:**
- ✅ **Revisión de código** por el otro miembro del equipo
- ✅ **Tests pasando** (cuando estén implementados)
- ✅ **Descripción clara** del cambio
- ✅ **Sin conflictos** con la rama destino

### 👥 Equipo de Desarrollo

Somos **2 desarrolladores** trabajando colaborativamente:
- Todas las funcionalidades requieren **revisión cruzada**
- **Comunicación constante** sobre cambios importantes
- **Pair programming** para funcionalidades complejas

### 📝 Estándares de Código

- **Nomenclatura**: 
  - Variables/funciones: `camelCase`
  - Clases: `PascalCase`
  - Archivos: `kebab-case`
- **Idioma**: Priorizar español cuando sea posible
- **Formato**: Prettier con configuración del proyecto
- **Linting**: ESLint con reglas estrictas
- **Commits**: Conventional Commits
- **Testing**: Cobertura mínima del 80%
- **Documentación**: JSDoc para funciones públicas

### 🚀 Proceso de Release

1. **Desarrollo** en ramas `feature/*`
2. **Integración** en `develop` vía PR
3. **Testing completo** en `develop`
4. **Release** de `develop` a `main` vía PR
5. **Deploy** automático a producción

## 📊 Roadmap

### Fase 1 - MVP (Actual)
- [x] Sistema de usuarios y autenticación
- [x] Publicación y búsqueda de equipos
- [x] Sistema de reservas básico
- [x] Procesamiento de pagos
- [x] Panel administrativo

### Fase 2 - Mejoras
- [ ] Aplicación móvil (React Native)
- [ ] Sistema de chat en tiempo real
- [ ] Integración con redes sociales
- [ ] Sistema de recomendaciones IA
- [ ] Programa de fidelización

### Fase 3 - Expansión
- [ ] Marketplace de accesorios
- [ ] Sistema de eventos musicales
- [ ] Integración con estudios de grabación
- [ ] Expansión internacional

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollo Backend**: Equipo de Ingeniería
- **Desarrollo Frontend**: Equipo de UI/UX
- **DevOps**: Equipo de Infraestructura
- **Product Owner**: Gestión de Producto

## 📞 Contacto

- **Email**: contacto@resolvelo.com
- **Website**: https://resolvelo.com
- **Soporte**: soporte@resolvelo.com

---

**ReSolVelo** - *Democratizando el acceso a la música* 🎵

[![Build Status](https://github.com/tu-usuario/resolvelo/workflows/CI/badge.svg)](https://github.com/tu-usuario/resolvelo/actions)
[![Coverage Status](https://coveralls.io/repos/github/tu-usuario/resolvelo/badge.svg?branch=main)](https://coveralls.io/github/tu-usuario/resolvelo?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)