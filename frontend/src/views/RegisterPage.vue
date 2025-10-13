<script setup lang="ts">
// Componente de Registro.
// - Valida datos mínimos.
// - Mock de verificación externa (OK) y creación de usuario.
// - Comentarios en español siguiendo buenas prácticas.
import { ref } from 'vue'

// Estado del formulario
const nombre = ref('')
const apellido = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const telefono = ref('')
const documentoIdentidad = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validación simple de contraseña
const passwordsMatch = () => password.value && password.value === confirmPassword.value

// Manejo del envío del formulario
const onSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validaciones básicas
  if (!nombre.value || !apellido.value || !email.value || !password.value || !confirmPassword.value || !documentoIdentidad.value) {
    errorMessage.value = 'Completa todos los campos obligatorios.'
    return
  }
  if (!passwordsMatch()) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    isLoading.value = true
    
    // Llamada real al backend
    const { authService } = await import('../services/api')
    const response = await authService.registro({
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      telefono: telefono.value || undefined,
      documentoIdentidad: documentoIdentidad.value,
    })
    
    // Guardar token si el backend lo devuelve
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token)
    }
    
    successMessage.value = `¡Registro exitoso! Bienvenido ${response.user.nombre}. Tu cuenta está en estado: ${response.user.estadoVerificacion}.`
  } catch (err: any) {
    console.error('Error en registro:', err)
    if (err.response?.data?.message) {
      errorMessage.value = Array.isArray(err.response.data.message) 
        ? err.response.data.message.join(', ')
        : err.response.data.message
    } else {
      errorMessage.value = 'Ocurrió un error al registrar. Intenta nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Función para registro rápido con datos de prueba
const registroRapido = () => {
  const timestamp = Date.now()
  nombre.value = 'Juan'
  apellido.value = 'Pérez'
  email.value = `juan.perez.${timestamp}@test.com`
  documentoIdentidad.value = '1.234.567-8'
  telefono.value = '099123456'
  password.value = 'Password123!'
  confirmPassword.value = 'Password123!'
  
  alert('✅ Datos de prueba cargados. Ahora puedes hacer clic en "Crear cuenta"')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Crea tu cuenta</h1>
      <p class="text-gray-600 mb-6">Regístrate para comenzar</p>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              id="nombre"
              v-model="nombre"
              type="text"
              required
              placeholder="Tu nombre"
              class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label for="apellido" class="block text-sm font-medium text-gray-700">Apellido *</label>
            <input
              id="apellido"
              v-model="apellido"
              type="text"
              required
              placeholder="Tu apellido"
              class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico *</label>
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
          <label for="documentoIdentidad" class="block text-sm font-medium text-gray-700">Documento de identidad *</label>
          <input
            id="documentoIdentidad"
            v-model="documentoIdentidad"
            type="text"
            required
            placeholder="Cédula de identidad"
            class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
          <input
            id="telefono"
            v-model="telefono"
            type="tel"
            placeholder="Tu número de teléfono"
            class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Contraseña *</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Mínimo 8 caracteres"
            class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar contraseña *</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Repite tu contraseña"
            class="mt-1 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Creando cuenta...' : 'Registrarme' }}
        </button>

        <p class="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-indigo-600 hover:text-indigo-700">Inicia sesión</router-link>
        </p>

        <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-green-600 text-sm">{{ successMessage }}</p>
        
        <!-- Botón de registro rápido para pruebas -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button
            @click="registroRapido"
            type="button"
            class="w-full text-sm text-gray-600 hover:text-gray-800 underline"
          >
            🚀 Registro rápido (datos de prueba)
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales mínimos, el resto vendrá de Tailwind */
</style>