<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Test API Debug</h1>
    
    <button 
      @click="testApi" 
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4 mr-2"
    >
      Test API Service
    </button>
    
    <button 
      @click="testDirectAxios" 
      class="bg-green-500 text-white px-4 py-2 rounded mb-4 mr-2"
    >
      Test Direct Axios
    </button>
    
    <button 
      @click="testApiInstance" 
      class="bg-purple-500 text-white px-4 py-2 rounded mb-4"
    >
      Test API Instance
    </button>
    
    <div v-if="loading" class="text-blue-600">
      Cargando...
    </div>
    
    <div v-if="result" class="bg-gray-100 p-4 rounded">
      <h3 class="font-bold mb-2">Resultado:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="error" class="bg-red-100 p-4 rounded text-red-700">
      <h3 class="font-bold mb-2">Error:</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reservasService } from '@/services/api'
import axios from 'axios'
import api from '@/services/api'

const loading = ref(false)
const result = ref(null)
const error = ref('')

const testApi = async () => {
  loading.value = true
  result.value = null
  error.value = ''
  
  try {
    console.log('🚀 Iniciando test API Service...')
    
    // Verificar token
    const token = localStorage.getItem('access_token')
    console.log('🔑 Token presente:', !!token)
    console.log('🔑 Token completo:', token)
    console.log('🔑 Longitud del token:', token?.length)
    
    if (!token) {
      throw new Error('No hay token de autenticación')
    }
    
    // Llamar API
    const reservaId = 'cmh05wkgs0005umr85c4qfjom'
    console.log('📞 Llamando API Service con ID:', reservaId)
    
    const respuesta = await reservasService.obtenerReservaPorId(reservaId)
    
    console.log('📦 Respuesta API Service:', respuesta)
    console.log('🔍 Tipo:', typeof respuesta)
    console.log('🔍 Keys:', Object.keys(respuesta || {}))
    console.log('✅ success:', respuesta?.success)
    console.log('📄 data:', respuesta?.data)
    console.log('🕐 timestamp:', respuesta?.timestamp)
    
    result.value = { source: 'API Service', data: respuesta }
    
  } catch (err: any) {
    console.error('❌ Error API Service:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}

const testDirectAxios = async () => {
  loading.value = true
  result.value = null
  error.value = ''
  
  try {
    const token = localStorage.getItem('access_token')
    const reservaId = 'cmh05wkgs0005umr85c4qfjom'
    console.log('🔑 Token encontrado:', !!token)
    console.log('🆔 ID de reserva:', reservaId)
    
    const response = await axios.get(`/api/usuarios/reservas/${reservaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('📡 Respuesta completa de Direct Axios:', response)
    console.log('📊 Datos de respuesta:', response.data)
    console.log('🔍 Tipo de datos:', typeof response.data)
    console.log('📋 Es array:', Array.isArray(response.data))
    console.log('🔑 Claves:', Object.keys(response.data))
    
    result.value = {
      status: response.status,
      data: response.data,
      headers: response.headers,
      fullResponse: response
    }
    
  } catch (err: any) {
    console.error('❌ Error en Direct Axios:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}

const testApiInstance = async () => {
  loading.value = true
  result.value = null
  error.value = ''
  
  try {
    const token = localStorage.getItem('access_token')
    const reservaId = 'cmh05wkgs0005umr85c4qfjom'
    console.log('🔑 Token encontrado:', !!token)
    console.log('🆔 ID de reserva:', reservaId)
    
    const response = await api.get(`/usuarios/reservas/${reservaId}`)
    
    console.log('📡 Respuesta completa de API Instance:', response)
    console.log('📊 Datos de respuesta:', response.data)
    console.log('🔍 Tipo de datos:', typeof response.data)
    console.log('📋 Es array:', Array.isArray(response.data))
    console.log('🔑 Claves:', Object.keys(response.data))
    
    result.value = {
      status: response.status,
      data: response.data,
      headers: response.headers,
      fullResponse: response
    }
    
  } catch (err: any) {
    console.error('❌ Error en API Instance:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}
</script>