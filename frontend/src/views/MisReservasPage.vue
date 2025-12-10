<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mis Reservas</h1>
        <p class="mt-1 text-sm text-gray-600">Gestiona tus reservas de instrumentos musicales</p>
      </div>

      <!-- Pestañas -->
      <div class="mb-8">
        <div class="border-b border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <nav class="-mb-px flex space-x-8 min-w-full sm:min-w-0" aria-label="Tabs">
            <button
              @click="pestanaActiva = 'pendientes'"
              :class="[
                pestanaActiva === 'pendientes'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Pendientes de Aprobación
              <span v-if="reservasPendientes.length > 0" class="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasPendientes.length }}
              </span>
            </button>
            <button
              @click="pestanaActiva = 'aprobadas'"
              :class="[
                pestanaActiva === 'aprobadas'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Aprobadas
              <span v-if="reservasAprobadas.length > 0" class="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasAprobadas.length }}
              </span>
            </button>
            <button
              @click="pestanaActiva = 'activas'"
              :class="[
                pestanaActiva === 'activas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Activas
              <span v-if="reservasActivas.length > 0" class="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasActivas.length }}
              </span>
            </button>
            <button
              @click="pestanaActiva = 'completadas'"
              :class="[
                pestanaActiva === 'completadas'
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Completadas
              <span v-if="reservasCompletadas.length > 0" class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasCompletadas.length }}
              </span>
            </button>
            <button
              @click="pestanaActiva = 'rechazadas'"
              :class="[
                pestanaActiva === 'rechazadas'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Rechazadas
              <span v-if="reservasRechazadas.length > 0" class="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasRechazadas.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="cargando" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Cargando reservas...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error al cargar reservas</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Contenido dinámico según la pestaña activa -->
      <div v-else>
        <!-- Reservas Pendientes -->
        <div v-if="pestanaActiva === 'pendientes'">
          <div v-if="reservasPendientes.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas pendientes</h3>
            <p class="mt-1 text-sm text-gray-500">Cuando solicites alquilar un instrumento aparecerá aquí.</p>
            <div class="mt-6">
              <router-link
                to="/catalogo"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorar catálogo
              </router-link>
            </div>
          </div>
          <div v-else>
            <ReservaCard 
              v-for="reserva in reservasPendientes" 
              :key="reserva.id" 
              :reserva="reserva" 
              :tipo="'pendiente'"
              @cancelar="confirmarCancelacion"
            />
          </div>
        </div>

        <!-- Reservas Aprobadas -->
        <div v-if="pestanaActiva === 'aprobadas'">
          <div v-if="reservasAprobadas.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas aprobadas</h3>
            <p class="mt-1 text-sm text-gray-500">Las reservas aprobadas que requieren pago aparecerán aquí.</p>
          </div>
          <div v-else>
            <ReservaCard 
              v-for="reserva in reservasAprobadas" 
              :key="reserva.id" 
              :reserva="reserva" 
              :tipo="'aprobada'"
              @pagar="procesarPago"
            />
          </div>
        </div>

        <!-- Reservas Activas -->
        <div v-if="pestanaActiva === 'activas'">
          <div v-if="reservasActivas.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas activas</h3>
            <p class="mt-1 text-sm text-gray-500">Los instrumentos que estés alquilando actualmente aparecerán aquí.</p>
          </div>
          <div v-else>
            <div
              v-for="reserva in reservasActivas"
              :key="reserva.id"
              :id="`reserva-${reserva.id}`"
              :class="[
                'mb-4',
                highlightReservaId === reserva.id ? 'ring-2 ring-blue-400 rounded-lg transition-shadow duration-500' : ''
              ]"
            >
              <ReservaCard 
                :reserva="reserva" 
                :tipo="'activa'"
                @contactar="contactarPropietario"
              />
            </div>
          </div>
        </div>

        <!-- Reservas Completadas -->
        <div v-if="pestanaActiva === 'completadas'">
          <div v-if="reservasCompletadas.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas completadas</h3>
            <p class="mt-1 text-sm text-gray-500">Los alquileres que hayas completado aparecerán aquí.</p>
          </div>
          <div v-else>
            <ReservaCard 
              v-for="reserva in reservasCompletadas" 
              :key="reserva.id" 
              :reserva="reserva" 
              :tipo="'completada'"
              @calificar="calificarReserva"
            />
          </div>
        </div>

        <!-- Reservas Rechazadas -->
        <div v-if="pestanaActiva === 'rechazadas'">
          <div v-if="reservasRechazadas.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas rechazadas</h3>
            <p class="mt-1 text-sm text-gray-500">Las solicitudes rechazadas aparecerán aquí.</p>
          </div>
          <div v-else>
            <ReservaCard 
              v-for="reserva in reservasRechazadas" 
              :key="reserva.id" 
              :reserva="reserva" 
              :tipo="'rechazada'"
            />
          </div>
        </div>
    </div>
  </div>
</div>

<BaseToast
  :visible="toastVisible"
  :title="toastTitle"
  :message="toastMessage"
  :type="toastType"
  @close="toastVisible = false"
/>

<BaseModal
  :isOpen="modalConfirmacionVisible"
  :title="modalConfirmacionTitulo"
  @close="cerrarModalConfirmacion"
>
  <p class="text-gray-700">{{ modalConfirmacionMensaje }}</p>
  <template #footer>
    <button @click="cerrarModalConfirmacion" class="px-4 py-2 rounded-md text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">Cancelar</button>
    <button @click="ejecutarAccionConfirmada" class="px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors">Confirmar</button>
  </template>
</BaseModal>

<BaseModal
  :isOpen="modalCalificacionVisible"
  title="Calificar experiencia"
  @close="cerrarModalCalificacion"
>
  <div class="flex items-center space-x-2 mb-4 justify-center">
    <button v-for="n in 5" :key="n" @click="seleccionarEstrellas(n)" :aria-label="`Seleccionar ${n} estrellas`" class="p-1 focus:outline-none transform hover:scale-110 transition-transform">
      <svg class="w-8 h-8 transition-colors duration-200" :class="puntuacionSeleccionada >= n ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  </div>
  <textarea v-model="comentarioCalificacion" class="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none" placeholder="Cuéntanos tu experiencia (opcional)"></textarea>
  <template #footer>
    <button @click="cerrarModalCalificacion" class="px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Cancelar</button>
    <button @click="enviarCalificacion" :disabled="puntuacionSeleccionada===0 || enviandoCalificacion" :class="['px-4 py-2 rounded-md font-medium text-white transition-colors', puntuacionSeleccionada===0 || enviandoCalificacion ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700']">Enviar reseña</button>
  </template>
</BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { reservasService, calificacionesService } from '../services/api'
import ReservaCard from '../components/ReservaCard.vue'
import BaseModal from '../components/common/BaseModal.vue'
import BaseToast from '../components/common/BaseToast.vue'

// Tipos para las reservas
interface ReservaArrendatario {
  id: string
  fechaInicio: string
  fechaFin: string
  precioTotal: number | string
  telefonoContacto?: string
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'RECHAZADA' | 'CANCELADA'
  motivoRechazo?: string
  fechaCreacion: string
  publicacion: {
    id: string
    titulo: string
    descripcion: string
    precioPorDia: number | string
    categoria: string
    direccion: string
    ciudad: string
    departamento: string
    imagenes: string[]
    propietario: {
      nombre: string
      apellido: string
      email: string
      telefono?: string
    }
  }
  transaccion?: {
    id: string
    estado: string
    fechaPago?: string
  }
}

// Composables
const router = useRouter()
const route = useRoute()

// Estado reactivo
const pestanaActiva = ref<'pendientes' | 'aprobadas' | 'activas' | 'completadas' | 'rechazadas'>('pendientes')
const reservas = ref<ReservaArrendatario[]>([])
const focusReservaId = ref<string | null>(null)
const highlightReservaId = ref<string | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const procesando = ref<string | null>(null)
const toastVisible = ref(false)
const toastMessage = ref('')
const toastTitle = ref('Notificación')
const toastType = ref<'success' | 'error' | 'info'>('info')

// Estado para modal de confirmación
const modalConfirmacionVisible = ref(false)
const modalConfirmacionTitulo = ref('Confirmación')
const modalConfirmacionMensaje = ref('')
const accionConfirmada = ref<(() => Promise<void>) | null>(null)

const cerrarModalConfirmacion = () => {
  modalConfirmacionVisible.value = false
  accionConfirmada.value = null
}

const ejecutarAccionConfirmada = async () => {
  if (accionConfirmada.value) {
    await accionConfirmada.value()
  }
  cerrarModalConfirmacion()
}

const mostrarToast = (mensaje: string, tipo: 'success' | 'error' | 'info' = 'info', titulo?: string) => {
  toastMessage.value = mensaje
  toastType.value = tipo
  toastTitle.value = titulo || (tipo === 'success' ? 'Éxito' : tipo === 'error' ? 'Error' : 'Información')
  toastVisible.value = true
}

// Computed para filtrar reservas por estado
const reservasPendientes = computed(() => 
  (reservas.value || []).filter(r => r.estado === 'PENDIENTE')
)

const reservasAprobadas = computed(() => 
  (reservas.value || []).filter(r => r.estado === 'CONFIRMADA')
)

const reservasActivas = computed(() => 
  (reservas.value || []).filter(r => r.estado === 'EN_CURSO')
)

const reservasCompletadas = computed(() => 
  (reservas.value || []).filter(r => r.estado === 'COMPLETADA')
)

const reservasRechazadas = computed(() => 
  (reservas.value || []).filter(r => r.estado === 'RECHAZADA')
)

// Actualización automática cada 30 segundos
let intervalId: number | null = null

// Función para manejar actualizaciones de reservas en tiempo real
const manejarActualizacionReserva = (event: CustomEvent) => {
  console.log('Evento reserva-actualizada recibido:', event.detail)
  
  const { reservaId, nuevoEstado } = event.detail
  
  console.log('Buscando reserva con ID:', reservaId)
  console.log('Reservas actuales:', reservas.value)
  
  // Actualizar el estado local de la reserva
  if (reservas.value && Array.isArray(reservas.value)) {
    const reserva = reservas.value.find(r => r.id === reservaId)
    console.log('Reserva encontrada:', reserva)
    
    if (reserva) {
      console.log(`Actualizando reserva ${reservaId} de ${reserva.estado} a ${nuevoEstado}`)
      reserva.estado = nuevoEstado
      console.log(`Reserva ${reservaId} actualizada a estado ${nuevoEstado}`)
      // Enfocar y cambiar automáticamente a pestaña 'activas' cuando pasa a EN_CURSO
      if (nuevoEstado === 'EN_CURSO') {
        pestanaActiva.value = 'activas'
        focusReservaId.value = reservaId
      }
    } else {
      console.log(`No se encontró la reserva con ID ${reservaId}`)
    }
  } else {
    console.log('reservas.value no es un array válido:', reservas.value)
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarMisReservas()
  
  // Si venimos con query ?tab=activas, activar esa pestaña
  const tab = (route.query.tab as string) || ''
  const focus = (route.query.focus as string) || ''
  if (tab === 'activas') {
    pestanaActiva.value = 'activas'
  } else if (tab === 'aprobadas') {
    pestanaActiva.value = 'aprobadas'
  }
  if (focus) {
    focusReservaId.value = focus
  }

  try {
    const raw = sessionStorage.getItem('paymentSuccess')
    if (raw) {
      sessionStorage.removeItem('paymentSuccess')
      const info = JSON.parse(raw)
      const monto = typeof info?.monto === 'number' ? info.monto : Number(info?.monto || 0)
      const txId = String(info?.transaccionId || '')
      const resId = String(info?.reservaId || '')
      const partes: string[] = []
      if (monto) partes.push(`Monto $${monto}`)
      if (txId) partes.push(`Transacción ${txId}`)
      toastMessage.value = partes.length ? partes.join(' · ') : 'Tu pago fue procesado correctamente.'
      toastVisible.value = true
      setTimeout(() => { toastVisible.value = false }, 5000)
      if (resId) {
        pestanaActiva.value = 'activas'
        focusReservaId.value = resId
      }
    }
  } catch {}

  // Configurar actualización automática cada 30 segundos
  intervalId = setInterval(async () => {
    if (!cargando.value) {
      await cargarMisReservas()
    }
  }, 30000)
  
  // Escuchar eventos de actualización de reservas
  window.addEventListener('reserva-actualizada', manejarActualizacionReserva as EventListener)
})

// Resaltar y hacer scroll suave a la reserva enfocada
watch(focusReservaId, async (id) => {
  if (!id) return
  await nextTick()
  // Esperar un pequeño tiempo por si la lista acaba de cambiar de pestaña
  setTimeout(() => {
    const el = document.getElementById(`reserva-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightReservaId.value = id
      // Quitar el resaltado luego de unos segundos
      setTimeout(() => {
        if (highlightReservaId.value === id) {
          highlightReservaId.value = null
        }
      }, 3000)
    }
  }, 150)
})

// Métodos
const cargarMisReservas = async () => {
  try {
    cargando.value = true
    error.value = null
    
    const response = await reservasService.obtenerMisReservas()
    
    // Manejar la respuesta del backend
    if (response.success) {
      reservas.value = Array.isArray(response.data) ? response.data : []
      
      // DEBUG: Imprimir estados de reservas recibidas
      console.group('🔍 [DEBUG] Reservas recibidas del backend')
      reservas.value.forEach(r => {
        console.log(`Reserva ${r.id} - ${r.publicacion?.titulo} - Estado: ${r.estado}`)
      })
      console.groupEnd()
      
    } else {
      throw new Error(response.message || 'Error al obtener las reservas')
    }
  } catch (err: any) {
    console.error('Error al cargar reservas:', err)
    const status = err?.response?.status
    if (status === 401) {
      error.value = 'Tu sesión expiró. Iniciá sesión nuevamente.'
    } else if (status === 403) {
      error.value = 'No estás autorizado para ver tus reservas.'
    } else {
      error.value = err?.response?.data?.message || err?.message || 'Error al cargar las reservas'
    }
    reservas.value = [] // Asegurar que siempre sea un array
  } finally {
    cargando.value = false
  }
}

const confirmarCancelacion = (reservaId: string) => {
  modalConfirmacionTitulo.value = 'Cancelar reserva'
  modalConfirmacionMensaje.value = '¿Estás seguro de que quieres cancelar esta reserva?'
  accionConfirmada.value = async () => await cancelarReserva(reservaId)
  modalConfirmacionVisible.value = true
}

const cancelarReserva = async (reservaId: string) => {
  try {
    procesando.value = reservaId
    await reservasService.cancelarReserva(reservaId)
    
    // Actualizar el estado local
    if (reservas.value && Array.isArray(reservas.value)) {
      const reserva = reservas.value.find(r => r.id === reservaId)
      if (reserva) {
        reserva.estado = 'CANCELADA'
      }
    }
    
    mostrarToast('Reserva cancelada exitosamente', 'success')
  } catch (err: any) {
    console.error('Error al cancelar reserva:', err)
    mostrarToast(err.response?.data?.message || 'Error al cancelar la reserva', 'error')
  } finally {
    procesando.value = null
  }
}

const procesarPago = async (reservaId: string) => {
  try {
    procesando.value = reservaId
    // Aquí implementaremos la lógica de pago
    router.push(`/pago/${reservaId}`)
  } catch (err: any) {
    console.error('Error al procesar pago:', err)
    mostrarToast(err.response?.data?.message || 'Error al procesar el pago', 'error')
  } finally {
    procesando.value = null
  }
}

const contactarPropietario = (reserva: ReservaArrendatario) => {
  router.push(`/mensajes/reserva/${reserva.id}`)
}

const modalCalificacionVisible = ref(false)
const reservaParaCalificarId = ref<string | null>(null)
const puntuacionSeleccionada = ref<number>(0)
const comentarioCalificacion = ref('')
const enviandoCalificacion = ref(false)

const abrirModalCalificacion = (reservaId: string) => {
  reservaParaCalificarId.value = reservaId
  puntuacionSeleccionada.value = 0
  comentarioCalificacion.value = ''
  modalCalificacionVisible.value = true
}

const cerrarModalCalificacion = () => {
  modalCalificacionVisible.value = false
  reservaParaCalificarId.value = null
}

const seleccionarEstrellas = (n: number) => {
  puntuacionSeleccionada.value = n
}

  const enviarCalificacion = async () => {
  if (!reservaParaCalificarId.value || !puntuacionSeleccionada.value) return
  try {
    enviandoCalificacion.value = true
    const payload = {
      reservaId: reservaParaCalificarId.value,
      puntuacion: puntuacionSeleccionada.value,
      comentario: comentarioCalificacion.value?.trim() || undefined,
    }
    const resp = await calificacionesService.crearCalificacion(payload)
    if (resp?.success) {
      mostrarToast('Reseña enviada exitosamente', 'success')
      const reserva = reservas.value.find(r => r.id === reservaParaCalificarId.value)
      cerrarModalCalificacion()
      if (reserva) router.push(`/publicacion/${reserva.publicacion.id}`)
    } else {
      throw new Error(resp?.message || 'Error al enviar la reseña')
    }
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        mostrarToast('Tu sesión expiró. Iniciá sesión nuevamente.', 'error')
      } else if (status === 403) {
        mostrarToast('No estás autorizado para calificar esta reserva.', 'error')
      } else {
        mostrarToast(error?.response?.data?.message || error?.message || 'Error al enviar la reseña', 'error')
      }
    } finally {
      enviandoCalificacion.value = false
    }
  }

const calificarReserva = (reservaId: string) => {
  abrirModalCalificacion(reservaId)
}

// Limpiar el intervalo y listeners cuando el componente se desmonte
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  
  // Remover el listener de eventos
  window.removeEventListener('reserva-actualizada', manejarActualizacionReserva as EventListener)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
