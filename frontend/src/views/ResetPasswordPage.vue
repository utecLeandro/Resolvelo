<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/api'

const route = useRoute()
const router = useRouter()

const email = ref<string>('')
const token = ref<string>('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const message = ref('')

onMounted(() => {
  token.value = (route.query.token as string) || ''
  email.value = (route.query.email as string) || ''
})

const passwordsMatch = computed(() => newPassword.value && newPassword.value === confirmPassword.value)
const isValidPassword = (val: string) => val.length >= 6

const onSubmit = async () => {
  error.value = ''
  message.value = ''
  if (!email.value || !token.value) {
    error.value = 'Falta el email o el token de recuperación.'
    return
  }
  if (!isValidPassword(newPassword.value)) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (!passwordsMatch.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  isLoading.value = true
  try {
    const res = await authService.resetPassword(email.value, token.value, newPassword.value)
    message.value = res.message || 'Contraseña actualizada correctamente.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'No se pudo restablecer la contraseña.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-lg bg-white shadow rounded-2xl border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Restablecer contraseña</h1>
      <p class="text-gray-600 mb-6">Ingresa tu nueva contraseña para la cuenta {{ email || '(email no provisto)' }}.</p>

      <form @submit.prevent="onSubmit" class="space-y-4" aria-describedby="form-error" :aria-busy="isLoading">
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-800">Nueva contraseña</label>
          <input
            id="newPassword"
            v-model="newPassword"
            :type="'password'"
            required
            autocomplete="new-password"
            placeholder="Nueva contraseña"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="newPassword && !isValidPassword(newPassword)" class="mt-1 text-sm text-red-600">La contraseña debe tener al menos 6 caracteres.</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-800">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="'password'"
            required
            autocomplete="new-password"
            placeholder="Confirmar nueva contraseña"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="confirmPassword && !passwordsMatch" class="mt-1 text-sm text-red-600">Las contraseñas no coinciden.</p>
        </div>

        <button
          type="submit"
          class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !isValidPassword(newPassword) || !passwordsMatch"
        >
          {{ isLoading ? 'Actualizando…' : 'Actualizar contraseña' }}
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