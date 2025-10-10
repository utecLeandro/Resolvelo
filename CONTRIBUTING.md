# 🤝 Guía de Contribución - ReSolVelo

¡Gracias por contribuir al desarrollo de ReSolVelo! Esta guía establece las reglas y procesos para mantener un desarrollo organizado y colaborativo.

## 📋 Tabla de Contenidos

- [Estrategia de Ramas](#estrategia-de-ramas)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Pull Requests](#pull-requests)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Revisión de Código](#revisión-de-código)

## 🌿 Estrategia de Ramas

### **Ramas Principales**

#### `main`
- **Propósito**: Reflejo estable de producción de ReSolVelo
- **Protección**: ⚠️ **Protegida contra pushes directos**
- **Acceso**: Solo a través de Pull Requests aprobados
- **Estado**: Siempre debe estar en estado deployable

#### `develop`
- **Propósito**: Rama de integración para funcionalidades completadas
- **Uso**: Base para crear nuevas features
- **Merge**: Recibe features completadas y testeadas

### **Ramas de Trabajo**

#### `feature/*`
- **Nomenclatura**: `feature/nombre-descriptivo`
- **Ejemplos**:
  - `feature/sistema-reservas`
  - `feature/autenticacion-jwt`
  - `feature/panel-administrador`
- **Base**: Siempre desde `develop`
- **Ciclo de vida**: Se eliminan después del merge

#### `bugfix/*`
- **Nomenclatura**: `bugfix/descripcion-del-bug`
- **Ejemplos**:
  - `bugfix/error-validacion-email`
  - `bugfix/problema-carga-imagenes`
- **Base**: Desde `develop` o `main` según urgencia

#### `hotfix/*`
- **Nomenclatura**: `hotfix/descripcion-critica`
- **Uso**: Solo para correcciones críticas en producción
- **Base**: Directamente desde `main`
- **Merge**: A `main` y `develop` simultáneamente

## 🔄 Flujo de Trabajo

### **1. Crear Nueva Funcionalidad**

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear rama feature
git checkout -b feature/nombre-funcionalidad

# 3. Desarrollar y commitear
git add .
git commit -m "feat: implementar nueva funcionalidad"

# 4. Subir rama
git push origin feature/nombre-funcionalidad

# 5. Crear Pull Request a develop
```

### **2. Integrar a Develop**

```bash
# Después de aprobación del PR
git checkout develop
git pull origin develop
git branch -d feature/nombre-funcionalidad
```

### **3. Release a Main**

```bash
# Solo después de testing completo en develop
git checkout main
git pull origin main
# Crear PR de develop a main
```

## 🔍 Pull Requests

### **Requisitos Obligatorios**

- ✅ **Revisión de código** por el otro miembro del equipo
- ✅ **Tests pasando** (cuando estén implementados)
- ✅ **Descripción clara** del cambio
- ✅ **Sin conflictos** con la rama destino

### **Plantilla de PR**

```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de bug (bugfix)
- [ ] Corrección crítica (hotfix)
- [ ] Documentación
- [ ] Refactoring

## ✅ Checklist
- [ ] El código sigue los estándares del proyecto
- [ ] Se han agregado tests (si aplica)
- [ ] La documentación ha sido actualizada
- [ ] No hay conflictos de merge

## 🧪 Testing
Describe cómo se ha probado este cambio.

## 📸 Screenshots (si aplica)
Agregar capturas de pantalla para cambios visuales.
```

## 💻 Estándares de Código

### **Convenciones de Nomenclatura**

- **Variables y funciones**: `camelCase`
  ```typescript
  const nombreUsuario = 'Juan';
  function obtenerReservas() { }
  ```

- **Clases**: `PascalCase`
  ```typescript
  class UsuarioService { }
  class ReservaController { }
  ```

- **Constantes**: `UPPER_SNAKE_CASE`
  ```typescript
  const MAX_INTENTOS_LOGIN = 3;
  ```

- **Archivos**: `kebab-case`
  ```
  usuario.service.ts
  reserva.controller.ts
  ```

### **Idioma del Código**

- **Priorizar español** cuando sea posible
- **Comentarios en español**
- **Variables y funciones en español**
- **Mantener términos técnicos en inglés** cuando sea estándar

```typescript
// ✅ Correcto
const emailUsuario = 'usuario@ejemplo.com';
function validarCredenciales() { }

// ❌ Evitar mezclar idiomas innecesariamente
const userEmail = 'usuario@ejemplo.com';
```

## 📝 Commits

### **Formato de Commits**

Seguimos la convención [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### **Tipos de Commit**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (espacios, comas, etc.)
- `refactor`: Refactoring de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### **Ejemplos**

```bash
feat(auth): implementar autenticación JWT
fix(reservas): corregir validación de fechas
docs(readme): actualizar instrucciones de instalación
refactor(usuarios): optimizar consultas de base de datos
```

## 👥 Revisión de Código

### **Responsabilidades del Revisor**

- ✅ Verificar que el código sigue los estándares
- ✅ Comprobar la lógica de negocio
- ✅ Revisar seguridad (OWASP Top 10)
- ✅ Validar que no se rompe funcionalidad existente
- ✅ Sugerir mejoras constructivas

### **Responsabilidades del Autor**

- ✅ Código limpio y bien documentado
- ✅ Tests actualizados (cuando aplique)
- ✅ Descripción clara del PR
- ✅ Responder a comentarios de revisión
- ✅ Realizar cambios solicitados

## 🚀 Proceso de Release

### **Develop → Main**

1. **Testing completo** en rama develop
2. **Crear PR** de develop a main
3. **Revisión exhaustiva** por ambos desarrolladores
4. **Merge** solo después de aprobación
5. **Tag de versión** en main
6. **Deploy** a producción

## 🛡️ Reglas de Protección

### **Rama Main**
- ❌ No pushes directos
- ✅ Requiere PR aprobado
- ✅ Requiere revisión de código
- ✅ Requiere checks pasando

### **Rama Develop**
- ✅ Permite pushes directos solo para hotfixes
- ✅ Preferible usar PRs para trazabilidad

## 📞 Contacto y Dudas

Para dudas sobre el proceso de contribución:
- **GitHub Issues**: Para reportar problemas
- **GitHub Discussions**: Para preguntas generales
- **Slack/Discord**: Para comunicación directa del equipo

---

**¡Gracias por mantener ReSolVelo organizado y de alta calidad!** 🎵✨