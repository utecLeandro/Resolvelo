<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-red-50 border border-red-200 rounded-md p-6">
        <div class="flex items-start">
          <svg class="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M4.93 4.93a10.003 10.003 0 0114.14 0 10.003 10.003 0 010 14.14 10.003 10.003 0 01-14.14 0 10.003 10.003 0 010-14.14z" />
          </svg>
          <div>
            <h1 class="text-2xl font-bold text-red-800">Hubo un problema con tu pago</h1>
            <p class="mt-1 text-sm text-red-700">Tu pago fue rechazado o cancelado. Puedes intentar nuevamente.</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-semibold text-gray-900">Detalle</h2>
        <div class="mt-4 space-y-2 text-sm text-gray-700">
          <p><strong>Estado:</strong> {{ estadoPago || 'desconocido' }}</p>
          <p v-if="mensaje"><strong>Mensaje:</strong> {{ mensaje }}</p>
        </div>
        <div class="mt-6">
          <router-link to="/" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
            Volver al inicio
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const estadoPago = ref<string>('')
const mensaje = ref<string>('')
const detalle = ref<string>('')

onMounted(() => {
  const statusParam = (route.query.status as string) || ''
  const collectionStatus = (route.query.collection_status as string) || ''
  estadoPago.value = collectionStatus || statusParam || ''
  mensaje.value = (route.query.message as string) || ''
  detalle.value = (route.query.status_detail as string) || ''
})
</script>

<style scoped>
</style>