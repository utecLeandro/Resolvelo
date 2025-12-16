// Enrutador principal de la aplicación
// Rutas públicas y protegidas, incluyendo panel de administración.

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Vistas principales
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import PendingVerification from '../views/PendingVerification.vue'
import VerificarEmail from '../views/VerificarEmail.vue'
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
import RecuperarContrasenaPage from '../views/RecuperarContrasenaPage.vue'
import ResetPasswordPage from '../views/ResetPasswordPage.vue'
import PagoExitoso from '../views/PagoExitoso.vue'
import PagoError from '../views/PagoError.vue'
import ChatReservaPage from '../views/ChatReservaPage.vue'
import MensajesHomePage from '../views/MensajesHomePage.vue'
import GubUyCallbackPage from '../views/GubUyCallbackPage.vue'
import GubUySimuladoPage from '../views/GubUySimuladoPage.vue'

// Administración
import AdminUsersPage from '../views/AdminUsersPage.vue'
import AdminHomePage from '../views/AdminHomePage.vue'
import AdminPublicacionesPage from '../views/AdminPublicacionesPage.vue'
import AdminLiquidacionesPage from '../views/AdminLiquidacionesPage.vue'

// Definición de rutas de la aplicación
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/catalogo' },

  // Administración
  {
    path: '/admin',
    name: 'Admin',
    component: AdminHomePage,
    meta: {
      title: 'Administración - ReSolVelo',
      description: 'Panel principal de administración',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsuarios',
    component: AdminUsersPage,
    meta: {
      title: 'Gestión de Usuarios - ReSolVelo',
      description: 'Panel para listar y habilitar/deshabilitar usuarios',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/publicaciones',
    name: 'AdminPublicaciones',
    component: AdminPublicacionesPage,
    meta: {
      title: 'Gestión de Publicaciones - ReSolVelo',
      description: 'Listado y moderación de publicaciones',
      requiresAuth: true,
    },
  },
  {
    path: '/admin/liquidaciones',
    name: 'AdminLiquidaciones',
    component: AdminLiquidacionesPage,
    meta: {
      title: 'Gestión de Liquidaciones - ReSolVelo',
      description: 'Pagos pendientes a propietarios',
      requiresAuth: true,
    },
  },

  // Catálogo y flujo público
  {
    path: '/catalogo',
    name: 'Catalogo',
    component: CatalogoPage,
    meta: {
      title: 'Catálogo de Instrumentos - ReSolVelo',
      description: 'Explora nuestra selección de instrumentos disponibles para alquiler',
    },
  },
  {
    path: '/publicacion/:id',
    name: 'DetallePublicacion',
    component: DetallePublicacion,
    meta: {
      title: 'Detalle del Instrumento - ReSolVelo',
      description: 'Información detallada del instrumento musical',
    },
  },
  { path: '/login', name: 'Login', component: LoginPage },
  {
    path: '/recuperar-contraseña',
    name: 'RecuperarContrasena',
    component: RecuperarContrasenaPage,
    meta: {
      title: 'Recuperación de contraseña - ReSolVelo',
      description: 'Solicita un enlace para restablecer tu contraseña',
    },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
    meta: {
      title: 'Restablecer contraseña - ReSolVelo',
      description: 'Ingresa una nueva contraseña para tu cuenta',
    },
  },
  { path: '/registro', name: 'Registro', component: RegisterPage },
  { path: '/verificacion-pendiente', name: 'VerificaciónPendiente', component: PendingVerification },
  {
    path: '/verificar-email',
    name: 'VerificarEmail',
    component: VerificarEmail,
    meta: {
      title: 'Verificación de Email - ReSolVelo',
      description: 'Verifica tu correo electrónico para activar tu cuenta',
    },
  },
  { path: '/gubuy/callback', name: 'GubUyCallback', component: GubUyCallbackPage },
  { path: '/gubuy/simulado', name: 'GubUySimulado', component: GubUySimuladoPage },
  {
    path: '/perfil',
    name: 'Perfil',
    component: PerfilPage,
    meta: {
      title: 'Mi perfil - ReSolVelo',
      description: 'Actualiza tu información de perfil',
    },
  },
  {
    path: '/crear-publicacion',
    name: 'CrearPublicacion',
    component: CrearPublicacionPage,
    meta: {
      title: 'Crear Publicación - ReSolVelo',
      description: 'Publica tu instrumento musical para alquiler',
    },
  },
  { path: '/editar-publicacion/:id', name: 'EditarPublicacion', component: () => import('../views/EditarPublicacionPage.vue'), meta: { requiresAuth: true } },
  {
    path: '/mis-publicaciones',
    name: 'MisPublicaciones',
    component: MisPublicacionesPage,
    meta: {
      title: 'Panel del Propietario - ReSolVelo',
      description: 'Gestiona tus publicaciones y solicitudes de alquiler',
    },
  },
  {
    path: '/mis-reservas',
    name: 'MisReservas',
    component: MisReservasPage,
    meta: {
      title: 'Mis Reservas - ReSolVelo',
      description: 'Gestiona tus reservas de instrumentos musicales',
    },
  },
  {
    path: '/mensajes',
    name: 'MensajesHome',
    component: MensajesHomePage,
    meta: { title: 'Mensajes - ReSolVelo', description: 'Tus conversaciones' },
  },
  {
    path: '/mensajes/reserva/:reservaId',
    name: 'ChatReserva',
    component: ChatReservaPage,
    meta: { title: 'Chat de Reserva - ReSolVelo', description: 'Conversación por reserva', requiresAuth: true },
  },
  {
    path: '/pago/:id',
    name: 'Pago',
    component: PagoPage,
    meta: {
      title: 'Procesar Pago - ReSolVelo',
      description: 'Completa el pago para confirmar tu reserva',
    },
  },
  {
    path: '/pago-exitoso',
    name: 'PagoExitoso',
    component: PagoExitoso,
    meta: {
      title: 'Pago Exitoso - ReSolVelo',
      description: 'Resumen del pago realizado',
      requiresAuth: true,
    },
  },
  {
    path: '/pago-error',
    name: 'PagoError',
    component: PagoError,
    meta: {
      title: 'Error de Pago - ReSolVelo',
      description: 'Hubo un problema procesando tu pago',
    },
  },
  { path: '/debug', name: 'Debug', component: DebugPage, meta: { title: 'Debug - ReSolVelo', description: 'Página de debug temporal' } },
  { path: '/test-api', name: 'TestApi', component: TestApiPage, meta: { title: 'Test API - ReSolVelo', description: 'Página de test para debuggear API' } },
  { path: '/como-funciona', name: 'ComoFunciona', component: PaginaInformativa, meta: { title: 'Cómo funciona - ReSolVelo', description: 'Cómo funciona la plataforma' } },
  { path: '/preguntas-frecuentes', name: 'PreguntasFrecuentes', component: PaginaInformativa, meta: { title: 'Preguntas Frecuentes - ReSolVelo', description: 'Respuestas a preguntas comunes' } },
  { path: '/contacto', name: 'Contacto', component: PaginaInformativa, meta: { title: 'Contacto - ReSolVelo', description: 'Contacta a nuestro equipo de soporte' } },
  { path: '/centro-ayuda', name: 'CentroAyuda', component: PaginaInformativa, meta: { title: 'Centro de Ayuda - ReSolVelo', description: 'Recursos y guías' } },
  { path: '/politicas-seguridad', name: 'PoliticasSeguridad', component: PaginaInformativa, meta: { title: 'Políticas de Seguridad - ReSolVelo', description: 'Medidas de seguridad y protección' } },
  { path: '/terminos-condiciones', name: 'TerminosCondiciones', component: PaginaInformativa, meta: { title: 'Términos y Condiciones - ReSolVelo', description: 'Términos y condiciones de uso' } },
  { path: '/politica-privacidad', name: 'PoliticaPrivacidad', component: PaginaInformativa, meta: { title: 'Política de Privacidad - ReSolVelo', description: 'Cómo protegemos tu privacidad' } },
]

// Creación del router con historial HTML5
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 }
  },
})

// Guard de navegación: gestión de redirect tras login y protección de rutas
router.beforeEach((to, from, next) => {
  // Si el usuario va al login
  if (to.name === 'Login') {
    const redirectParam = to.query.redirect as string
    if (redirectParam) {
      sessionStorage.setItem('rutaAnteriorLogin', redirectParam)
    } else {
      const rutasAuth = new Set([
        'Login',
        'Registro',
        'VerificaciónPendiente',
        'RecuperarContrasena',
        'ResetPassword',
        'VerificarEmail',
        'GubUyCallback',
        'GubUySimulado',
      ])
      if (from.name && !rutasAuth.has(String(from.name))) {
        const rutaAnterior = from.fullPath
        if (rutaAnterior && rutaAnterior !== '/') {
          sessionStorage.setItem('rutaAnteriorLogin', rutaAnterior)
        }
      }
    }
  }

  // Proteger rutas que requieren autenticación
  if (to.meta && (to.meta as any).requiresAuth) {
    const token = localStorage.getItem('access_token')
    if (!token) {
      const redirect = encodeURIComponent(to.fullPath)
      return next({ name: 'Login', query: { redirect } })
    }
  }
  
  // Actualizar título de la página
  if (to.meta && to.meta.title) {
    document.title = to.meta.title as string
  } else {
    document.title = 'ReSolVelo'
  }

  next()
})

export default router