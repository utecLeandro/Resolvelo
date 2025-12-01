<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { usuarioService, authService, publicacionesService } from '../services/api'
import type { Publicacion } from '../services/api'
import { useAuth } from '../composables/useAuth'

interface UsuarioPerfil {
  id: string
  nombre?: string
  apellido?: string
  email?: string
  documentoIdentidad?: string
  direccion?: string
}

const cargando = ref(false)
const guardando = ref(false)
const mensaje = ref('')
const error = ref('')

const usuarioId = ref<string | null>(null)
const nombre = ref('')
const apellido = ref('')
const documentoIdentidad = ref('')
const direccion = ref('')
const avatarFile = ref<File | null>(null)
const subiendoAvatar = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const avatarContainer = ref<HTMLDivElement | null>(null)
const containerW = ref(64)
const containerH = ref(64)
const imgNaturalW = ref(0)
const imgNaturalH = ref(0)
const scaledW = ref(64)
const scaledH = ref(64)
const avatarPosX = ref(0)
const avatarPosY = ref(0)
const dragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const posStartX = ref(0)
const posStartY = ref(0)

// Variables para mis publicaciones
const misPublicaciones = ref<Publicacion[]>([])
const cargandoPublicaciones = ref(false)
const errorPublicaciones = ref('')
const pestanaActiva = ref<'perfil' | 'publicaciones'>('perfil')

// Composable para manejar estado global del usuario
const { actualizarDatosUsuario, datosUsuario } = useAuth()

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
const formattedDocumentoIdentidad = computed(() => formatearCIMask(documentoIdentidad.value))

onMounted(async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    error.value = 'No estás autenticado. Inicia sesión para acceder a tu perfil.'
    return
  }
  cargando.value = true
  try {
    // Preferir obtener el perfil autenticado desde el backend
    const perfil: UsuarioPerfil = await authService.perfil()
    usuarioId.value = perfil.id
    nombre.value = perfil.nombre || ''
    apellido.value = perfil.apellido || ''
    documentoIdentidad.value = perfil.documentoIdentidad || ''
    direccion.value = perfil.direccion || ''
  } catch (e: any) {
    // Fallback a localStorage si el endpoint falla
    const userDataRaw = localStorage.getItem('userData')
    if (userDataRaw) {
      const userData = JSON.parse(userDataRaw) as { id: string; nombre?: string }
      usuarioId.value = userData.id
      try {
        const perfil: UsuarioPerfil = await usuarioService.obtenerPerfil(userData.id)
        nombre.value = perfil.nombre || ''
        apellido.value = perfil.apellido || ''
        documentoIdentidad.value = perfil.documentoIdentidad || ''
        direccion.value = perfil.direccion || ''
      } catch (innerErr: any) {
        error.value = innerErr?.response?.data?.message || 'Error al cargar tu perfil.'
      }
    } else {
      error.value = e?.response?.data?.message || 'Error al cargar tu perfil.'
    }
  } finally {
    cargando.value = false
  }
})

const guardarCambios = async () => {
  if (!usuarioId.value) return
  guardando.value = true
  error.value = ''
  mensaje.value = ''
  try {
    if (avatarFile.value) {
      await subirAvatar()
    }
    const res = await usuarioService.actualizarPerfil(usuarioId.value, {
      nombre: nombre.value || undefined,
      apellido: apellido.value || undefined,
      direccion: direccion.value || undefined,
    })
    mensaje.value = res.message || 'Perfil actualizado correctamente.'
    
    // Actualizar el estado global reactivo del usuario
    actualizarDatosUsuario({
      nombre: nombre.value,
      apellido: apellido.value,
      direccion: direccion.value
    })
    
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'No se pudo actualizar el perfil.'
  } finally {
    guardando.value = false
  }
}

const abrirSelectorAvatar = () => {
  avatarInput.value?.click()
}

const measureContainer = () => {
  const el = avatarContainer.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  containerW.value = Math.round(rect.width)
  containerH.value = Math.round(rect.height)
}

const initPreview = async (url: string) => {
  await nextTick()
  measureContainer()
  const img = new Image()
  const done = new Promise<void>((resolve) => {
    img.onload = () => {
      imgNaturalW.value = img.naturalWidth || img.width
      imgNaturalH.value = img.naturalHeight || img.height
      const scale = Math.max(containerW.value / imgNaturalW.value, containerH.value / imgNaturalH.value)
      scaledW.value = Math.round(imgNaturalW.value * scale)
      scaledH.value = Math.round(imgNaturalH.value * scale)
      avatarPosX.value = Math.round((containerW.value - scaledW.value) / 2)
      avatarPosY.value = Math.round((containerH.value - scaledH.value) / 2)
      resolve()
    }
  })
  img.src = url
  await done
}

const clampPosition = () => {
  const minX = containerW.value - scaledW.value
  const minY = containerH.value - scaledH.value
  if (avatarPosX.value > 0) avatarPosX.value = 0
  if (avatarPosY.value > 0) avatarPosY.value = 0
  if (avatarPosX.value < minX) avatarPosX.value = minX
  if (avatarPosY.value < minY) avatarPosY.value = minY
}

const onAvatarMouseDown = (e: MouseEvent) => {
  if (!avatarPreviewUrl.value) return
  dragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  posStartX.value = avatarPosX.value
  posStartY.value = avatarPosY.value
  window.addEventListener('mousemove', onAvatarMouseMove)
  window.addEventListener('mouseup', onAvatarMouseUp)
}

const onAvatarMouseMove = (e: MouseEvent) => {
  if (!dragging.value) return
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value
  avatarPosX.value = posStartX.value + dx
  avatarPosY.value = posStartY.value + dy
  clampPosition()
}

const onAvatarMouseUp = () => {
  dragging.value = false
  window.removeEventListener('mousemove', onAvatarMouseMove)
  window.removeEventListener('mouseup', onAvatarMouseUp)
}

const onAvatarTouchStart = (e: TouchEvent) => {
  if (!avatarPreviewUrl.value) return
  const t = e.touches?.[0]
  if (!t) return
  dragging.value = true
  dragStartX.value = t.clientX
  dragStartY.value = t.clientY
  posStartX.value = avatarPosX.value
  posStartY.value = avatarPosY.value
  window.addEventListener('touchmove', onAvatarTouchMove, { passive: false })
  window.addEventListener('touchend', onAvatarTouchEnd)
}

const onAvatarTouchMove = (e: TouchEvent) => {
  if (!dragging.value) return
  const t = e.touches?.[0]
  if (!t) return
  const dx = t.clientX - dragStartX.value
  const dy = t.clientY - dragStartY.value
  avatarPosX.value = posStartX.value + dx
  avatarPosY.value = posStartY.value + dy
  clampPosition()
}

const onAvatarTouchEnd = () => {
  dragging.value = false
  window.removeEventListener('touchmove', onAvatarTouchMove)
  window.removeEventListener('touchend', onAvatarTouchEnd)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onAvatarMouseMove)
  window.removeEventListener('mouseup', onAvatarMouseUp)
  window.removeEventListener('touchmove', onAvatarTouchMove)
  window.removeEventListener('touchend', onAvatarTouchEnd)
})


const onAvatarChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const f = input.files && input.files[0]
  avatarFile.value = f || null
  if (f) {
    const url = URL.createObjectURL(f)
    avatarPreviewUrl.value = url
    initPreview(url)
  }
}

const crearCroppedBlob = async (): Promise<Blob | null> => {
  if (!avatarPreviewUrl.value) return null
  const canvas = document.createElement('canvas')
  canvas.width = containerW.value
  canvas.height = containerH.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  await new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, avatarPosX.value, avatarPosY.value, scaledW.value, scaledH.value)
      resolve()
    }
    img.src = avatarPreviewUrl.value as string
  })
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92)
  })
}

const subirAvatar = async () => {
  if (!usuarioId.value || !avatarFile.value) return
  subiendoAvatar.value = true
  error.value = ''
  try {
    const blob = await crearCroppedBlob()
    const fileToSend = blob ? new File([blob], 'avatar.jpg', { type: 'image/jpeg' }) : avatarFile.value
    const res = await usuarioService.subirAvatar(usuarioId.value, fileToSend)
    mensaje.value = 'Foto de perfil actualizada.'
    actualizarDatosUsuario({ avatarUrl: res.avatarUrl })
    avatarFile.value = null
    if (avatarPreviewUrl.value) {
      URL.revokeObjectURL(avatarPreviewUrl.value)
      avatarPreviewUrl.value = null
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'No se pudo subir la foto de perfil.'
  } finally {
    subiendoAvatar.value = false
  }
}

const cargarMisPublicaciones = async () => {
  if (!usuarioId.value) return
  cargandoPublicaciones.value = true
  errorPublicaciones.value = ''
  try {
    misPublicaciones.value = await publicacionesService.obtenerMisPublicaciones()
  } catch (e: any) {
    errorPublicaciones.value = e?.response?.data?.message || 'Error al cargar tus publicaciones.'
  } finally {
    cargandoPublicaciones.value = false
  }
}

const cambiarPestana = (pestana: 'perfil' | 'publicaciones') => {
  pestanaActiva.value = pestana
  if (pestana === 'publicaciones' && misPublicaciones.value.length === 0) {
    cargarMisPublicaciones()
  }
}

const obtenerImagenPrincipalUrl = (imagenes: any): string => {
  if (!Array.isArray(imagenes) || imagenes.length === 0) return ''
  const first = imagenes[0]
  if (typeof first === 'string') return first || ''
  const principal = (imagenes as any[]).find(i => i?.esPrincipal) || first
  return principal?.url || ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Mi perfil</h1>

    <!-- Pestañas -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="cambiarPestana('perfil')"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            pestanaActiva === 'perfil'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Información personal
        </button>
        <button
          @click="cambiarPestana('publicaciones')"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            pestanaActiva === 'publicaciones'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Mis publicaciones
        </button>
      </nav>
    </div>

    <div v-if="cargando" class="text-gray-600">Cargando perfil…</div>
    <div v-else>
      <!-- Pestaña de información personal -->
      <div v-if="pestanaActiva === 'perfil'">
        <form @submit.prevent="guardarCambios" class="space-y-6" aria-describedby="form-error">
        <div class="flex items-center gap-4">
          <div ref="avatarContainer" class="w-16 h-16 rounded-full bg-blue-100 relative overflow-hidden select-none">
            <template v-if="avatarPreviewUrl">
              <img
                :src="avatarPreviewUrl"
                :style="{ position: 'absolute', left: avatarPosX + 'px', top: avatarPosY + 'px', width: scaledW + 'px', height: scaledH + 'px', userSelect: 'none' }"
                @mousedown="onAvatarMouseDown"
                @touchstart.prevent="onAvatarTouchStart"
                alt="Avatar preview"
              />
            </template>
            <template v-else>
              <img v-if="datosUsuario?.avatarUrl" :src="datosUsuario?.avatarUrl" alt="Avatar" class="w-16 h-16 object-cover" />
              <span v-else class="absolute inset-0 flex items-center justify-center text-blue-600 font-semibold">{{ (nombre?.[0] || '') + (apellido?.[0] || '') }}</span>
            </template>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-800">Foto de perfil</label>
            <input ref="avatarInput" type="file" accept="image/*" @change="onAvatarChange" class="hidden" />
            <button type="button" @click="abrirSelectorAvatar" :disabled="guardando || subiendoAvatar" class="mt-2 px-4 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Subir foto
            </button>
          </div>
        </div>
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-800">Nombre</label>
          <input
            id="nombre"
            v-model.trim="nombre"
            type="text"
            maxlength="100"
            placeholder="Tu nombre"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="apellido" class="block text-sm font-medium text-gray-800">Apellido</label>
          <input
            id="apellido"
            v-model.trim="apellido"
            type="text"
            maxlength="100"
            placeholder="Tu apellido"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="documentoIdentidad" class="block text-sm font-medium text-gray-800">Documento de identidad</label>
          <input
            id="documentoIdentidad"
            :value="formattedDocumentoIdentidad"
            type="text"
            maxlength="13"
            placeholder="1.234.567-8"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            readonly
            disabled
            aria-readonly="true"
          />
          <p class="mt-1 text-xs text-gray-500">Este dato es de solo lectura.</p>
        </div>

        <div>
          <label for="direccion" class="block text-sm font-medium text-gray-800">Dirección</label>
          <input
            id="direccion"
            v-model.trim="direccion"
            type="text"
            maxlength="200"
            placeholder="Tu dirección"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            class="px-5 h-12 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="guardando"
          >
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
          <span v-if="mensaje" class="text-green-600" aria-live="polite">{{ mensaje }}</span>
          <span v-if="error" id="form-error" class="text-red-600" aria-live="polite">{{ error }}</span>
        </div>
      </form>
      </div>

      <!-- Pestaña de mis publicaciones -->
      <div v-if="pestanaActiva === 'publicaciones'">
        <div v-if="cargandoPublicaciones" class="text-gray-600">Cargando publicaciones…</div>
        <div v-else-if="errorPublicaciones" class="text-red-600">{{ errorPublicaciones }}</div>
        <div v-else-if="misPublicaciones.length === 0" class="text-center py-8">
          <div class="text-gray-500 mb-4">No tienes publicaciones aún</div>
          <router-link
            to="/crear-publicacion"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Crear mi primera publicación
          </router-link>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="publicacion in misPublicaciones"
            :key="publicacion.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="aspect-w-16 aspect-h-9 bg-white">
              <div class="w-full h-48 flex items-center justify-center overflow-hidden">
                <img v-if="obtenerImagenPrincipalUrl(publicacion.imagenes)" :src="obtenerImagenPrincipalUrl(publicacion.imagenes)" alt="Imagen de publicación" class="w-full h-full object-contain" />
                <svg v-else class="h-12 w-12 text-blue-400 opacity-60" fill="currentColor" viewBox="0 0 24 24" :aria-label="publicacion.titulo">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ publicacion.titulo }}</h3>
              <p class="text-gray-600 text-sm mb-2">{{ publicacion.categoria }}</p>
              <p class="text-blue-600 font-semibold">${{ publicacion.precioPorDia }} / día</p>
              <p class="text-gray-500 text-sm mt-2">{{ publicacion.ciudad }}, {{ publicacion.departamento }}</p>
              <div class="mt-4 flex justify-between items-center">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    publicacion.disponible
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ publicacion.disponible ? 'Disponible' : 'No disponible' }}
                </span>
                <router-link
                  :to="`/publicacion/${publicacion.id}`"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver detalles
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
</style>
