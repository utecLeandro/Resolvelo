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
import MisReservasPage from '../views/MisReservasPage.vue'
import PagoPage from '../views/PagoPage.vue'
import DebugPage from '../views/DebugPage.vue'
import PaginaInformativa from '../views/PaginaInformativa.vue'
import TestApiPage from '../views/TestApiPage.vue'

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
      title: 'Panel del Propietario - ReSolVelo',
      description: 'Gestiona tus instrumentos musicales publicados y solicitudes de alquiler'
    }
  },
  {
    path: '/mis-reservas',
    name: 'MisReservas',
    component: MisReservasPage,
    meta: {
      title: 'Mis Reservas - ReSolVelo',
      description: 'Gestiona tus reservas de instrumentos musicales'
    }
  },
  {
    path: '/pago/:id',
    name: 'Pago',
    component: PagoPage,
    meta: {
      title: 'Procesar Pago - ReSolVelo',
      description: 'Completa el pago para confirmar tu reserva'
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
  {
    path: '/test-api',
    name: 'TestApi',
    component: TestApiPage,
    meta: {
      title: 'Test API - ReSolVelo',
      description: 'Página de test para debuggear API'
    }
  },
  {
    path: '/como-funciona',
    name: 'ComoFunciona',
    component: PaginaInformativa,
    meta: {
      title: 'Cómo funciona - ReSolVelo',
      description: 'Descubre cómo funciona nuestra plataforma de alquiler de instrumentos musicales'
    }
  },
  {
    path: '/preguntas-frecuentes',
    name: 'PreguntasFrecuentes',
    component: PaginaInformativa,
    meta: {
      title: 'Preguntas Frecuentes - ReSolVelo',
      description: 'Encuentra respuestas a las preguntas más comunes sobre ReSolVelo'
    }
  },
  {
    path: '/contacto',
    name: 'Contacto',
    component: PaginaInformativa,
    meta: {
      title: 'Contacto - ReSolVelo',
      description: 'Ponte en contacto con nuestro equipo de soporte'
    }
  },
  {
    path: '/centro-ayuda',
    name: 'CentroAyuda',
    component: PaginaInformativa,
    meta: {
      title: 'Centro de Ayuda - ReSolVelo',
      description: 'Recursos y guías para aprovechar al máximo ReSolVelo'
    }
  },
  {
    path: '/politicas-seguridad',
    name: 'PoliticasSeguridad',
    component: PaginaInformativa,
    meta: {
      title: 'Políticas de Seguridad - ReSolVelo',
      description: 'Conoce nuestras medidas de seguridad y protección'
    }
  },
  {
    path: '/terminos-condiciones',
    name: 'TerminosCondiciones',
    component: PaginaInformativa,
    meta: {
      title: 'Términos y Condiciones - ReSolVelo',
      description: 'Lee los términos y condiciones de uso de la plataforma'
    }
  },
  {
    path: '/politica-privacidad',
    name: 'PoliticaPrivacidad',
    component: PaginaInformativa,
    meta: {
      title: 'Política de Privacidad - ReSolVelo',
      description: 'Información sobre cómo protegemos tu privacidad'
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