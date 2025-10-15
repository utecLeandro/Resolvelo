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

]

// Creación del router con historial HTML5
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navegación para manejar redirección post-login
router.beforeEach((to, from, next) => {
  // Si el usuario va al login y no viene del login/registro, guardar la ruta anterior
  if (to.name === 'Login' && from.name !== 'Login' && from.name !== 'Registro' && from.name !== 'VerificaciónPendiente') {
    // Guardar la ruta anterior en sessionStorage para redirección post-login
    const rutaAnterior = from.fullPath
    if (rutaAnterior && rutaAnterior !== '/') {
      sessionStorage.setItem('rutaAnteriorLogin', rutaAnterior)
    }
  }
  
  next()
})

export default router