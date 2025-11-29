<template>
  <nav 
    class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
    role="navigation"
    aria-label="Navegación principal"
  >
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y marca -->
        <div class="flex items-center">
          <router-link 
            to="/catalogo" 
            class="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
            aria-label="ReSolVelo - Ir al catálogo principal"
          >
            <svg 
              class="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>ReSolVelo</span>
          </router-link>
        </div>

        <!-- Navegación desktop -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/catalogo"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/catalogo' }"
            aria-current="page"
          >
            Catálogo
          </router-link>
          
          <button
            @click="manejarClickPublicar"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/crear-publicacion' }"
          >
            Publicar
          </button>
          
          <router-link 
            to="/como-funciona"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/como-funciona' }"
          >
            Cómo funciona
          </router-link>

          <!-- Botones de autenticación -->
          <div v-if="!usuarioAutenticado" class="flex items-center space-x-4">
            <router-link 
              to="/login"
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Iniciar sesión
            </router-link>
            <router-link 
              to="/registro"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Registrarse
            </router-link>
          </div>

          <!-- Menú de usuario autenticado -->
          <div v-else class="relative flex items-center gap-2">
            <button
              @click="toggleMenuUsuario"
              @keydown.escape="cerrarMenuUsuario"
              class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :aria-expanded="menuUsuarioAbierto"
              aria-haspopup="true"
              aria-label="Menú de usuario"
            >
              <div class="w-8 h-8 aspect-square rounded-full overflow-hidden flex items-center justify-center bg-blue-600">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-8 h-8 object-cover" />
                <span v-else class="text-white text-sm font-medium">{{ iniciales }}</span>
              </div>
              <span>{{ nombreUsuario }}</span>
              <svg 
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': menuUsuarioAbierto }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              @click="toggleNotificaciones"
              class="relative px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-50"
              aria-label="Notificaciones"
              :aria-expanded="menuNotificacionesAbierto"
            >
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute -top-1 -right-1 min-w-[20px] px-1 rounded-full text-white text-xs text-center" :class="noLeidasCount > 0 ? 'bg-red-600' : 'bg-gray-300'" aria-label="Notificaciones sin leer">{{ noLeidasCount }}</span>
            </button>

            <Transition name="fade-down">
              <div 
                v-if="menuNotificacionesAbierto"
                class="absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                role="dialog"
                aria-label="Notificaciones"
              >
                <div class="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-900">Notificaciones</span>
                  <button @click="marcarNotificacionesLeidas" class="text-xs text-blue-600 hover:text-blue-700">Marcar leídas</button>
                </div>
                <div class="max-h-96 overflow-y-auto">
                  <div v-if="cargandoNotificaciones" class="p-4 text-sm text-gray-600">Cargando...</div>
                  <div v-else-if="notificaciones.length === 0" class="p-4 text-sm text-gray-600">No hay notificaciones</div>
                  <ul v-else class="divide-y divide-gray-100">
                    <li 
                      v-for="n in notificaciones" 
                      :key="n.id" 
                      :class="[
                        'p-3 flex items-start gap-3 cursor-pointer transition-colors duration-150',
                        !n.read ? 'bg-white' : 'bg-white',
                        n.tipo === 'MENSAJE' ? 'border-l-4 border-blue-400 hover:bg-blue-50/50' :
                        n.tipo === 'RESEÑA' ? 'border-l-4 border-yellow-400 hover:bg-yellow-50/50' :
                        'border-l-4 border-indigo-400 hover:bg-indigo-50/50'
                      ]"
                      @click="handleClickNotificacion(n)" role="button" :data-id="n.id"
                    >
                      <div 
                        class="w-6 h-6 rounded-full flex items-center justify-center"
                        :class="n.tipo === 'MENSAJE' ? 'bg-blue-50' : n.tipo === 'RESEÑA' ? 'bg-yellow-50' : 'bg-indigo-50'"
                      >
                        <svg v-if="n.tipo === 'MENSAJE'" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2h-5l-4 4z"/></svg>
                        <svg v-else-if="n.tipo === 'RESEÑA'" class="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <svg v-else class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 8h8M8 12h8M8 16h8"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900" :class="{ 'font-semibold': !n.read }">{{ n.titulo }}</p>
                        <p class="text-xs text-gray-600 truncate">{{ n.mensaje }}</p>
                      </div>
                      <div class="text-xs text-gray-500">{{ new Date(n.timestamp).toLocaleString('es-ES') }}</div>
                    </li>
                  </ul>
                </div>
              </div>
            </Transition>

            <!-- Dropdown del usuario -->
            <Transition name="fade-down">
              <div 
                v-if="menuUsuarioAbierto"
                class="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
              <router-link 
                to="/perfil"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Mi perfil
              </router-link>
              <router-link 
                to="/mis-publicaciones"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Panel del Propietario
              </router-link>
              <router-link 
                to="/mis-reservas"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Mis reservas
              </router-link>
              <router-link 
                to="/mensajes"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Mensajes
              </router-link>
              <router-link 
                v-if="esAdmin"
                to="/admin"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Menú administrador
              </router-link>
              <hr class="my-1">
              <button
                @click="cerrarSesion"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
              >
                Cerrar sesión
              </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Botón menú móvil -->
        <div class="md:hidden">
          <button
            @click="toggleMenuMovil"
            @keydown.escape="cerrarMenuMovil"
            class="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2 rounded-md"
            :aria-expanded="menuMovilAbierto"
            aria-label="Abrir menú de navegación"
          >
            <svg 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                v-if="!menuMovilAbierto"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16" 
              />
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menú móvil -->
      <div 
        v-if="menuMovilAbierto"
        class="md:hidden border-t border-gray-200 pt-4 pb-3"
        role="menu"
        aria-orientation="vertical"
        aria-label="Menú de navegación móvil"
      >
        <div class="space-y-1">
          <router-link 
            to="/catalogo"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/catalogo' }"
            role="menuitem"
            @click="cerrarMenuMovil"
          >
            Catálogo
          </router-link>
          
          <button
            @click="manejarClickPublicarMovil"
            class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/crear-publicacion' }"
            role="menuitem"
          >
            Publicar
          </button>
          
          <router-link 
            to="/como-funciona"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            @click="cerrarMenuMovil"
          >
            Cómo funciona
          </router-link>
        </div>

        <!-- Sección de autenticación móvil -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div v-if="!usuarioAutenticado" class="space-y-2">
            <router-link 
              to="/login"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Iniciar sesión
            </router-link>
            <router-link 
              to="/registro"
              class="block px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Registrarse
            </router-link>
          </div>

          <div v-else class="space-y-2">
            <div class="px-3 py-2 text-base font-medium text-gray-900">
              {{ nombreUsuario }}
            </div>
            <router-link 
              to="/perfil"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Mi perfil
            </router-link>
            <router-link 
              to="/mis-publicaciones"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Panel del Propietario
            </router-link>
            <router-link 
              to="/mis-reservas"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Mis reservas
            </router-link>
            <router-link 
              to="/mensajes"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Mensajes
            </router-link>
            <router-link 
              v-if="esAdmin"
              to="/admin"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Menú administrador
            </router-link>
            <button
              @click="cerrarSesion"
              class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <!-- Toast de notificación (p.ej., cierre de sesión) -->
  <div
    v-if="toastVisible"
    class="fixed top-4 left-1/2 -translate-x-1/2 transform bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-3"
    role="status"
    aria-live="polite"
  >
    <span>{{ toastMessage }}</span>
    <button
      @click="cerrarToast"
      class="text-white/80 hover:text-white focus:outline-none"
      aria-label="Cerrar notificación"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import adminService from '../services/admin'
import { notificacionesService, reservasService, type NotificacionItem } from '../services/api'

// Props y emits
interface Props {
  usuarioAutenticado?: boolean
  nombreUsuario?: string
  avatarUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  usuarioAutenticado: false,
  nombreUsuario: '',
  avatarUrl: ''
})

// Composables
const router = useRouter()

// Estado reactivo
const menuMovilAbierto = ref(false)
const menuUsuarioAbierto = ref(false)
const esAdmin = ref(false)
const menuNotificacionesAbierto = ref(false)
const notificaciones = ref<NotificacionItem[]>([])
const noLeidasCount = ref(0)
const cargandoNotificaciones = ref(false)
let poller: any = null
let es: EventSource | null = null

// Computed properties
const iniciales = computed(() => {
  if (!props.nombreUsuario) return 'U'
  return props.nombreUsuario
    .split(' ')
    .map(nombre => nombre.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

// Métodos para manejar menús
const toggleMenuMovil = () => {
  menuMovilAbierto.value = !menuMovilAbierto.value
  if (menuMovilAbierto.value) {
    menuUsuarioAbierto.value = false
  }
}

const cerrarMenuMovil = () => {
  menuMovilAbierto.value = false
}

const toggleMenuUsuario = () => {
  menuUsuarioAbierto.value = !menuUsuarioAbierto.value
  if (menuUsuarioAbierto.value) {
    menuMovilAbierto.value = false
    menuNotificacionesAbierto.value = false
  }
}

const cerrarMenuUsuario = () => {
  menuUsuarioAbierto.value = false
}

const cargarNotificaciones = async () => {
  try {
    cargandoNotificaciones.value = true
    const res = await notificacionesService.listar()
    notificaciones.value = res.items
    noLeidasCount.value = res.noLeidas
  } catch {}
  finally { cargandoNotificaciones.value = false }
}

const marcarNotificacionesLeidas = async () => {
  try { await notificacionesService.marcarLeidas(); await cargarNotificaciones() } catch {}
}

const toggleNotificaciones = async () => {
  menuNotificacionesAbierto.value = !menuNotificacionesAbierto.value
  if (menuNotificacionesAbierto.value) {
    menuUsuarioAbierto.value = false
    await cargarNotificaciones()
  }
}

const iniciarPollingNotificaciones = () => {
  detenerPollingNotificaciones()
  poller = setInterval(cargarNotificaciones, 30000)
}

const detenerPollingNotificaciones = () => {
  if (poller) { clearInterval(poller); poller = null }
}

// Cerrar menús al hacer clic fuera
const cerrarMenusAlClickFuera = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('nav')) {
    menuMovilAbierto.value = false
    menuUsuarioAbierto.value = false
    menuNotificacionesAbierto.value = false
  }
}

// Cerrar menús con tecla Escape
const manejarTeclaEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    menuMovilAbierto.value = false
    menuUsuarioAbierto.value = false
    menuNotificacionesAbierto.value = false
  }
}

// Método para manejar click en botón Publicar (desktop)
const manejarClickPublicar = () => {
  if (props.usuarioAutenticado) {
    // Usuario autenticado, redirigir a página de creación
    router.push('/crear-publicacion')
  } else {
    // Usuario no autenticado, redirigir a login con parámetro de redirección
    router.push('/login?redirect=/crear-publicacion')
  }
}

// Método para manejar click en botón Publicar (móvil)
const manejarClickPublicarMovil = () => {
  cerrarMenuMovil()
  manejarClickPublicar()
}

// Método para cerrar sesión
const cerrarSesion = () => {
  // Limpiar todos los datos de autenticación del localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('userData')
  
  // Actualizar el estado de autenticación en la aplicación
  if ((window as any).actualizarEstadoAutenticacion) {
    (window as any).actualizarEstadoAutenticacion()
  }
  
  // Cerrar menús
  cerrarMenuUsuario()
  cerrarMenuMovil()
  
  // Mostrar confirmación de cierre de sesión
  mostrarToast('Has cerrado sesión correctamente.')
  
  // Redirigir al catálogo
  router.push('/catalogo')
}

// Lifecycle hooks
onMounted(async () => {
  document.addEventListener('click', cerrarMenusAlClickFuera)
  document.addEventListener('keydown', manejarTeclaEscape)
  // Verificar rol de administrador al montar si el usuario está autenticado
  if (props.usuarioAutenticado) {
    verificarRolAdmin()
  }
  // Cargar conteo inicial de notificaciones para mostrar el badge persistente
  try { await cargarNotificaciones() } catch {}
  iniciarPollingNotificaciones()
  try {
    const msg = sessionStorage.getItem('mensajePostLogin')
    if (msg) {
      mostrarToast(msg)
      sessionStorage.removeItem('mensajePostLogin')
    }
  } catch {}
  try {
    const token = localStorage.getItem('access_token')
    if (token) {
      es = new EventSource(`/api/notificaciones/stream?token=${encodeURIComponent(token)}`)
      es.onmessage = async (ev) => {
        try {
          const data = JSON.parse(ev.data)
          if (data && typeof data.noLeidas === 'number') {
            noLeidasCount.value = data.noLeidas
          } else if (data && data.tipo === 'PUSH' && data.item) {
            noLeidasCount.value = Math.max(0, noLeidasCount.value + 1)
            if (menuNotificacionesAbierto.value) {
              await cargarNotificaciones()
            }
          }
        } catch {}
      }
      es.onerror = () => {}
    }
  } catch {}
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarMenusAlClickFuera)
  document.removeEventListener('keydown', manejarTeclaEscape)
  detenerPollingNotificaciones()
  try { if (es) es.close(); es = null } catch {}
})

// Estado y métodos para toast
const toastVisible = ref(false)
const toastMessage = ref('')

const mostrarToast = (mensaje: string) => {
  toastMessage.value = mensaje
  toastVisible.value = true
  // Ocultar automáticamente después de 3 segundos
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

const cerrarToast = () => {
  toastVisible.value = false
}

// Verificar si el usuario actual es administrador
const verificarRolAdmin = async () => {
  try {
    // Intento rápido: leer de localStorage
    const userDataRaw = localStorage.getItem('userData')
    if (userDataRaw) {
      try {
        const user = JSON.parse(userDataRaw)
        const rol = user?.rol
        if (rol === 'ADMINISTRADOR' || rol === 'SUPER_ADMIN') {
          esAdmin.value = true
          return
        }
      } catch (_) {
        // Ignorar error de parseo y continuar con verificación vía API
      }
    }

    // Verificación robusta: intentar listar usuarios admin (requiere rol admin)
    await adminService.listarUsuarios({ pagina: 1, limite: 1 })
    esAdmin.value = true
  } catch (error: any) {
    // Si recibe 401/403, no es admin; en otros errores de red, mantener oculto
    esAdmin.value = false
  }
}

// Re-verificar rol cuando cambia el estado de autenticación
watch(() => props.usuarioAutenticado, (nuevo) => {
  if (nuevo) {
    verificarRolAdmin()
    // Al autenticarse, refrescar inmediatamente el contador
    cargarNotificaciones()
  } else {
    esAdmin.value = false
  }
})
import { mensajesService } from '../services/api'

const extraerMensajeId = (id: string) => (id && id.startsWith('msg_')) ? id.slice(4) : id

const obtenerRolUsuario = (): string => {
  try {
    const raw = localStorage.getItem('userData')
    if (!raw) return ''
    const u = JSON.parse(raw)
    return String(u?.rol || '').toUpperCase()
  } catch {
    return ''
  }
}

const obtenerUsuarioActualId = (): string => {
  try {
    const raw = localStorage.getItem('userData')
    if (!raw) return ''
    const u = JSON.parse(raw)
    return String(u?.id || '')
  } catch {
    return ''
  }
}

const handleClickNotificacion = async (n: NotificacionItem) => {
  try {
    await notificacionesService.registrarInteraccion({ id: n.id, tipo: n.tipo, data: n.data })
  } catch {}
  try {
    if (n.tipo === 'MENSAJE' && n.data?.reservaId) {
      const reservaId = String(n.data.reservaId)
      try { await mensajesService.marcarLeidos(reservaId) } catch {}
      await router.push(`/mensajes/reserva/${encodeURIComponent(reservaId)}?m=${encodeURIComponent(extraerMensajeId(n.id))}&from=notif`)
    } else if (n.tipo === 'RESEÑA' && n.data?.publicacionId) {
      try { await notificacionesService.marcarLeidas() } catch {}
      await router.push(`/publicacion/${encodeURIComponent(String(n.data.publicacionId))}?from=notif`)
    } else if (n.tipo === 'PUBLICACION_EVENTO') {
      try { await notificacionesService.marcarLeidas() } catch {}
      const reservaId = n.data?.reservaId ? String(n.data.reservaId) : ''
      const publicacionId = n.data?.publicacionId ? String(n.data.publicacionId) : ''
      const rol = obtenerRolUsuario()
      const idLower = (n.id || '').toLowerCase()
      const msgLower = `${n.titulo || ''} ${n.mensaje || ''}`.toLowerCase()
      const esNueva = idLower.startsWith('res_nueva_') || msgLower.includes('nueva reserva') || msgLower.includes('reservó')
      const estadoMatch = /^res_estado_(.+)_(.+)$/i.exec(n.id || '')
      const estado = estadoMatch ? estadoMatch[2] : (msgLower.includes('actualizado a en_curso') ? 'EN_CURSO' : msgLower.includes('actualizado a confirmada') ? 'CONFIRMADA' : '')

      let esArrendatario = false
      let estadoReal = estado
      if (reservaId) {
        try {
          const detalle = await reservasService.obtenerReservaPorId(reservaId)
          const r = detalle?.data || detalle
          const uid = obtenerUsuarioActualId()
          esArrendatario = !!(uid && r?.usuarioId && String(r.usuarioId) === String(uid))
          if (r?.estado) estadoReal = String(r.estado)
        } catch {}
      }

      if (esNueva && publicacionId) {
        await router.push(`/mis-publicaciones?tab=solicitudes&focus=${encodeURIComponent(reservaId)}&from=notif`)
      } else if ((estadoReal === 'CONFIRMADA') && reservaId) {
        if (esArrendatario || rol === 'ARRENDATARIO') {
          await router.push(`/mis-reservas?tab=aprobadas&focus=${encodeURIComponent(reservaId)}&from=notif`)
        } else {
          await router.push(`/mis-publicaciones?tab=solicitudes&focus=${encodeURIComponent(reservaId)}&from=notif`)
        }
      } else if ((estadoReal === 'EN_CURSO') && reservaId) {
        if (!esArrendatario && rol !== 'ARRENDATARIO') {
          await router.push(`/mis-publicaciones?tab=reservas-activas&focus=${encodeURIComponent(reservaId)}&from=notif`)
        } else {
          await router.push(`/mis-reservas?tab=activas&focus=${encodeURIComponent(reservaId)}&from=notif`)
        }
      } else if (reservaId) {
        if (esArrendatario || rol === 'ARRENDATARIO') {
          await router.push(`/mis-reservas?focus=${encodeURIComponent(reservaId)}&from=notif`)
        } else {
          await router.push(`/mis-publicaciones?tab=solicitudes&focus=${encodeURIComponent(reservaId)}&from=notif`)
        }
      } else if (publicacionId) {
        await router.push(`/mis-publicaciones?pub=${encodeURIComponent(publicacionId)}&from=notif`)
      }
    } else {
      try { await notificacionesService.marcarLeidas() } catch {}
    }
  } finally {
    menuNotificacionesAbierto.value = false
    await cargarNotificaciones()
  }
}

</script>
<style scoped>
.fade-down-enter-active,
.fade-down-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-down-enter-to,
.fade-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
