﻿<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Procesar Pago</h1>
        <p class="mt-2 text-gray-600">Completa el pago para confirmar tu reserva</p>
      </div>

      <!-- Loading State -->
      <div v-if="cargando" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Cargando informació³n de la reserva...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Success -->
      <div v-else-if="pagoExitoso" class="bg-green-50 border border-green-200 rounded-md p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-green-800">Â¡Pago Exitoso!</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>Tu pago ha sido procesado correctamente.</p>
              <p class="mt-1"><strong>ID de Transacció³n:</strong> {{ resultadoPago?.transaccionId }}</p>
              <p><strong>Referencia:</strong> {{ resultadoPago?.referenciaExterna }}</p>
              <p><strong>Mensaje:</strong> {{ resultadoPago?.mensaje }}</p>
            </div>
            <div class="mt-4">
              <router-link
                to="/mis-reservas"
                class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Ver mis reservas
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <div v-else-if="reserva" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Resumen de la reserva -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Resumen de la Reserva</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-gray-900">{{ reserva.publicacion.titulo }}</h3>
              <p class="text-sm text-gray-600">{{ reserva.publicacion.descripcion }}</p>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Fecha de inicio:</span>
                <span class="font-medium">{{ formatearFecha(reserva.fechaInicio) }}</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span class="text-gray-600">Fecha de fin:</span>
                <span class="font-medium">{{ formatearFecha(reserva.fechaFin) }}</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span class="text-gray-600">Duració³n:</span>
                <span class="font-medium">{{ calcularDias() }} día(s)</span>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Precio por día:</span>
                <span class="font-medium">${{ reserva.publicacion.precioPorDia }}</span>
              </div>
              <div class="flex justify-between text-lg font-semibold mt-2">
                <span>Total:</span>
                <span class="text-blue-600">${{ calcularTotal() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de pago -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Informació³n de Pago</h2>
          
          <form @submit.prevent="procesarPago" class="space-y-4">
            <div>
              <label for="metodoPago" class="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                id="metodoPago"
                v-model="formPago.metodoPago"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="MERCADO_PAGO">Mercado Pago</option>
                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="PAYPAL">PayPal</option>
              </select>
            </div>

            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
                Descripció³n (Opcional)
              </label>
              <textarea
                id="descripcion"
                v-model="formPago.descripcion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales sobre el pago..."
              ></textarea>
            </div>

            <!-- Simulació³n Notice -->


            <!-- Aviso de apertura de MP y monitoreo -->
            <div v-if="monitoreandoPago" class="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p class="text-sm text-blue-700">
                Abrimos Mercado Pago en una nueva pestaña. Esta página está monitoreando tu transacción
                (ID: <span class="font-mono">{{ transaccionIdMp || '...' }}</span>) y te redirigirá automáticamente
                a Mis Reservas cuando el pago se acredite.
              </p>
            </div>

            <button
              type="submit"
              :disabled="procesandoPago"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="procesandoPago" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando pago...
              </span>
              <span v-else>
                Proceder al pago - ${{ calcularTotal() }}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reservasService } from '@/services/api'
import { transaccionesService, type RespuestaPagoDto } from '@/services/transacciones.service'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { usuarioAutenticado, datosUsuario, verificarAutenticacion } = useAuth()

const cargando = ref(true)
const error = ref('')
const reserva = ref<any>(null)
const procesandoPago = ref(false)
const pagoExitoso = ref(false)
const resultadoPago = ref<RespuestaPagoDto | null>(null)

// Fallback: monitoreo de estado de pago via backend
const monitoreandoPago = ref(false)
const transaccionIdMp = ref<string>('')
let pollingTimer: number | null = null
let pollingInicio = 0

const formPago = ref({
  metodoPago: 'MERCADO_PAGO',
  descripcion: ''
})

const cargarReserva = async () => {
  try {
    cargando.value = true
    error.value = ''
    
    const reservaId = route.params.id as string
    
    if (!reservaId) {
      throw new Error('ID de reserva no válido')
    }

    // Obtener detalles de la reserva específica
    const respuesta = await reservasService.obtenerReservaPorId(reservaId)
    
    if (!respuesta || !respuesta.success || !respuesta.data) {
      throw new Error('Reserva no encontrada')
    }

    const reservaEncontrada = respuesta.data

    // Permitir reservas CONFIRMADA (para pago) y EN_CURSO (después del pago)
    if (reservaEncontrada.estado !== 'CONFIRMADA' && reservaEncontrada.estado !== 'EN_CURSO') {
      throw new Error('La reserva debe estar confirmada o en curso')
    }

    reserva.value = reservaEncontrada
  } catch (err: any) {
    console.error('Error cargando reserva:', err)
    error.value = err.message || 'Error al cargar la reserva'
  } finally {
    cargando.value = false
  }
}

const calcularDias = () => {
  if (!reserva.value) return 0
  const inicio = new Date(reserva.value.fechaInicio)
  const fin = new Date(reserva.value.fechaFin)
  return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const calcularTotal = () => {
  if (!reserva.value) return 0
  return reserva.value.publicacion.precioPorDia * calcularDias()
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const procesarPago = async () => {
  try {
    procesandoPago.value = true
    error.value = ''

    // Crear preferencia de Mercado Pago y redirigir al checkout
    const pref = await transaccionesService.crearPreferenciaMercadoPago(
      reserva.value.id,
      formPago.value.descripcion || `Pago de reserva para ${reserva.value.publicacion.titulo}`
    )

    // Si el backend indica ok=false o faltan URLs, intentamos mostrar un mensaje claro
    if (!pref || pref.ok !== true) {
      throw new Error(pref?.message || 'No se pudo crear la preferencia de pago')
    }

    // Guardamos el transaccionId para poder monitorear el estado vía webhook
    if (pref?.transaccionId) {
      transaccionIdMp.value = pref.transaccionId
      localStorage.setItem('ultimoPago_transaccionId', pref.transaccionId)
      localStorage.setItem('ultimoPago_reservaId', reserva.value.id)
    }

    // Iniciar polling en la pestaña original como fallback si MP no redirige
    const iniciarPolling = () => {
      if (!transaccionIdMp.value) return
      if (pollingTimer) return
      monitoreandoPago.value = true
      pollingInicio = Date.now()
      const intervaloMs = 4000
      pollingTimer = window.setInterval(async () => {
        try {
          const tx = await transaccionesService.obtenerTransaccion(transaccionIdMp.value)
          // Estados del backend: COMPLETADA (pago acreditado), PENDIENTE/EN_PROCESO
          if (tx?.estado === 'COMPLETADA') {
            // Redirigimos al flujo de éxito; Mercado Pago también puede redirigir, pero este fallback no depende de ello
            if (pollingTimer) {
              clearInterval(pollingTimer)
              pollingTimer = null
            }
            monitoreandoPago.value = false
            router.replace({ path: '/pago-exitoso', query: { external_reference: tx.id } })
          } else {
            // Intento activo: consultar directamente a MP por external_reference si sigue pendiente
            try {
              const txVerificada = await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(transaccionIdMp.value)
              if (txVerificada?.estado === 'COMPLETADA') {
                if (pollingTimer) {
                  clearInterval(pollingTimer)
                  pollingTimer = null
                }
                monitoreandoPago.value = false
                router.replace({ path: '/pago-exitoso', query: { external_reference: txVerificada.id } })
                return
              }
            } catch (e) {
              console.warn('Verificación directa en MP falló:', e)
            }
            // Auto-stop tras 3 minutos para evitar polling infinito
            if (Date.now() - pollingInicio > 3 * 60 * 1000) {
              if (pollingTimer) {
                clearInterval(pollingTimer)
                pollingTimer = null
              }
              monitoreandoPago.value = false
            }
          }
        } catch (e) {
          // No romper el flujo por errores temporales
          console.warn('Polling pago: error obteniendo transacción', e)
        }
      }, intervaloMs)
    }

    if (!pref.redirectUrl) {
      // Fallback por si la API devuelve los campos crudos
      const fallbackUrl = (pref as any)?.sandbox_init_point || (pref as any)?.init_point
      if (fallbackUrl) {
        const mpWin = window.open(fallbackUrl, '_blank');
        iniciarPolling()
        if (!mpWin) {
          // Fallback: si el navegador bloquea popups, navegamos en la misma pestaña
          window.location.assign(fallbackUrl)
        }
        return
      }
      throw new Error('No se pudo obtener la URL de pago de Mercado Pago')
    }
    const mpWin = window.open(pref.redirectUrl, '_blank');
    iniciarPolling()
    if (!mpWin) {
      // Fallback: si el navegador bloquea popups, navegamos en la misma pestaña
      window.location.assign(pref.redirectUrl)
    }
    return
  } catch (err: any) {
    console.error('Error iniciando pago con Mercado Pago:', err)
    error.value = err?.response?.data?.message || err?.message || 'No se pudo iniciar el pago con Mercado Pago'
  } finally {
    // En caso de redirección exitosa, este finally no se ejecutará; se mantiene para errores previos
    procesandoPago.value = false
  }
}

onMounted(async () => {
  // Verificar autenticación antes de cargar la reserva
  await verificarAutenticacion()
  
  if (!usuarioAutenticado.value) {
    error.value = 'Debes iniciar sesión para acceder a esta página'
    router.push('/login')
    return
  }
  
  cargarReserva()
})

onBeforeUnmount(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
})
</script>