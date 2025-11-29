<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/api'

const route = useRoute()
const router = useRouter()
const cargando = ref(false)
const error = ref('')

onMounted(async () => {
  const code = (route.query.code as string) || ''
  const redirectUri = window.location.origin + '/gubuy/callback'
  if (!code) {
    error.value = 'Código no proporcionado'
    router.replace('/login')
    return
  }
  cargando.value = true
  try {
    const res = await authService.loginConGubUy(code, redirectUri)
    localStorage.setItem('access_token', res.access_token)
    if (res.user) {
      localStorage.setItem('userData', JSON.stringify(res.user))
    }
    const rutaRedireccion = authService.obtenerRutaRedireccion()
    router.replace(rutaRedireccion)
  } catch (e: any) {
    const status = e?.response?.status
    if (status === 403) {
      try { sessionStorage.setItem('mensajePostLogin', e?.response?.data?.message || 'Tu cuenta debe ser verificada por un administrador antes de acceder') } catch {}
      error.value = 'Tu cuenta debe ser verificada por un administrador antes de acceder'
    } else if (status === 401) {
      error.value = e?.response?.data?.message || 'No autorizado'
    } else {
      error.value = e?.message || 'Error al completar el login con gub.uy'
    }
    router.replace('/login')
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-xl font-semibold">Redirigiendo…</h1>
    <p v-if="cargando" class="mt-2 text-gray-600">Procesando autenticación con gub.uy (simulado).</p>
    <p v-else-if="error" class="mt-2 text-red-600">{{ error }}</p>
  </div>
</template>