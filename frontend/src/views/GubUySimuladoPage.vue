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
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const normalizeCi = (val: string) => String(val || '').replace(/\D+/g, '')
const formatearCIMask = (val: string) => {
  const d = normalizeCi(val).slice(0, 8)
  const s1 = d.slice(0, 1)
  const s2 = d.slice(1, 4)
  const s3 = d.slice(4, 7)
  const s4 = d.slice(7, 8)
  let out = s1
  if (s2) out += '.' + s2
  if (s3) out += '.' + s3
  if (s4) out += '-' + s4
  return out
}
const aplicarMascaraCI = (ev: Event) => {
  const input = ev.target as HTMLInputElement
  const masked = formatearCIMask(input.value)
  documentoIdentidad.value = masked
}
const isValidCi = (val: string) => {
  const digits = normalizeCi(val)
  if (!/^\d{8}$/.test(digits)) return false
  const base = digits
    .slice(0, 7)
    .split('')
    .map((d) => parseInt(d, 10)) as [number, number, number, number, number, number, number]
  const check = Number(digits.charAt(7))
  const [d1, d2, d3, d4, d5, d6, d7] = base
  const sum = d1*2 + d2*9 + d3*8 + d4*7 + d5*6 + d6*3 + d7*4
  const dv = (10 - (sum % 10)) % 10
  return dv === check
}
const canSubmit = computed(() => {
  return nombre.value.trim().length > 0 &&
    apellido.value.trim().length > 0 &&
    isValidCi(documentoIdentidad.value) &&
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
      documentoIdentidad: normalizeCi(documentoIdentidad.value),
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
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Login gub.uy</h1>
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
          <input v-model.trim="documentoIdentidad" type="text" inputmode="numeric" maxlength="13" @input="aplicarMascaraCI" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-800">Correo electrónico</label>
          <input v-model.trim="email" type="email" class="mt-1 w-full h-12 rounded-xl border border-gray-300 px-4" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-800">Contraseña</label>
          <div class="mt-1 relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full h-12 rounded-xl border border-gray-300 px-4 pr-20"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 my-auto text-sm text-gray-600 hover:text-gray-800"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <button type="submit" class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white" :disabled="!canSubmit">
          {{ isLoading ? 'Validando…' : 'Validar y entrar' }}
        </button>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
