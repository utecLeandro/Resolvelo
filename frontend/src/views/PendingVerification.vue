<script setup lang="ts">
// Pantalla de Verificación pendiente
// - Informa estado de cuenta "PENDIENTE" tras registro/login
// - Buenas prácticas de UX y accesibilidad
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "../services/api";

const route = useRoute();
const router = useRouter();
const email = (route.query.email as string) || "";

const cargando = ref(false);
const mensaje = ref("");
const error = ref("");

const reenviarVerificacion = async () => {
  if (cargando.value) return;
  
  cargando.value = true;
  mensaje.value = "";
  error.value = "";

  try {
    const emailToSend = email;
    if (!emailToSend) {
      throw new Error("No se encontró el email para reenviar.");
    }
    
    const res = await authService.reenviarVerificacion(emailToSend);
    mensaje.value = res.message || "Correo de verificación reenviado exitosamente.";
  } catch (e: any) {
    error.value = e.message || "Error al reenviar el correo. Intenta nuevamente.";
  } finally {
    cargando.value = false;
  }
};

const irALogin = () => {
  router.push("/login");
};
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Encabezado -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Verificación pendiente</h1>
      <p class="text-sm text-gray-600">
        Revisa tu correo para activar tu cuenta
      </p>
    </div>

    <!-- Contenido -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <span
            class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white"
          >
            <!-- Ícono de correo -->
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 12H8m0 0l4 4m-4-4l4-4M4 6h16v12H4z"
              />
            </svg>
          </span>
        </div>
        <div>
          <p class="text-gray-700">
            Tu cuenta está en estado
            <span class="font-semibold">PENDIENTE</span>.
          </p>
          <p class="text-gray-600 mt-1">
            Hemos enviado un correo de verificación a
            <span class="font-medium text-gray-900">{{
              email || "tu email registrado"
            }}</span
            >. Sigue las instrucciones para activar tu cuenta.
          </p>
          
          <!-- Mensajes de éxito/error -->
          <div v-if="mensaje" class="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {{ mensaje }}
          </div>
          <div v-if="error" class="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {{ error }}
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          @click="reenviarVerificacion"
          type="button"
          :disabled="cargando"
          class="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="!cargando"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-16 0m16 8a8 8 0 01-16 0"
            />
          </svg>
          <svg
            v-else
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ cargando ? "Enviando..." : "Reenviar verificación" }}
        </button>
        <button
          @click="irALogin"
          type="button"
          class="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Usamos Tailwind para mantener consistencia visual con el resto de la web */
</style>
