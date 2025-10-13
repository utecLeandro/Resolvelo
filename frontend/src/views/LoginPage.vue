<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'

const router = useRouter()

// Estado del formulario
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

// Función de login integrada con el backend
const onSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Llamada real al backend
    const response = await authService.login({
      email: email.value,
      password: password.value
    })
    
    // Guardar el token en localStorage
    localStorage.setItem('access_token', response.access_token)
    
    console.log('Login exitoso:', response)
    
    // Redirigir al dashboard o página principal
    // router.push('/dashboard')
    alert('¡Login exitoso! Token guardado en localStorage')
    
  } catch (err: any) {
    console.error('Error en login:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Credenciales incorrectas. Verifica tu email y contraseña.'
    } else if (err.response?.status === 404) {
      error.value = 'Usuario no encontrado. ¿Ya tienes una cuenta?'
    } else {
      error.value = 'Error al iniciar sesión. Intenta nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Función para probar la conexión con el backend
const probarConexion = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    alert(`✅ Conexión exitosa: ${JSON.stringify(data)}`)
  } catch (err) {
    alert(`❌ Error de conexión: ${err}`)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Bienvenido a ReSolVelo</h1>
      <p class="text-gray-600 mb-6">Inicia sesión para continuar</p>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Tu contraseña"
            class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>

        <p class="text-center text-sm text-gray-600">
          ¿No tienes cuenta?
          <router-link to="/registro" class="text-indigo-600 hover:text-indigo-700">Regístrate</router-link>
        </p>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        
        <!-- Botón de prueba de conexión -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button
            @click="probarConexion"
            type="button"
            class="w-full text-sm text-gray-600 hover:text-gray-800 underline"
          >
            🔧 Probar conexión con backend
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales mínimos, el resto vendrá de Tailwind */
</style>