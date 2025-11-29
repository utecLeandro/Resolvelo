<script setup lang="ts">
import { ref } from 'vue'
 
import { authService } from '../services/api'

const email = ref('')
const isLoading = ref(false)
const message = ref('')
const error = ref('')

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const onSubmit = async () => {
  error.value = ''
  message.value = ''
  if (!isValidEmail(email.value)) {
    error.value = 'Ingresa un email válido.'
    return
  }
  isLoading.value = true
  try {
    const res = await authService.forgotPassword(email.value)
    message.value = res.message || 'Si el email existe, se enviarán instrucciones para recuperar la contraseña.'
  } catch (e: any) {
    error.value = e?.message || 'No se pudo procesar la solicitud.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-lg bg-white shadow rounded-2xl border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Recuperación de contraseña</h1>
      <p class="text-gray-600 mb-6">Ingresa tu correo para recibir un enlace de restablecimiento.</p>

      <form @submit.prevent="onSubmit" class="space-y-4" aria-describedby="form-error" :aria-busy="isLoading">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-800">Correo electrónico</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            required
            autocomplete="email"
            placeholder="tucorreo@ejemplo.com"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isValidEmail(email) || isLoading"
        >
          {{ isLoading ? 'Enviando…' : 'Enviar instrucciones' }}
        </button>

        <p v-if="error" id="form-error" class="text-red-600 text-sm" aria-live="polite">{{ error }}</p>
        <p v-if="message" class="text-green-600 text-sm" aria-live="polite">{{ message }}</p>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-700">Volver al inicio de sesión</router-link>
        </div>
      </form>
    </div>
  </div>
  
</template>

<style scoped>
</style>