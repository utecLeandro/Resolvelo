<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'

const router = useRouter()

const nombre = ref('')
const apellido = ref('')
const documentoIdentidad = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const canSubmit = computed(() => {
  return nombre.value.trim().length > 0 &&
    apellido.value.trim().length > 0 &&
    documentoIdentidad.value.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
    password.value.length >= 6 && !isLoading.value
})

const onSubmit = async () => {
  if (!canSubmit.value) return
  isLoading.value = true
  error.value = ''
  try {
    const res = await authService.loginConGubUySimulado({
      nombre: nombre.value,
      apellido: apellido.value,
      documentoIdentidad: documentoIdentidad.value,
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('access_token', res.access_token)
    if (res.user) localStorage.setItem('userData', JSON.stringify(res.user))
    if ((window as any).actualizarEstadoAutenticacion) {
      (window as any).actualizarEstadoAutenticacion()
    }
    try {
      await authService.verificarToken()
    } catch {}
    try {
      sessionStorage.setItem('mensajePostLogin', 'Usuario validado con éxito')
    } catch {}
    const rutaRedireccion = authService.obtenerRutaRedireccion()
    router.replace(rutaRedireccion)
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 403) {
      error.value = e?.response?.data?.message || 'Tu cuenta debe ser verificada por un administrador antes de acceder'
    } else if (status === 401) {
      error.value = e?.response?.data?.message || 'Credenciales incorrectas'
    } else if (status === 503) {
      error.value = 'Servicio no disponible. Intenta nuevamente.'
    } else {
      error.value = e?.message || 'Autenticación fallida'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-lg mx-auto bg-white shadow rounded-2xl border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Login gub.uy (simulado)</h1>
      <p class="text-gray-600 mb-6">Ingresa tus datos para validar contra tu cuenta existente</p>
      <form @submit.prevent="onSubmit" class="space-y-4" :aria-busy="isLoading">
        <div>
          <label class="block text-sm font-medium text-gray-800">Nombre</label>
          <input v-model.trim="nombre" type="text" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-800">Apellido</label>
          <input v-model.trim="apellido" type="text" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-800">Documento de identidad</label>
          <input v-model.trim="documentoIdentidad" type="text" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-800">Correo electrónico</label>
          <input v-model.trim="email" type="email" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-800">Contraseña</label>
          <input v-model="password" type="password" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <button type="submit" class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white" :disabled="!canSubmit">
          {{ isLoading ? 'Validando…' : 'Validar y entrar' }}
        </button>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>