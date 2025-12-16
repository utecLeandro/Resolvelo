<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Liquidaciones Pendientes</h1>
          <p class="mt-1 text-sm text-gray-500">Gestiona los pagos pendientes a los propietarios.</p>
        </div>
        <router-link
          to="/admin"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="mr-2">←</span> Volver al Dashboard
        </router-link>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-500">Cargando liquidaciones...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="liquidaciones.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay liquidaciones pendientes</h3>
        <p class="mt-1 text-sm text-gray-500">Todas las transacciones están al día.</p>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Propietario
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reserva / Publicación
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Monto a Pagar
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="liquidacion in liquidaciones" :key="liquidacion.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(liquidacion.fechaCreacion) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ liquidacion.usuario?.nombre }} {{ liquidacion.usuario?.apellido }}
                          </div>
                          <div class="text-sm text-gray-500">{{ liquidacion.usuario?.email }}</div>
                          <div class="text-sm text-gray-500">{{ liquidacion.usuario?.telefono }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">Reserva #{{ liquidacion.reservaId }}</div>
                      <div class="text-sm text-gray-500">
                        {{ liquidacion.reserva?.publicacion?.titulo || 'Publicación eliminada' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-bold text-green-600">
                        {{ formatCurrency(liquidacion.monto) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        Comisión: {{ formatCurrency(liquidacion.comisionPlataforma + liquidacion.comisionPasarela) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        @click="abrirModalPago(liquidacion)"
                        class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Registrar Pago
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Confirmación de Pago -->
    <div
      v-if="showModal"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="cerrarModal"
        ></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  class="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Confirmar Pago a Propietario
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 mb-4">
                    Estás a punto de registrar el pago manual para la liquidación de la reserva
                    <strong>#{{ selectedLiquidacion?.reservaId }}</strong>.
                  </p>
                  
                  <div class="bg-gray-50 p-3 rounded mb-4">
                    <p class="text-sm font-medium text-gray-700">Monto a transferir:</p>
                    <p class="text-xl font-bold text-green-600">{{ formatCurrency(selectedLiquidacion?.monto || 0) }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      Propietario: {{ selectedLiquidacion?.usuario?.nombre }} {{ selectedLiquidacion?.usuario?.apellido }}
                    </p>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label for="referencia" class="block text-sm font-medium text-gray-700">
                        Referencia de Pago (Comprobante) *
                      </label>
                      <input
                        type="text"
                        id="referencia"
                        v-model="form.referenciaPago"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Ej: Transferencia #12345678"
                      />
                    </div>
                    <div>
                      <label for="notas" class="block text-sm font-medium text-gray-700">
                        Notas Internas (Opcional)
                      </label>
                      <textarea
                        id="notas"
                        v-model="form.notas"
                        rows="3"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Detalles adicionales..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              :disabled="procesandoPago || !form.referenciaPago"
              :class="{ 'opacity-50 cursor-not-allowed': procesandoPago || !form.referenciaPago }"
              @click="confirmarPago"
            >
              {{ procesandoPago ? 'Procesando...' : 'Confirmar Pago' }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="cerrarModal"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Toast Notification -->
    <div
      v-if="toastVisible"
      class="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 transition-all duration-300 transform translate-y-0"
      :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'"
      role="alert"
    >
      <span v-if="toastType === 'success'">✅</span>
      <span v-else>⚠️</span>
      <span class="font-medium">{{ toastMessage }}</span>
      <button @click="toastVisible = false" class="ml-2 text-white/80 hover:text-white">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import adminService from '../services/admin'

const loading = ref(true)
const liquidaciones = ref<any[]>([])
const showModal = ref(false)
const selectedLiquidacion = ref<any>(null)
const procesandoPago = ref(false)

// Toast state
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const mostrarToast = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
  toastMessage.value = mensaje
  toastType.value = tipo
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 4000)
}

const form = ref({
  referenciaPago: '',
  notas: ''
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const cargarLiquidaciones = async () => {
  loading.value = true
  try {
    liquidaciones.value = await adminService.obtenerLiquidacionesPendientes()
  } catch (error) {
    console.error('Error cargando liquidaciones:', error)
    mostrarToast('Error al cargar las liquidaciones pendientes', 'error')
  } finally {
    loading.value = false
  }
}

const abrirModalPago = (liquidacion: any) => {
  selectedLiquidacion.value = liquidacion
  form.value.referenciaPago = ''
  form.value.notas = ''
  showModal.value = true
}

const cerrarModal = () => {
  showModal.value = false
  selectedLiquidacion.value = null
}

const confirmarPago = async () => {
  if (!selectedLiquidacion.value || !form.value.referenciaPago) return

  procesandoPago.value = true
  try {
    await adminService.completarLiquidacion(
      selectedLiquidacion.value.id,
      form.value.referenciaPago,
      form.value.notas
    )
    
    // Éxito: recargar lista y cerrar modal
    await cargarLiquidaciones()
    cerrarModal()
    mostrarToast('Pago registrado correctamente', 'success')
  } catch (error) {
    console.error('Error completando liquidación:', error)
    mostrarToast('Ocurrió un error al registrar el pago', 'error')
  } finally {
    procesandoPago.value = false
  }
}

onMounted(() => {
  cargarLiquidaciones()
})
</script>