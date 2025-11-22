<script setup lang="ts">
// Componente de Registro con enfoque en UX, accesibilidad y seguridad
// - Validaciones claras, requisitos de contraseña (OWASP)
// - Indicador de fortaleza de contraseña
// - Estados de carga y errores accesibles
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/api";
import { Switch, Transition } from "@headlessui/vue";

const router = useRouter();

// Estado del formulario
const nombre = ref("");
const apellido = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const telefono = ref("");
const documentoIdentidad = ref("");
const aceptaTerminos = ref(false);
const isLoading = ref(false);
const formError = ref("");
const fieldErrors = ref<Record<string, string>>({});

// Validaciones
const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isValidDocumento = (val: string) =>
  /^(\d\.\d{3}\.\d{3}-\d|\d{7,8})$/.test(val); // formato uruguayo o sólo dígitos
const passwordStrength = computed(() => {
  const val = password.value;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[a-z]/.test(val)) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/\d/.test(val)) score++;
  if (/[@$!%*?&]/.test(val)) score++;
  return score; // 0-5
});
const passwordsMatch = computed(
  () => password.value && password.value === confirmPassword.value,
);
const canSubmit = computed(() => {
  return (
    nombre.value &&
    apellido.value &&
    isValidEmail(email.value) &&
    isValidDocumento(documentoIdentidad.value) &&
    passwordStrength.value >= 4 &&
    passwordsMatch.value &&
    aceptaTerminos.value &&
    !isLoading.value
  );
});

const validateFields = () => {
  fieldErrors.value = {};
  if (!nombre.value) fieldErrors.value.nombre = "El nombre es requerido.";
  if (!apellido.value) fieldErrors.value.apellido = "El apellido es requerido.";
  if (!isValidEmail(email.value))
    fieldErrors.value.email = "Ingresa un email válido.";
  if (!isValidDocumento(documentoIdentidad.value))
    fieldErrors.value.documentoIdentidad = "Formato de documento inválido.";
  if (passwordStrength.value < 4)
    fieldErrors.value.password =
      "La contraseña debe incluir mayúsculas, minúsculas, número y caracter especial.";
  if (!passwordsMatch.value)
    fieldErrors.value.confirmPassword = "Las contraseñas no coinciden.";
  if (!aceptaTerminos.value)
    fieldErrors.value.aceptaTerminos =
      "Debes aceptar los términos y condiciones.";
};

// Envío del formulario
const onSubmit = async () => {
  validateFields();
  if (Object.keys(fieldErrors.value).length > 0) return;

  try {
    isLoading.value = true;
    formError.value = "";
    const response = await authService.registro({
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      telefono: telefono.value || undefined,
      documentoIdentidad: documentoIdentidad.value,
    });
    localStorage.setItem("access_token", response.access_token);

    // Redirigir a verificación pendiente
    if (response.user?.estadoVerificacion === "PENDIENTE") {
      router.push({
        path: "/verificacion-pendiente",
        query: { email: response.user.email },
      });
      return;
    }
  } catch (err: any) {
    if (err?.response?.status === 503) {
      formError.value =
        "Servicio no disponible. La base de datos no está conectada. Intenta nuevamente en unos segundos.";
    } else if (err.response?.data?.message) {
      formError.value = Array.isArray(err.response.data.message)
        ? err.response.data.message.join(", ")
        : err.response.data.message;
    } else {
      formError.value = "Ocurrió un error al registrar. Intenta nuevamente.";
    }
  } finally {
    isLoading.value = false;
  }
};

// Registro rápido para pruebas
const registroRapido = () => {
  const timestamp = Date.now();
  nombre.value = "Juan";
  apellido.value = "Pérez";
  email.value = `juan.perez.${timestamp}@test.com`;
  documentoIdentidad.value = "1.234.567-8";
  telefono.value = "099123456";
  password.value = "Password123!";
  confirmPassword.value = "Password123!";
  aceptaTerminos.value = true;
  alert(
    '✅ Datos de prueba cargados. Ahora puedes hacer clic en "Registrarme"',
  );
};
</script>

<template>
  <div
    class="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12"
  >
    <!-- Card de registro: el logo ahora proviene de la barra de navegación del layout principal -->
    <div
      class="w-full max-w-xl md:max-w-2xl mx-auto bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-gray-200 p-8"
    >
      <h1 class="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
        Crea tu cuenta
      </h1>
      <p class="text-gray-600 mb-6">Regístrate para comenzar</p>

      <form
        @submit.prevent="onSubmit"
        class="space-y-4"
        aria-describedby="form-error"
        :aria-busy="isLoading"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-800"
              >Nombre *</label
            >
            <input
              id="nombre"
              v-model.trim="nombre"
              type="text"
              required
              autocomplete="given-name"
              placeholder="Tu nombre"
              :aria-invalid="!!fieldErrors.nombre"
              :aria-describedby="
                fieldErrors.nombre ? 'nombre-error' : undefined
              "
              class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @blur="validateFields"
            />
            <p
              v-if="fieldErrors.nombre"
              id="nombre-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ fieldErrors.nombre }}
            </p>
          </div>
          <div>
            <label
              for="apellido"
              class="block text-sm font-medium text-gray-800"
              >Apellido *</label
            >
            <input
              id="apellido"
              v-model.trim="apellido"
              type="text"
              required
              autocomplete="family-name"
              placeholder="Tu apellido"
              :aria-invalid="!!fieldErrors.apellido"
              :aria-describedby="
                fieldErrors.apellido ? 'apellido-error' : undefined
              "
              class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              @blur="validateFields"
            />
            <p
              v-if="fieldErrors.apellido"
              id="apellido-error"
              class="mt-1 text-sm text-red-600"
            >
              {{ fieldErrors.apellido }}
            </p>
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-800"
            >Correo electrónico *</label
          >
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
          <p
            v-if="fieldErrors.email"
            id="email-error"
            class="mt-1 text-sm text-red-600"
          >
            {{ fieldErrors.email }}
          </p>
        </div>

        <div>
          <label
            for="documentoIdentidad"
            class="block text-sm font-medium text-gray-800"
            >Documento de identidad *</label
          >
          <input
            id="documentoIdentidad"
            v-model.trim="documentoIdentidad"
            type="text"
            required
            placeholder="1.234.567-8"
            :aria-invalid="!!fieldErrors.documentoIdentidad"
            :aria-describedby="
              fieldErrors.documentoIdentidad ? 'doc-error' : undefined
            "
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            @blur="validateFields"
          />
          <p
            v-if="fieldErrors.documentoIdentidad"
            id="doc-error"
            class="mt-1 text-sm text-red-600"
          >
            {{ fieldErrors.documentoIdentidad }}
          </p>
        </div>

        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-800"
            >Teléfono (opcional)</label
          >
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
          <label for="password" class="block text-sm font-medium text-gray-800"
            >Contraseña *</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            :aria-invalid="!!fieldErrors.password"
            :aria-describedby="
              fieldErrors.password ? 'password-error' : 'password-help'
            "
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            @input="validateFields"
          />
          <p id="password-help" class="mt-1 text-xs text-gray-500">
            Debe incluir mayúsculas, minúsculas, números y un caracter especial
            (@$!%*?&).
          </p>
          <p
            v-if="fieldErrors.password"
            id="password-error"
            class="mt-1 text-sm text-red-600"
          >
            {{ fieldErrors.password }}
          </p>

          <!-- Indicador de fortaleza -->
          <div class="mt-2 h-2 w-full bg-gray-200 rounded">
            <div
              class="h-2 rounded transition-all"
              :class="[
                passwordStrength === 5
                  ? 'bg-green-600 w-full'
                  : passwordStrength === 4
                    ? 'bg-green-500 w-4/5'
                    : passwordStrength === 3
                      ? 'bg-yellow-500 w-3/5'
                      : passwordStrength === 2
                        ? 'bg-orange-500 w-2/5'
                        : passwordStrength > 0
                          ? 'bg-red-500 w-1/5'
                          : 'bg-transparent w-0',
              ]"
            />
          </div>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-800"
            >Confirmar contraseña *</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Repite tu contraseña"
            :aria-invalid="!!fieldErrors.confirmPassword"
            :aria-describedby="
              fieldErrors.confirmPassword ? 'confirm-error' : undefined
            "
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            @input="validateFields"
          />
          <p
            v-if="fieldErrors.confirmPassword"
            id="confirm-error"
            class="mt-1 text-sm text-red-600"
          >
            {{ fieldErrors.confirmPassword }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <Switch
            v-model="aceptaTerminos"
            as="button"
            class="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="aceptaTerminos ? 'bg-blue-600' : 'bg-gray-200'"
            aria-label="Aceptar términos y condiciones"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white transition"
              :class="aceptaTerminos ? 'translate-x-5' : 'translate-x-1'"
            />
          </Switch>
          <span class="text-sm text-gray-700"
            >Acepto los términos y la política de privacidad</span
          >
        </div>
        <p v-if="fieldErrors.aceptaTerminos" class="text-sm text-red-600">
          {{ fieldErrors.aceptaTerminos }}
        </p>

        <button
          type="submit"
          class="w-full h-12 px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit"
        >
          {{ isLoading ? "Creando cuenta…" : "Registrarme" }}
        </button>

        <p class="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-blue-600 hover:text-blue-700"
            >Inicia sesión</router-link
          >
        </p>

        <p
          v-if="formError"
          id="form-error"
          class="text-red-600 text-sm"
          aria-live="polite"
        >
          {{ formError }}
        </p>

        <!-- Botón de registro rápido para pruebas -->
        <div class="mt-6 pt-6 border-t border-gray-200">
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
/* UX: estilos con Tailwind siguiendo estética tipo shadcn/ui para inputs y botones */
</style>
