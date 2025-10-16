<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usuarioService, authService, publicacionesService } from '../services/api'
import type { Publicacion } from '../services/api'

interface UsuarioPerfil {
  id: string
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  direccion?: string
}

const cargando = ref(false)
const guardando = ref(false)
const mensaje = ref('')
const error = ref('')

const usuarioId = ref<string | null>(null)
const nombre = ref('')
const apellido = ref('')
const telefono = ref('')
const direccion = ref('')

// Variables para mis publicaciones
const misPublicaciones = ref<Publicacion[]>([])
const cargandoPublicaciones = ref(false)
const errorPublicaciones = ref('')
const pestanaActiva = ref<'perfil' | 'publicaciones'>('perfil')

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
    telefono.value = perfil.telefono || ''
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
        telefono.value = perfil.telefono || ''
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
    const res = await usuarioService.actualizarPerfil(usuarioId.value, {
      nombre: nombre.value || undefined,
      apellido: apellido.value || undefined,
      telefono: telefono.value || undefined,
      direccion: direccion.value || undefined,
    })
    mensaje.value = res.message || 'Perfil actualizado correctamente.'
    // Actualizar nombre y apellido en localStorage si cambian
    const userDataRaw = localStorage.getItem('userData')
    if (userDataRaw) {
      const userData = JSON.parse(userDataRaw)
      userData.nombre = nombre.value
      userData.apellido = apellido.value
      localStorage.setItem('userData', JSON.stringify(userData))
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'No se pudo actualizar el perfil.'
  } finally {
    guardando.value = false
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
          <label for="telefono" class="block text-sm font-medium text-gray-800">Teléfono</label>
          <input
            id="telefono"
            v-model.trim="telefono"
            type="text"
            maxlength="20"
            placeholder="Tu teléfono"
            class="mt-1 w-full h-12 rounded-xl border border-gray-300 bg-white/95 px-4 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
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
            <div class="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                v-if="publicacion.imagenes && publicacion.imagenes.length > 0"
                :src="publicacion.imagenes[0].url"
                :alt="publicacion.titulo"
                class="w-full h-48 object-cover"
              />
              <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400">Sin imagen</span>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ publicacion.titulo }}</h3>
              <p class="text-gray-600 text-sm mb-2">{{ publicacion.categoria }}</p>
              <p class="text-blue-600 font-semibold">${{ publicacion.precio }} / día</p>
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