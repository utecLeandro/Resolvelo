<template>
  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-6 overflow-x-hidden">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Liquidaciones</h1>
        <p class="text-sm text-gray-600">Gestiona los pagos a propietarios y revisa el historial.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="cargarLiquidaciones"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-16 0m16 8a8 8 0 01-16 0" />
          </svg>
          Refrescar
        </button>
      </div>
    </div>

    <!-- Pestañas -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          @click="cambiarPestana('pendientes')"
          :class="[
            pestanaActiva === 'pendientes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Pendientes
        </button>
        <button
          @click="cambiarPestana('historial')"
          :class="[
            pestanaActiva === 'historial'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Historial de Pagos
        </button>
      </nav>
    </div>

    <!-- Mensajes de Estado -->
    <div v-if="cargando" class="flex items-center gap-2 text-gray-700 mb-4">
      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16 8 8 0 010-16z"></path>
      </svg>
      Cargando liquidaciones...
    </div>

    <div v-if="errorMensaje" class="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
      <div class="flex justify-between items-start">
        <div>
          <strong class="font-semibold">Error:</strong> {{ errorMensaje }}
        </div>
      </div>
    </div>

    <div v-if="exitoMensaje" class="mb-4 rounded-md bg-green-50 border border-green-200 p-4 text-green-700">
      <div class="flex justify-between items-start">
        <div>
          <strong class="font-semibold">Éxito:</strong> {{ exitoMensaje }}
        </div>
      </div>
    </div>

    <!-- Tabla de Liquidaciones -->
    <div v-if="!cargando && liquidaciones.length === 0" class="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
      <span v-if="pestanaActiva === 'pendientes'">No hay liquidaciones pendientes.</span>
      <span v-else>No hay historial de liquidaciones pagadas.</span>
    </div>

    <div v-else-if="!cargando && liquidaciones.length > 0" class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ pestanaActiva === 'historial' ? 'Fecha Pago' : 'Fecha Creación' }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserva</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datos Bancarios</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th v-if="pestanaActiva === 'pendientes'" scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              <th v-else scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="liq in liquidaciones" :key="liq.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div v-if="pestanaActiva === 'historial'">
                  <div class="font-medium">{{ formatDate(liq.fechaCompletado || liq.fechaCreacion) }}</div>
                  <div class="text-xs text-gray-500">Creada: {{ formatDate(liq.fechaCreacion) }}</div>
                </div>
                <div v-else>
                  {{ formatDate(liq.fechaCreacion) }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="font-medium">#{{ liq.reserva.id }}</div>
                <div class="text-gray-500 truncate max-w-xs" :title="liq.reserva.titulo">
                  {{ liq.reserva.titulo }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="font-medium">{{ liq.propietario.nombre }}</div>
                <div class="text-gray-500 text-xs">{{ liq.propietario.email }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div v-if="liq.propietario.datosBancarios">
                  <div class="font-medium">{{ liq.propietario.datosBancarios.banco }}</div>
                  <div class="text-xs text-gray-500">
                    {{ liq.propietario.datosBancarios.tipoCuenta }} - {{ liq.propietario.datosBancarios.moneda }}
                  </div>
                  <div class="text-xs text-gray-500 font-mono flex items-center gap-1">
                    {{ liq.propietario.datosBancarios.numeroCuenta }}
                    <button 
                      @click="copiarCuenta(liq.propietario.datosBancarios.numeroCuenta)"
                      class="text-blue-600 hover:text-blue-800 focus:outline-none"
                      title="Copiar número de cuenta"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-xs text-gray-500">
                    Titular: {{ liq.propietario.datosBancarios.titular }}
                  </div>
                </div>
                <div v-else class="text-red-500 text-xs italic">
                  Sin datos bancarios
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                $ {{ liq.monto }}
              </td>
              
              <!-- Columna de Acciones (Solo pendientes) -->
              <td v-if="pestanaActiva === 'pendientes'" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="procesarLiquidacion(liq.id)"
                  :disabled="procesandoId === liq.id || !liq.propietario.datosBancarios"
                  :class="[
                    'px-3 py-1 rounded-md text-white text-xs transition-colors',
                    procesandoId === liq.id || !liq.propietario.datosBancarios
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  ]"
                >
                  <span v-if="procesandoId === liq.id">Procesando...</span>
                  <span v-else>Marcar Pagado</span>
                </button>
              </td>

              <!-- Columna de Estado (Solo historial) -->
              <td v-else class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Pagado
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminService } from '../services/api'

interface Liquidacion {
  id: string
  monto: number
  fechaCreacion: string
  fechaCompletado?: string
  estado?: string
  reserva: {
    id: string
    titulo: string
  }
  propietario: {
    id: string
    nombre: string
    email: string
    datosBancarios: {
      banco: string
      tipoCuenta: string
      numeroCuenta: string
      moneda: string
      titular: string
    } | null
  }
}

const pestanaActiva = ref<'pendientes' | 'historial'>('pendientes')
const liquidaciones = ref<Liquidacion[]>([])
const cargando = ref(false)
const errorMensaje = ref('')
const exitoMensaje = ref('')
const procesandoId = ref<string | null>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const cambiarPestana = (pestana: 'pendientes' | 'historial') => {
  pestanaActiva.value = pestana
  cargarLiquidaciones()
}

const cargarLiquidaciones = async () => {
  cargando.value = true
  errorMensaje.value = ''
  exitoMensaje.value = ''
  liquidaciones.value = []
  
  try {
    if (pestanaActiva.value === 'pendientes') {
      liquidaciones.value = await adminService.obtenerLiquidacionesPendientes()
    } else {
      liquidaciones.value = await adminService.obtenerHistorialLiquidaciones()
    }
  } catch (error: any) {
    console.error('Error cargando liquidaciones:', error)
    errorMensaje.value = error.message || 'Error al cargar las liquidaciones.'
  } finally {
    cargando.value = false
  }
}

const procesarLiquidacion = async (id: string) => {
  if (!confirm('¿Confirmas que has realizado el pago de esta liquidación?')) return

  procesandoId.value = id
  errorMensaje.value = ''
  exitoMensaje.value = ''
  
  try {
    await adminService.procesarLiquidacion(id)
    exitoMensaje.value = 'Liquidación procesada correctamente.'
    // Recargar la lista
    await cargarLiquidaciones()
  } catch (error: any) {
    console.error('Error procesando liquidación:', error)
    errorMensaje.value = error.message || 'Error al procesar la liquidación.'
  } finally {
    procesandoId.value = null
  }
}

const copiarCuenta = async (texto: string) => {
  try {
    await navigator.clipboard.writeText(texto)
    // Mostrar feedback temporal
    const prevMsg = exitoMensaje.value
    exitoMensaje.value = 'Número de cuenta copiado al portapapeles'
    setTimeout(() => {
      exitoMensaje.value = prevMsg
    }, 2000)
  } catch (err) {
    console.error('Error al copiar: ', err)
  }
}

onMounted(() => {
  cargarLiquidaciones()
})
</script>
