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
        <span class="ml-3 text-gray-600">Cargando información de la reserva...</span>
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
            <h3 class="text-lg font-medium text-green-800">¡Pago Exitoso!</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>Tu pago ha sido procesado correctamente.</p>
              <p class="mt-1"><strong>ID de Transacción:</strong> {{ resultadoPago?.transaccionId }}</p>
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

      <!-- Payment Form / Brick -->
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
                <span class="text-gray-600">Duración:</span>
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

        <!-- Checkout Bricks: Payment -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Información de Pago</h2>
          <div id="paymentBrick_container"></div>
          <div v-if="brickError" class="mt-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {{ brickError }}
          </div>
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
const { usuarioAutenticado, verificarAutenticacion, datosUsuario } = useAuth()

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
let ws: WebSocket | null = null
const preferenciaId = ref<string>('')
const mpPublicKey = ref<string>('')
const brickError = ref<string>('')

const formPago = ref({
  metodoPago: 'MERCADO_PAGO',
  descripcion: ''
})

function sanitizeId(id: string): string {
  const limpio = (id || '').trim()
  if (!/^[a-zA-Z0-9]+$/.test(limpio)) {
    throw new Error('ID de reserva no válido')
  }
  return limpio
}

const cargarReserva = async () => {
  try {
    cargando.value = true
    error.value = ''
    
    const reservaIdRaw = route.params.id as string
    const reservaId = sanitizeId(reservaIdRaw)
    
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

const renderPaymentBrick = async () => {
  try {
    brickError.value = ''
    // Cargar SDK si no existe
    const ensureScript = () => new Promise<void>((resolve, reject) => {
      if ((window as any).MercadoPago) return resolve()
      const s = document.createElement('script')
      s.src = 'https://sdk.mercadopago.com/js/v2'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('No se pudo cargar el SDK de Mercado Pago'))
      document.head.appendChild(s)
    })
    await ensureScript()

    // Obtener public key
    mpPublicKey.value = (import.meta.env.VITE_MP_PUBLIC_KEY || '').trim()
    if (!mpPublicKey.value) {
      mpPublicKey.value = await transaccionesService.obtenerMpPublicKey()
    }
    if (!mpPublicKey.value) {
      throw new Error('Falta configurar la clave pública de Mercado Pago')
    }

    const mp = new (window as any).MercadoPago(mpPublicKey.value, { locale: 'es-UY' })
    const bricksBuilder = mp.bricks()
    const payer = {
      firstName: datosUsuario.value?.nombre || '',
      lastName: datosUsuario.value?.apellido || '',
      email: datosUsuario.value?.email || '',
    }
    const settings: any = {
      initialization: {
        amount: calcularTotal(),
        preferenceId: preferenciaId.value,
        payer,
      },
      customization: {
        visual: { style: { theme: 'default' } },
        paymentMethods: {
          creditCard: 'all',
          debitCard: 'all',
          ticket: 'all',
          bankTransfer: 'all',
          wallet_purchase: 'all',
          maxInstallments: 1,
        },
      },
      callbacks: {
        onReady: () => {},
        onSubmit: ({ selectedPaymentMethod, formData }: any) => {
          return new Promise<void>((resolve, reject) => {
            transaccionesService.procesarPagoBrick({ formData: { ...formData, transaction_amount: calcularTotal() }, transaccionId: transaccionIdMp.value, preferenceId: preferenciaId.value })
              .then(async (tx) => {
                if (tx?.estado === 'COMPLETADA') {
                  await finalizarFlujoAprobado(tx.id)
                } else if (tx?.estado === 'PENDIENTE') {
                  router.replace({ path: '/pago-exitoso', query: { external_reference: transaccionIdMp.value, status: 'pending' } })
                } else {
                  router.replace({ path: '/pago-error', query: { status: (tx?.estado || 'error').toLowerCase() } })
                }
                resolve()
              })
              .catch((err) => {
                brickError.value = err?.response?.data?.message || err?.message || 'Error procesando el pago'
                reject()
              })
          })
        },
        onError: (error: any) => {
          brickError.value = error?.message || 'Error en el Brick de pago'
        },
      },
    }
    ;(window as any).paymentBrickController = await bricksBuilder.create('payment', 'paymentBrick_container', settings)
  } catch (e: any) {
    brickError.value = e?.message || 'No se pudo inicializar el Brick de pago'
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
  // Una vez cargada la reserva, crear preferencia y renderizar Brick
  const esperarReserva = () => new Promise<void>((resolve) => {
    const tm = setInterval(() => {
      if (reserva.value) {
        clearInterval(tm)
        resolve()
      }
    }, 50)
  })
  await esperarReserva()
  try {
    const pref = await transaccionesService.crearPreferenciaMercadoPago(
      reserva.value.id,
      formPago.value.descripcion || `Pago de reserva para ${reserva.value.publicacion.titulo}`
    )
    if (!pref || pref.ok !== true) {
      throw new Error(pref?.message || 'No se pudo crear la preferencia de pago')
    }
    transaccionIdMp.value = String(pref.transaccionId || '')
    preferenciaId.value = String(pref.preferenciaId || '')
    localStorage.setItem('ultimoPago_transaccionId', transaccionIdMp.value)
    localStorage.setItem('ultimoPago_reservaId', reserva.value.id)
    await renderPaymentBrick()
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'No se pudo inicializar el pago'
  }
})

onBeforeUnmount(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
})

// Utilidades y flujos de finalización
const ensureHttpsUrl = (url: string): string => {
  try {
    const u = new URL(url)
    if (u.protocol === 'http:') {
      u.protocol = 'https:'
    }
    return u.toString()
  } catch {
    return url.replace(/^http:\/\//i, 'https://')
  }
}

const setupWebSocket = (transaccionId: string) => {
  try {
    const wsBase = (import.meta.env.VITE_WS_URL || '').trim()
    if (!wsBase) return
    const token = localStorage.getItem('access_token') || ''
    const url = `${wsBase}?transaccionId=${encodeURIComponent(transaccionId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`
    ws = new WebSocket(url)
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data?.tipo === 'pago' && data?.estado === 'COMPLETADA' && data?.transaccionId) {
          finalizarFlujoAprobado(data.transaccionId)
        }
      } catch {}
    }
    ws.onerror = () => {}
    ws.onclose = () => {}
  } catch {}
}

const finalizarFlujoAprobado = async (transaccionId: string) => {
  try {
    let tx = await transaccionesService.completarTransaccion(transaccionId)
    if (!tx || tx.estado !== 'COMPLETADA') {
      tx = await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(transaccionId)
      if (!tx || tx.estado !== 'COMPLETADA') {
        throw new Error('El pago no está aprobado aún')
      }
    }
    const reservaId = tx?.reserva?.id || localStorage.getItem('ultimoPago_reservaId') || ''
    try {
      sessionStorage.setItem('paymentSuccess', JSON.stringify({
        transaccionId,
        reservaId,
        monto: tx?.monto,
        metodo: tx?.metodoPago,
        fecha: tx?.fechaCompletado || new Date().toISOString()
      }))
      localStorage.setItem('reserva_actualizada_event', JSON.stringify({
        reservaId,
        nuevoEstado: 'EN_CURSO',
        accion: 'pago-aprobado',
        at: Date.now()
      }))
      try {
        const bc = new BroadcastChannel('resolvelo-events')
        bc.postMessage({ tipo: 'reserva-actualizada', reservaId, nuevoEstado: 'EN_CURSO', accion: 'pago-aprobado' })
        bc.close()
      } catch {}
    } catch {}
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
    monitoreandoPago.value = false
    router.replace({ path: '/pago-exitoso', query: { external_reference: transaccionId, status: 'approved' } })
  } catch (e: any) {
    console.warn('finalizarFlujoAprobado error:', e)
    router.replace({ path: '/pago-exitoso', query: { external_reference: transaccionId } })
  }
}
</script>