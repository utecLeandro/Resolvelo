// Enrutador principal de la aplicación
// Se crean rutas para login y registro siguiendo guía de estilo Airbnb
// y buenas prácticas de accesibilidad/UX.

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import PendingVerification from '../views/PendingVerification.vue'
import CatalogoPage from '../views/CatalogoPage.vue'
import DetallePublicacion from '../views/DetallePublicacion.vue'
import PerfilPage from '../views/PerfilPage.vue'
import CrearPublicacionPage from '../views/CrearPublicacionPage.vue'
import MisPublicacionesPage from '../views/MisPublicacionesPage.vue'
import DebugPage from '../views/DebugPage.vue'

// Definición de rutas de la aplicación
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/catalogo',
  },
  {
    path: '/catalogo',
    name: 'Catalogo',
    component: CatalogoPage,
    meta: {
      title: 'Catálogo de Instrumentos - ReSolVelo',
      description: 'Explora nuestra amplia selección de instrumentos musicales disponibles para alquiler'
    }
  },
  {
    path: '/publicacion/:id',
    name: 'DetallePublicacion',
    component: DetallePublicacion,
    meta: {
      title: 'Detalle del Instrumento - ReSolVelo',
      description: 'Información detallada del instrumento musical disponible para alquiler'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    // meta podría incluir reglas de auth en el futuro
  },
  {
    path: '/registro',
    name: 'Registro',
    component: RegisterPage,
  },
  {
    path: '/verificacion-pendiente',
    name: 'VerificaciónPendiente',
    component: PendingVerification,
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: PerfilPage,
    meta: {
      title: 'Mi perfil - ReSolVelo',
      description: 'Actualiza tu información de perfil'
    }
  },
  {
    path: '/crear-publicacion',
    name: 'CrearPublicacion',
    component: CrearPublicacionPage,
    meta: {
      title: 'Crear Publicación - ReSolVelo',
      description: 'Publica tu instrumento musical para alquiler'
    }
  },
  {
    path: '/editar-publicacion/:id',
    name: 'EditarPublicacion',
    component: () => import('../views/EditarPublicacionPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mis-publicaciones',
    name: 'MisPublicaciones',
    component: MisPublicacionesPage,
    meta: {
      title: 'Mis Publicaciones - ReSolVelo',
      description: 'Gestiona tus instrumentos musicales publicados'
    }
  },
  {
    path: '/debug',
    name: 'Debug',
    component: DebugPage,
    meta: {
      title: 'Debug - ReSolVelo',
      description: 'Página de debug temporal'
    }
  },

]

// Creación del router con historial HTML5
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navegación para manejar redirección post-login
router.beforeEach((to, from, next) => {
  // Si el usuario va al login
  if (to.name === 'Login') {
    // Verificar si hay un parámetro redirect en la URL
    const redirectParam = to.query.redirect as string
    if (redirectParam) {
      // Guardar la ruta de redirección desde el parámetro
      sessionStorage.setItem('rutaAnteriorLogin', redirectParam)
    } else if (from.name !== 'Login' && from.name !== 'Registro' && from.name !== 'VerificaciónPendiente') {
      // Si no hay parámetro redirect y no viene del login/registro, guardar la ruta anterior
      const rutaAnterior = from.fullPath
      if (rutaAnterior && rutaAnterior !== '/') {
        sessionStorage.setItem('rutaAnteriorLogin', rutaAnterior)
      }
    }
  }
  
  next()
})

export default router