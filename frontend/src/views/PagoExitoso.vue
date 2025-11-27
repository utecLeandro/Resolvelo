<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-green-50 border border-green-200 rounded-md p-6">
        <div class="flex items-start">
          <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h1 class="text-2xl font-bold text-green-800">¡Pago Exitoso!</h1>
            <p class="mt-1 text-sm text-green-700">Tu pago fue aprobado. Aquí tienes el detalle.</p>
          </div>
        </div>
      </div>
      <div v-if="cargando" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Cargando detalles de la transacción...</span>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mt-6">
        <h2 class="text-lg font-semibold text-red-800">No se pudo cargar la transacción</h2>
        <p class="text-sm text-red-700 mt-1">{{ error }}</p>
      </div>

      <div v-else-if="transaccion" class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Resumen de la Reserva</h2>
          <div class="space-y-3 text-sm">
            <div>
              <h3 class="font-medium text-gray-900">{{ transaccion.reserva?.publicacion?.titulo }}</h3>
              
            </div>
            <hr class="my-2">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">Fecha de inicio:</p>
                <p class="text-gray-900 font-semibold">{{ formatearFecha(transaccion.reserva?.fechaInicio) }}</p>
              </div>
              <div>
                <p class="text-gray-600">Fecha de fin:</p>
                <p class="text-gray-900 font-semibold">{{ formatearFecha(transaccion.reserva?.fechaFin) }}</p>
              </div>
            </div>
            <div>
              <p class="text-gray-600">Duración:</p>
              <p class="text-gray-900 font-semibold">{{ calcularDias(transaccion.reserva?.fechaInicio || '', transaccion.reserva?.fechaFin || '') }} día(s)</p>
            </div>
            <hr class="my-2">
            <div class="grid grid-cols-2 gap-4 items-center">
              <div>
                <p class="text-gray-600">Precio por día:</p>
                <p class="text-gray-900">${{ transaccion.reserva?.publicacion?.precioPorDia }}</p>
              </div>
              <div class="text-right">
                <p class="text-gray-900 font-bold">Total:</p>
                <p class="text-blue-600 font-extrabold text-lg">${{ calcularTotal(transaccion) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Datos del Pago</h2>
          <div class="space-y-2 text-sm text-gray-700">
            <p><strong>ID de Transacción:</strong> {{ transaccion.id }}</p>
            <p><strong>Estado:</strong> {{ transaccion.estado }}</p>
            <p><strong>Monto:</strong> ${{ transaccion.monto }}</p>
            <p><strong>Método:</strong> {{ transaccion.metodoPago }}</p>
            <p><strong>Referencia Externa:</strong> {{ transaccion.referenciaExterna }}</p>
          </div>

          <div v-if="mpPago" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <p v-if="mpPago.id"><strong>ID MP:</strong> {{ mpPago.id }}</p>
            <p v-if="mpPago.status"><strong>Estado MP:</strong> {{ mpPago.status }}</p>
            <p v-if="mpPago.date"><strong>Fecha aprobación:</strong> {{ formatearFecha(mpPago.date) }}</p>
            <p v-if="mpPago.amount"><strong>Monto pagado:</strong> ${{ mpPago.amount }}</p>
            <p v-if="mpPago.method"><strong>Método:</strong> {{ mpPago.method }}</p>
            <p v-if="mpPago.installments"><strong>Cuotas:</strong> {{ mpPago.installments }}</p>
            <p v-if="mpPago.card_last4"><strong>Tarjeta:</strong> •••• {{ mpPago.card_last4 }}</p>
            <p v-if="mpPago.cardholder"><strong>Titular:</strong> {{ mpPago.cardholder }}</p>
            <p v-if="mpPago.payer_email"><strong>Email:</strong> {{ mpPago.payer_email }}</p>
            <p v-if="mpPago.issuer_id"><strong>Banco emisor (issuer):</strong> {{ mpPago.issuer_id }}</p>
            <p v-if="mpPago.external_reference"><strong>Ref. externa:</strong> {{ mpPago.external_reference }}</p>
          </div>

          <div class="mt-6 flex gap-3">
            <router-link to="/catalogo" class="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">Volver al inicio</router-link>
            <router-link to="/mis-reservas" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Ver mis reservas</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { transaccionesService, type Transaccion } from '@/services/transacciones.service'

const route = useRoute()
const cargando = ref(true)
const error = ref('')
const transaccion = ref<Transaccion | null>(null)
const mpPago = ref<{ id?: string; status?: string; amount?: number; date?: string; description?: string; external_reference?: string; method?: string; installments?: number; card_last4?: string; cardholder?: string; payer_email?: string; issuer_id?: string } | null>(null)
let verificarTimer: number | null = null
let intentosVerificar = 0

const formatearFecha = (fecha?: string) => fecha ? new Date(fecha).toLocaleDateString('es-UY', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const calcularDias = (inicioStr: string, finStr: string) => {
  const inicio = new Date(inicioStr)
  const fin = new Date(finStr)
  const diff = fin.getTime() - inicio.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
const calcularTotal = (tx: Transaccion) => {
  const dias = calcularDias(tx.reserva!.fechaInicio, tx.reserva!.fechaFin)
  const precio = tx.reserva!.publicacion.precioPorDia
  return dias * precio
}

// Banner fijo como antes

onMounted(async () => {
  try {
    cargando.value = true
    error.value = ''

    // Intentamos obtener external_reference (transaccionId) desde los parámetros de retorno
    const externalRef = (route.query.external_reference as string) || ''
    const paymentId = (route.query.payment_id as string) || (route.query.collection_id as string) || ''
    const statusParam = ((route.query.status as string) || '').toLowerCase()
    const collectionStatus = ((route.query.collection_status as string) || '').toLowerCase()
    const status = (collectionStatus || statusParam)
    const transaccionId = externalRef || ''

    if (!transaccionId) {
      // En algunos flujos, Mercado Pago puede no enviar external_reference; informar al usuario
      // Si tenemos payment_id y status=approved, intentamos confirmar manualmente
      if (paymentId && status === 'approved') {
        const confirmada = await transaccionesService.confirmarPagoMercadoPago(paymentId)
        transaccion.value = confirmada
        // Continuamos al bloque de redirección
      } else {
        throw new Error('No se encontró el identificador de la transacción en el retorno de Mercado Pago')
      }
    }

    if (!transaccion.value) {
      const data = await transaccionesService.obtenerTransaccion(transaccionId)
      // Si aún no está completada pero tenemos payment_id aprobado, confirmamos manualmente
      if (data && data.estado !== 'COMPLETADA' && paymentId && status === 'approved') {
        const confirmada = await transaccionesService.confirmarPagoMercadoPago(paymentId)
        transaccion.value = confirmada
      } else {
        transaccion.value = data
      }
    }

    try {
      const raw = transaccion.value?.notasInternas || ''
      if (raw) {
        const p = JSON.parse(raw)
        const amount = Number(p?.transaction_amount || p?.amount || 0)
        const date = String(p?.date_approved || p?.date_created || p?.last_updated || '')
        const status = String(p?.status || '')
        const idMp = String(p?.id || '')
        const extRef = String(p?.external_reference || '')
        const method = String(p?.payment_method_id || '')
        const installments = Number(p?.installments || 0)
        const card_last4 = String(p?.card?.last_four_digits || '')
        const cardholder = String(p?.card?.cardholder?.name || '')
        const payer_email = String(p?.payer?.email || '')
        const issuer_id = String(p?.issuer_id || '')
        mpPago.value = {
          id: idMp || undefined,
          status: status || undefined,
          amount: amount || undefined,
          date: date || undefined,
          external_reference: extRef || undefined,
          method: method || undefined,
          installments: installments || undefined,
          card_last4: card_last4 || undefined,
          cardholder: cardholder || undefined,
          payer_email: payer_email || undefined,
          issuer_id: issuer_id || undefined,
        }
      }
    } catch {}

    const publicarEventoReserva = () => {
      if (transaccion.value && transaccion.value.estado === "COMPLETADA" && transaccion.value.reserva?.id) {
        const evento = new CustomEvent("reserva-actualizada", {
          detail: {
            reservaId: transaccion.value.reserva.id,
            nuevoEstado: "EN_CURSO",
            accion: "pago-aprobado"
          }
        })
        window.dispatchEvent(evento)
        try {
          const bc = new BroadcastChannel('resolvelo-events')
          bc.postMessage({ tipo: 'reserva-actualizada', reservaId: transaccion.value.reserva.id, nuevoEstado: 'EN_CURSO', accion: 'pago-aprobado' })
          bc.close()
        } catch {}
        try {
          sessionStorage.setItem('paymentSuccess', JSON.stringify({
            transaccionId: transaccion.value.id,
            reservaId: transaccion.value.reserva.id,
            monto: transaccion.value.monto,
            metodo: transaccion.value.metodoPago,
            fecha: transaccion.value.fechaCompletado || new Date().toISOString()
          }))
          localStorage.setItem('reserva_actualizada_event', JSON.stringify({
            reservaId: transaccion.value.reserva.id,
            nuevoEstado: 'EN_CURSO',
            accion: 'pago-aprobado',
            at: Date.now()
          }))
        } catch {}
      }
    }

    publicarEventoReserva()

    if (transaccionId) {
      verificarTimer = window.setInterval(async () => {
        try {
          if (transaccion.value?.estado === 'COMPLETADA' || intentosVerificar > 20) {
            if (verificarTimer) {
              clearInterval(verificarTimer)
              verificarTimer = null
            }
            return
          }
          intentosVerificar++
          const tx = await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(transaccionId)
          transaccion.value = tx
          publicarEventoReserva()
        } catch {}
      }, 2000)
    }
    
  } catch (err: any) {
    console.error('Error al cargar transacción MP:', err)
    error.value = err.response?.data?.message || err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
})

onBeforeUnmount(() => {
  if (verificarTimer) {
    clearInterval(verificarTimer)
    verificarTimer = null
  }
})
</script>

<style scoped>
</style>