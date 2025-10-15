<script setup lang="ts">
// Vista de Inicio de sesión (Login)
// - Accesibilidad: etiquetas asociadas, aria-live para errores, foco claro
// - Seguridad: evita exponer credenciales, usa autocomplete apropiado
// - UX: estados de carga, validaciones inmediatas, toggle de visibilidad de contraseña
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'
import { Switch } from '@headlessui/vue'

const router = useRouter()

// Estado del formulario
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const isLoading = ref(false)
const formError = ref('')
const successMessage = ref('')
const fieldErrors = ref<{ email?: string; password?: string }>({})

// Validaciones básicas (WCAG-friendly: mensajes claros y cercanos al control)
const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
const isValidPassword = (val: string) => val.length >= 6
const canSubmit = computed(() => isValidEmail(email.value) && isValidPassword(password.value) && !isLoading.value)

const validateFields = () => {
  fieldErrors.value = {}
  if (!isValidEmail(email.value)) {
    fieldErrors.value.email = 'Ingresa un email válido.'
  }
  if (!isValidPassword(password.value)) {
    fieldErrors.value.password = 'La contraseña debe tener al menos 6 caracteres.'
  }
}

// Envío del formulario de login
const onSubmit = async () => {
  validateFields()
  if (fieldErrors.value.email || fieldErrors.value.password) return

  isLoading.value = true
  formError.value = ''
  successMessage.value = ''
  try {
    const response = await authService.login({ email: email.value, password: password.value })
    // Guardar el token de manera segura
    localStorage.setItem('access_token', response.access_token)
    
    // Guardar información del usuario
    if (response.user) {
      localStorage.setItem('userData', JSON.stringify(response.user))
    }

    // Flujo de verificación pendiente
    if (response.user?.estadoVerificacion === 'PENDIENTE') {
      router.push({ path: '/verificacion-pendiente', query: { email: response.user.email } })
      return
    }
    
    // Feedback temporal: mostrar confirmación de login exitoso
    successMessage.value = 'Inicio de sesión exitoso.'
    
    // Actualizar el estado de autenticación en la aplicación
    if ((window as any).actualizarEstadoAutenticacion) {
      (window as any).actualizarEstadoAutenticacion()
    }
    
    // Redirigir a la página anterior o al catálogo por defecto
    const rutaRedireccion = authService.obtenerRutaRedireccion()
    router.push(rutaRedireccion)
  } catch (err: any) {
    if (err?.response?.status === 401) {
      formError.value = 'Credenciales incorrectas. Verifica tu email y contraseña.'
    } else if (err?.response?.status === 404) {
      formError.value = 'Usuario no encontrado. ¿Ya tienes una cuenta?'
    } else if (err?.response?.status === 503) {
      formError.value = 'Servicio no disponible. La base de datos no está conectada. Intenta nuevamente en unos segundos.'
    } else {
      formError.value = 'Error al iniciar sesión. Intenta nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}

// Foco y ayuda: acción opcional para probar salud del backend
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
  <!-- Fondo en degradé ocupa todo el viewport -->
  <div class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
    <!-- Card de login: el logo ahora proviene de la barra de navegación del layout principal -->
    <div class="w-full max-w-lg md:max-w-xl mx-auto bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Bienvenido</h1>
      <p class="text-gray-600 mb-6">Inicia sesión para continuar</p>

      <form @submit.prevent="onSubmit" class="space-y-4" aria-describedby="form-error" :aria-busy="isLoading">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-800">Correo electrónico</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            required
            inputmode="email"
            autocomplete="email"
            placeholder="tucorreo@ejemplo.com"
            :aria-invalid="!!fieldErrors.email"
            :aria-describedby="fieldErrors.email ? 'email-error' : undefined"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            @blur="validateFields"
          />
          <p v-if="fieldErrors.email" id="email-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.email }}</p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-800">Contraseña</label>
          <div class="mt-1 relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              autocomplete="current-password"
              placeholder="Tu contraseña"
              :aria-invalid="!!fieldErrors.password"
              :aria-describedby="fieldErrors.password ? 'password-error' : undefined"
              class="w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 pr-20 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @blur="validateFields"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 my-auto text-sm text-gray-600 hover:text-gray-800"
              aria-label="Mostrar u ocultar contraseña"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <p v-if="fieldErrors.password" id="password-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.password }}</p>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Switch v-model="rememberMe" as="button" class="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="rememberMe ? 'bg-blue-600' : 'bg-gray-200'" aria-label="Recordarme">
              <span class="inline-block h-5 w-5 transform rounded-full bg-white transition" :class="rememberMe ? 'translate-x-5' : 'translate-x-1'" />
            </Switch>
            <span class="text-sm text-gray-700">Recordarme</span>
          </div>
          <router-link to="/registro" class="text-sm text-blue-600 hover:text-blue-700">Crear cuenta</router-link>
        </div>

        <button
          type="submit"
          class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit"
        >
          {{ isLoading ? 'Ingresando…' : 'Iniciar sesión' }}
        </button>

        <p v-if="formError" id="form-error" class="text-red-600 text-sm" aria-live="polite">{{ formError }}</p>
        <p v-if="successMessage" class="text-green-600 text-sm" aria-live="polite">{{ successMessage }}</p>

        <div class="mt-6 pt-6 border-t border-gray-200">
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
/* Nota de UX: se usan estilos de Tailwind (inspirados en shadcn/ui) para consistencia visual */
</style>