<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Chat de la reserva</h1>
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div v-if="info" class="flex items-center gap-3 p-4 border-b border-gray-200">
        <img v-if="info.contraparte.avatarUrl" :src="info.contraparte.avatarUrl" alt="avatar" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex-1">
          <p class="text-sm text-gray-600">Conversación con</p>
          <p class="text-base font-semibold text-gray-900">{{ info.contraparte.nombre }} {{ info.contraparte.apellido }}</p>
          <p v-if="info.publicacion" class="text-xs text-gray-500">{{ info.publicacion.titulo }}<span v-if="info.publicacion.ciudad || info.publicacion.departamento"> · {{ [info.publicacion.ciudad, info.publicacion.departamento].filter(Boolean).join(', ') }}</span><span v-if="info.publicacion.precioPorDia"> · ${{ info.publicacion.precioPorDia }}/día</span></p>
        </div>
        <img v-if="info.publicacion?.imagenPrincipalUrl" :src="info.publicacion.imagenPrincipalUrl" alt="principal" class="w-12 h-12 rounded-md object-cover" />
      </div>
      <div class="h-96 overflow-y-auto p-4 space-y-3" ref="scrollArea">
        <div v-if="cargando" class="text-gray-500 text-sm">Cargando…</div>
        <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <div v-else>
          <div v-for="m in mensajes" :key="m.id" :data-msg-id="m.id" :class="m.emisorId === usuarioId ? 'text-right' : 'text-left'">
            <div :class="[
              'inline-block max-w-[80%] px-3 py-2 rounded-lg text-sm',
              m.emisorId === usuarioId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800',
              destacadoId === m.id ? 'ring-2 ring-yellow-400' : ''
            ]">
              <p>{{ m.contenido }}</p>
              <span class="block mt-1 text-xs opacity-70">{{ formatearFecha(m.fechaCreacion) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200 p-3">
        <form @submit.prevent="enviar" class="flex gap-2">
          <input v-model="contenido" type="text" placeholder="Escribe un mensaje" class="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button :disabled="enviando || !puedeEnviar" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{{ enviando ? 'Enviando…' : 'Enviar' }}</button>
        </form>
        <p v-if="mensajeError" class="text-red-600 text-sm mt-2">{{ mensajeError }}</p>
        <p v-if="mensajeOk" class="text-green-600 text-sm mt-2">{{ mensajeOk }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services/api'
import { mensajesService, type InfoChatReserva } from '../services/api'

const route = useRoute()
const reservaId = route.params.reservaId as string

const usuarioId = ref<string>('')
const mensajes = ref<any[]>([])
const info = ref<InfoChatReserva | null>(null)
const contenido = ref('')
const cargando = ref(true)
const enviando = ref(false)
const error = ref('')
const mensajeOk = ref('')
const mensajeError = ref('')
const scrollArea = ref<HTMLElement | null>(null)
const destacadoId = ref<string | null>(null)

const puedeEnviar = computed(() => contenido.value.trim().length > 0 && contenido.value.trim().length <= 2000)

function formatearFecha(f: string) {
  try { return new Date(f).toLocaleString() } catch { return f }
}

async function cargar() {
  cargando.value = true
  try {
    const perfil = await authService.perfil()
    usuarioId.value = perfil.id
    const res = await mensajesService.listarPorReserva(reservaId)
    mensajes.value = res.mensajes || []
    info.value = (res as any).info || null
    await mensajesService.marcarLeidos(reservaId)
    await nextTick()
    if (scrollArea.value) scrollArea.value.scrollTop = scrollArea.value.scrollHeight
    const targetId = (route.query.m as string | undefined) || null
    if (targetId) {
      destacadoId.value = targetId
      await nextTick()
      const el = document.querySelector(`[data-msg-id="${CSS.escape(targetId)}"]`) as HTMLElement | null
      if (el && scrollArea.value) {
        const top = el.offsetTop
        scrollArea.value.scrollTop = Math.max(0, top - 40)
      }
      setTimeout(() => { destacadoId.value = null }, 3000)
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Error al cargar mensajes'
  } finally {
    cargando.value = false
  }
}

async function enviar() {
  mensajeOk.value = ''
  mensajeError.value = ''
  const texto = contenido.value.trim()
  if (!texto) return
  enviando.value = true
  try {
    const res = await mensajesService.enviarMensaje({ reservaId, contenido: texto })
    mensajes.value.push(res.mensaje)
    contenido.value = ''
    mensajeOk.value = 'Mensaje enviado'
    await nextTick()
    if (scrollArea.value) scrollArea.value.scrollTop = scrollArea.value.scrollHeight
    try { window.dispatchEvent(new CustomEvent('mensaje-enviado', { detail: { reservaId } })) } catch {}
  } catch (e: any) {
    mensajeError.value = e?.response?.data?.message || e?.message || 'No se pudo enviar'
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
</style>
