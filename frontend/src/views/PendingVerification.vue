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
  <div class="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6">
    <div class="absolute top-0 left-0 right-0 flex justify-center py-6">
      <div class="flex items-center gap-2">
        <span class="h-8 w-8 rounded-full bg-pink-600 inline-block" aria-hidden="true"></span>
        <span class="text-lg font-semibold tracking-tight text-gray-900">ReSolVelo</span>
      </div>
    </div>
    <div class="w-full max-w-md bg-white/90 backdrop-blur shadow-xl rounded-2xl border border-gray-200 p-8 text-center">
      <h1 class="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Verificación pendiente</h1>
      <p class="text-gray-700 mb-4">Tu cuenta está en estado <span class="font-semibold">PENDIENTE</span>.</p>
      <p class="text-gray-600 mb-6">Hemos enviado un correo de verificación a:
        <span class="font-medium text-gray-900">{{ email || 'tu email registrado' }}</span>.
        Sigue las instrucciones para activar tu cuenta.
      </p>

      <div class="space-y-3">
        <button @click="reenviarVerificacion" type="button" class="w-full py-2.5 px-4 rounded-xl bg-pink-600 text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
          Reenviar verificación (mock)
        </button>
        <button @click="irALogin" type="button" class="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Diseño responsivo y accesible con Tailwind, alineado al resto del sistema */
</style>