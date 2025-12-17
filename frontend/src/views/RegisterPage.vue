<script setup lang="ts">
// Componente de Registro con enfoque en UX, accesibilidad y seguridad
// - Validaciones claras, requisitos de contraseña (OWASP)
// - Indicador de fortaleza de contraseña
// - Estados de carga y errores accesibles
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'
import { Switch } from '@headlessui/vue'
import BaseModal from '../components/common/BaseModal.vue'

const router = useRouter()

// Estado del formulario
const nombre = ref('')
const apellido = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const telefono = ref('')
const documentoIdentidad = ref('')
const aceptaTerminos = ref(false)
const showTermsModal = ref(false)
const isLoading = ref(false)
const formError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
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
const isValidDocumento = (val: string) => {
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
const passwordStrength = computed(() => {
  const val = password.value
  let score = 0
  if (val.length >= 8) score++
  if (/[a-z]/.test(val)) score++
  if (/[A-Z]/.test(val)) score++
  if (/\d/.test(val)) score++
  if (/[@$!%*?&]/.test(val)) score++
  return score // 0-5
})
const isPasswordValidStrict = computed(() => {
  const val = password.value
  return (
    val.length >= 8 &&
    val.length <= 20 &&
    /[a-z]/.test(val) &&
    /[A-Z]/.test(val) &&
    /\d/.test(val) &&
    /[@$!%*?&]/.test(val)
  )
})
const passwordsMatch = computed(() => password.value && password.value === confirmPassword.value)
const canSubmit = computed(() => {
  return (
    nombre.value &&
    apellido.value &&
    isValidEmail(email.value) &&
    isValidDocumento(documentoIdentidad.value) &&
    isPasswordValidStrict.value &&
    passwordsMatch.value &&
    aceptaTerminos.value &&
    !isLoading.value
  )
})

const validateFields = () => {
  fieldErrors.value = {}
  if (!nombre.value) fieldErrors.value.nombre = 'El nombre es requerido.'
  if (!apellido.value) fieldErrors.value.apellido = 'El apellido es requerido.'
  if (!isValidEmail(email.value)) fieldErrors.value.email = 'Ingresa un email válido.'
  if (!isValidDocumento(documentoIdentidad.value)) fieldErrors.value.documentoIdentidad = 'Formato de documento inválido.'
  if (!isPasswordValidStrict.value) {
    if (password.value.length > 20) {
      fieldErrors.value.password = 'La contraseña no puede tener más de 20 caracteres.'
    } else {
      fieldErrors.value.password = 'La contraseña debe tener entre 8 y 20 caracteres, incluir mayúsculas, minúsculas, números y un caracter especial (@$!%*?&).'
    }
  }
  if (!passwordsMatch.value) fieldErrors.value.confirmPassword = 'Las contraseñas no coinciden.'
  if (!aceptaTerminos.value) fieldErrors.value.aceptaTerminos = 'Debes aceptar los términos y condiciones.'
}

// Envío del formulario
const onSubmit = async () => {
  validateFields()
  if (Object.keys(fieldErrors.value).length > 0) return

  try {
    isLoading.value = true
    formError.value = ''
    const response = await authService.registro({
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      telefono: telefono.value || undefined,
      documentoIdentidad: normalizeCi(documentoIdentidad.value),
    })
    localStorage.setItem('access_token', response.access_token)

    // Redirigir a verificación pendiente
    if (response.user?.estadoVerificacion === 'PENDIENTE') {
      router.push({ path: '/verificacion-pendiente', query: { email: response.user.email } })
      return
    }
  } catch (err: any) {
    if (err?.response?.status === 503) {
      formError.value = 'Servicio no disponible. La base de datos no está conectada. Intenta nuevamente en unos segundos.'
    } else if (err.response?.data?.message) {
      formError.value = Array.isArray(err.response.data.message)
        ? err.response.data.message.join(', ')
        : err.response.data.message
    } else if (err.message) {
      formError.value = err.message
    } else {
      formError.value = 'Ocurrió un error al registrar. Intenta nuevamente.'
    }
  } finally {
    isLoading.value = false
  }
}


</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
    <!-- Card de registro: el logo ahora proviene de la barra de navegación del layout principal -->
    <div class="w-full max-w-xl md:max-w-2xl mx-auto bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Crea tu cuenta</h1>
      <p class="text-gray-600 mb-6">Regístrate para comenzar</p>

      <form @submit.prevent="onSubmit" class="space-y-4" aria-describedby="form-error" :aria-busy="isLoading">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-800">Nombre *</label>
            <input
              id="nombre"
              v-model.trim="nombre"
              type="text"
              required
              autocomplete="given-name"
              placeholder="Tu nombre"
              :aria-invalid="!!fieldErrors.nombre"
              :aria-describedby="fieldErrors.nombre ? 'nombre-error' : undefined"
              class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @blur="validateFields"
            />
            <p v-if="fieldErrors.nombre" id="nombre-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.nombre }}</p>
          </div>
          <div>
            <label for="apellido" class="block text-sm font-medium text-gray-800">Apellido *</label>
            <input
              id="apellido"
              v-model.trim="apellido"
              type="text"
              required
              autocomplete="family-name"
              placeholder="Tu apellido"
              :aria-invalid="!!fieldErrors.apellido"
              :aria-describedby="fieldErrors.apellido ? 'apellido-error' : undefined"
              class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @blur="validateFields"
            />
            <p v-if="fieldErrors.apellido" id="apellido-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.apellido }}</p>
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-800">Correo electrónico *</label>
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
          <label for="documentoIdentidad" class="block text-sm font-medium text-gray-800">Documento de identidad *</label>
          <input
            id="documentoIdentidad"
            v-model.trim="documentoIdentidad"
            type="text"
            required
            placeholder="1.234.567-8"
            inputmode="numeric"
            maxlength="13"
            :aria-invalid="!!fieldErrors.documentoIdentidad"
            :aria-describedby="fieldErrors.documentoIdentidad ? 'doc-error' : undefined"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            @input="aplicarMascaraCI"
            @blur="validateFields"
          />
          <p v-if="fieldErrors.documentoIdentidad" id="doc-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.documentoIdentidad }}</p>
        </div>

        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-800">Teléfono (opcional)</label>
          <input
            id="telefono"
            v-model.trim="telefono"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="Tu número de teléfono"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-800">Contraseña *</label>
          <div class="mt-1 relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Entre 8 y 20 caracteres"
              :aria-invalid="!!fieldErrors.password"
              :aria-describedby="fieldErrors.password ? 'password-error' : 'password-help'"
              class="w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 pr-20 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @input="validateFields"
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
          <p id="password-help" class="mt-1 text-xs text-gray-500">Debe tener entre 8 y 20 caracteres e incluir mayúsculas, minúsculas, números y un caracter especial (@$!%*?&).</p>
          <p v-if="fieldErrors.password" id="password-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.password }}</p>

          <!-- Indicador de fortaleza -->
          <div class="mt-2 h-2 w-full bg-gray-200 rounded">
            <div
              class="h-2 rounded transition-all"
              :class="[
                passwordStrength === 5 ? 'bg-green-600 w-full' :
                passwordStrength === 4 ? 'bg-green-500 w-4/5' :
                passwordStrength === 3 ? 'bg-yellow-500 w-3/5' :
                passwordStrength === 2 ? 'bg-orange-500 w-2/5' :
                passwordStrength > 0 ? 'bg-red-500 w-1/5' : 'bg-transparent w-0'
              ]"
            />
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-800">Confirmar contraseña *</label>
          <div class="mt-1 relative">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Repite tu contraseña"
              :aria-invalid="!!fieldErrors.confirmPassword"
              :aria-describedby="fieldErrors.confirmPassword ? 'confirm-error' : undefined"
              class="w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 pr-20 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @input="validateFields"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 my-auto text-sm text-gray-600 hover:text-gray-800"
              aria-label="Mostrar u ocultar contraseña"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <p v-if="fieldErrors.confirmPassword" id="confirm-error" class="mt-1 text-sm text-red-600">{{ fieldErrors.confirmPassword }}</p>
        </div>

        <div class="flex items-center gap-2">
          <Switch v-model="aceptaTerminos" as="button" class="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="aceptaTerminos ? 'bg-blue-600' : 'bg-gray-200'" aria-label="Aceptar términos y condiciones">
            <span class="inline-block h-5 w-5 transform rounded-full bg-white transition" :class="aceptaTerminos ? 'translate-x-5' : 'translate-x-1'" />
          </Switch>
          <span class="text-sm text-gray-700">
            Acepto los <button type="button" @click="showTermsModal = true" class="text-blue-600 hover:underline font-medium">términos y la política de privacidad</button>
          </span>
        </div>
        <p v-if="fieldErrors.aceptaTerminos" class="text-sm text-red-600">{{ fieldErrors.aceptaTerminos }}</p>

        <!-- Mensaje de error general del formulario -->
        <div v-if="formError" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4" role="alert">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ formError }}</span>
          </div>
        </div>

        <button
          type="submit"
          class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit"
        >
          {{ isLoading ? 'Creando cuenta…' : 'Registrarme' }}
        </button>

        <p class="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-blue-600 hover:text-blue-700">Inicia sesión</router-link>
        </p>

      </form>
    </div>
  </div>

  <BaseModal :isOpen="showTermsModal" title="Términos y Política de Privacidad" @close="showTermsModal = false">
    <div class="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
      <h4 class="font-bold text-gray-900">Alojamiento y Transferencia Internacional de Datos</h4>
      
      <p class="font-semibold text-gray-900">ReSolVelo es un servicio digital con infraestructura global para garantizar su rendimiento y disponibilidad.</p>
      
      <ul class="list-disc pl-5 space-y-2">
        <li>
          <strong>Consentimiento para la Transferencia Internacional:</strong> Para operar nuestra plataforma, utilizamos los servicios de infraestructura en la nube de proveedores líderes como Amazon Web Services (AWS). Esto significa que la información que nos proporcionas, incluidos tus datos personales, puede ser almacenada y procesada en servidores ubicados fuera de tu país de residencia (incluyendo, pero no limitándose a, Estados Unidos, Brasil y países de la Unión Europea), donde las leyes de protección de datos pueden ser diferentes.
        </li>
        <li>
          <strong>Finalidad de la Transferencia:</strong> Esta transferencia es necesaria para poder prestarte el servicio de ReSolVelo de manera eficiente y segura.
        </li>
        <li>
          <strong>Aceptación:</strong> Al crear una cuenta y utilizar nuestros servicios, aceptas y consientes explícitamente esta transferencia, almacenamiento y procesamiento de tus datos en el extranjero. Nos comprometemos a que nuestros proveedores de servicios cumplan con altos estándares de seguridad y protección de datos.
        </li>
      </ul>

      <h4 class="font-bold text-gray-900 mt-6">Recopilación de Datos y Cumplimiento Normativo</h4>
      <p>En estricto cumplimiento de la <strong>Ley N° 18.331 de Protección de Datos Personales y Acción de Habeas Data</strong> de la República Oriental del Uruguay:</p>

      <ul class="list-disc pl-5 space-y-2">
        <li>
          <strong>Información Requerida:</strong> Para garantizar la seguridad de las transacciones y validar la identidad de nuestros usuarios, ReSolVelo solicitará información personal sensible, incluyendo <strong>Cédula de Identidad</strong> y <strong>datos bancarios</strong>.
        </li>
        <li>
          <strong>Uso de la Información:</strong> Estos datos serán utilizados exclusivamente para la verificación de identidad, gestión de reservas y procesamiento de pagos/cobros dentro de la plataforma.
        </li>
        <li>
          <strong>Compromiso de Privacidad:</strong> Sus datos se encuentran resguardados bajo estrictas medidas de seguridad y no serán compartidos con terceros sin su consentimiento, salvo las excepciones previstas por la ley para el cumplimiento del servicio.
        </li>
      </ul>
    </div>
    
    <template #footer>
      <button 
        @click="showTermsModal = false" 
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cerrar
      </button>
      <button 
        @click="{ aceptaTerminos = true; showTermsModal = false }" 
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Aceptar y Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
/* UX: estilos con Tailwind siguiendo estética tipo shadcn/ui para inputs y botones */
</style>
