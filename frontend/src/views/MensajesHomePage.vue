<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Mensajes</h1>
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div v-if="cargando" class="text-gray-500 text-sm">Cargando…</div>
      <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-else>
        <div v-if="conversaciones.length === 0" class="text-gray-600 text-sm">No tienes conversaciones. Ve a "Mis Reservas" para contactar al propietario.</div>
        <ul v-else class="space-y-3">
          <li v-for="c in conversaciones" :key="c.reservaId">
            <div class="group flex items-center justify-between rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-4" :class="c.noLeidos > 0 ? 'ring-2 ring-blue-300' : ''">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <img v-if="c.contraparte?.avatarUrl" :src="c.contraparte.avatarUrl" alt="avatar" class="w-10 h-10 rounded-full object-cover" />
                  <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">{{ iniciales(c.contraparte) }}</div>
                  <span v-if="c.noLeidos > 0" class="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full"></span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ c.contraparte?.nombre }} {{ c.contraparte?.apellido }}</p>
                  <p class="text-xs text-gray-600 truncate max-w-[280px]">{{ c.publicacion?.titulo || 'Reserva' }}</p>
                  <p class="text-xs text-gray-500" v-if="c.ultimoMensaje">Último: {{ formatearFecha(c.ultimoMensaje.fechaCreacion) }}</p>
                  <span v-if="c.noLeidos > 0" class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs mt-1">{{ c.noLeidos }} sin leer</span>
                </div>
              </div>
              <router-link :to="`/mensajes/reserva/${c.reservaId}`" class="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700">
                Abrir chat
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>
              </router-link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { mensajesService } from '../services/api'

const cargando = ref(true)
const error = ref('')
const conversaciones = ref<any[]>([])
let intervalId: number | null = null

function ordenarConversaciones(arr: any[]) {
  return arr.slice().sort((a: any, b: any) => {
    const ta = a.ultimoMensaje?.fechaCreacion ? new Date(a.ultimoMensaje.fechaCreacion).getTime() : 0
    const tb = b.ultimoMensaje?.fechaCreacion ? new Date(b.ultimoMensaje.fechaCreacion).getTime() : 0
    return tb - ta
  })
}

function formatearFecha(f: string) {
  try { return new Date(f).toLocaleString() } catch { return f }
}

function iniciales(persona: any) {
  const n = [persona?.nombre, persona?.apellido].filter(Boolean).map((s: string) => s.charAt(0).toUpperCase()).slice(0, 2).join('')
  return n || 'US'
}

onMounted(async () => {
  cargando.value = true
  try {
    const res = await mensajesService.listarMisConversaciones()
    conversaciones.value = ordenarConversaciones(res.conversaciones || [])
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Error al cargar'
  } finally {
    cargando.value = false
  }

  intervalId = window.setInterval(async () => {
    if (!cargando.value) {
      try {
        const res = await mensajesService.listarMisConversaciones()
        conversaciones.value = ordenarConversaciones(res.conversaciones || [])
      } catch {}
    }
  }, 30000)

  const manejarMensajeNuevo = async () => {
    try {
      const res = await mensajesService.listarMisConversaciones()
      conversaciones.value = ordenarConversaciones(res.conversaciones || [])
    } catch {}
  }
  window.addEventListener('mensaje-enviado', manejarMensajeNuevo as EventListener)
  window.addEventListener('mensaje-recibido', manejarMensajeNuevo as EventListener)
  // Guardar referencia para remover
  ;(window as any).__mensajes_manejarMensajeNuevo__ = manejarMensajeNuevo
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  const fn = (window as any).__mensajes_manejarMensajeNuevo__
  if (fn) {
    window.removeEventListener('mensaje-enviado', fn)
    window.removeEventListener('mensaje-recibido', fn)
    ;(window as any).__mensajes_manejarMensajeNuevo__ = null
  }
})
</script>

<style scoped>
</style>
