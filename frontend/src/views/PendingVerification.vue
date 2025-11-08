<script setup lang="ts">
// Pantalla de Verificación pendiente
// - Informa estado de cuenta "PENDIENTE" tras registro/login
// - Buenas prácticas de UX y accesibilidad
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const email = (route.query.email as string) || ''

const reenviarVerificacion = () => {
  // Mock: En una implementación real, aquí se llamaría a un endpoint para reenviar el correo
  alert(`Se ha reenviado el correo de verificación a ${email || 'tu email registrado'}. (mock)`) // mensaje accesible por ser modal del navegador
}

const irALogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Encabezado -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Verificación pendiente</h1>
      <p class="text-sm text-gray-600">Revisa tu correo para activar tu cuenta</p>
    </div>

    <!-- Contenido -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white">
            <!-- Ícono de correo -->
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H8m0 0l4 4m-4-4l4-4M4 6h16v12H4z" />
            </svg>
          </span>
        </div>
        <div>
          <p class="text-gray-700">Tu cuenta está en estado <span class="font-semibold">PENDIENTE</span>.</p>
          <p class="text-gray-600 mt-1">Hemos enviado un correo de verificación a
            <span class="font-medium text-gray-900">{{ email || 'tu email registrado' }}</span>.
            Sigue las instrucciones para activar tu cuenta.
          </p>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          @click="reenviarVerificacion"
          type="button"
          class="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-16 0m16 8a8 8 0 01-16 0" />
          </svg>
          Reenviar verificación (mock)
        </button>
        <button
          @click="irALogin"
          type="button"
          class="inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
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