<template>
  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-6 overflow-x-hidden">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ingresos</h1>
        <p class="text-sm text-gray-600">Analiza las ganancias generadas por las reservas completadas.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="cargarIngresos"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-16 0m16 8a8 8 0 01-16 0" />
          </svg>
          Refrescar
        </button>
      </div>
    </div>

    <!-- Resumen Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Ganancia Total</p>
            <p class="text-2xl font-semibold text-gray-900">$ {{ totalGanancias.toFixed(2) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Reservas Completadas</p>
            <p class="text-2xl font-semibold text-gray-900">{{ ingresos.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensajes de Estado -->
    <div v-if="cargando" class="flex items-center gap-2 text-gray-700 mb-4">
      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16 8 8 0 010-16z"></path>
      </svg>
      Cargando ingresos...
    </div>

    <div v-if="errorMensaje" class="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
      <div class="flex justify-between items-start">
        <div>
          <strong class="font-semibold">Error:</strong> {{ errorMensaje }}
        </div>
      </div>
    </div>

    <!-- Tabla de Ingresos -->
    <div v-if="!cargando && ingresos.length === 0" class="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
      <span>No hay ingresos registrados aún.</span>
    </div>

    <div v-else-if="!cargando && ingresos.length > 0" class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserva / Publicación</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Involucrados</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50 text-green-700">Comisión (10%)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ingreso in ingresos" :key="ingreso.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(ingreso.fecha) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="font-medium">#{{ ingreso.id }}</div>
                <div class="text-gray-500 truncate max-w-xs" :title="ingreso.publicacion">
                  {{ ingreso.publicacion }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div><span class="text-xs text-gray-500">Propietario:</span> {{ ingreso.propietario }}</div>
                <div><span class="text-xs text-gray-500">Cliente:</span> {{ ingreso.arrendatario }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                $ {{ Number(ingreso.montoTotal).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 bg-green-50">
                $ {{ Number(ingreso.comision).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { adminService } from '../services/api'

interface Ingreso {
  id: string
  fecha: string
  publicacion: string
  propietario: string
  arrendatario: string
  montoTotal: number
  comision: number
}

const ingresos = ref<Ingreso[]>([])
const cargando = ref(false)
const errorMensaje = ref('')

const totalGanancias = computed(() => {
  return ingresos.value.reduce((total, ingreso) => total + Number(ingreso.comision), 0)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const cargarIngresos = async () => {
  cargando.value = true
  errorMensaje.value = ''
  ingresos.value = []
  
  try {
    ingresos.value = await adminService.obtenerIngresos()
  } catch (error: any) {
    console.error('Error cargando ingresos:', error)
    errorMensaje.value = error.message || 'Error al cargar los ingresos.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarIngresos()
})
</script>
