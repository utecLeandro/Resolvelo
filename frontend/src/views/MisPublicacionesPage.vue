<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
        <p class="mt-2 text-gray-600">Gestiona tus instrumentos musicales publicados</p>
      </div>

      <!-- Estado de carga -->
      <div v-if="cargando" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Cargando publicaciones...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error al cargar publicaciones</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Sin publicaciones -->
      <div v-else-if="publicaciones.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes publicaciones</h3>
        <p class="mt-1 text-sm text-gray-500">Comienza publicando tu primer instrumento musical.</p>
        <div class="mt-6">
          <router-link
            to="/crear-publicacion"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear publicación
          </router-link>
        </div>
      </div>

      <!-- Lista de publicaciones -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="publicacion in publicaciones"
          :key="publicacion.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <!-- Imagen -->
          <div class="aspect-w-16 aspect-h-9 bg-gray-200">
            <img
              v-if="publicacion.imagenes && publicacion.imagenes.length > 0"
              :src="publicacion.imagenes[0].url"
              :alt="publicacion.titulo"
              class="w-full h-48 object-cover"
            />
            <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
              <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ publicacion.titulo }}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ publicacion.descripcion }}</p>
                
                <!-- Precio -->
                <div class="flex items-center mb-3">
                  <span class="text-2xl font-bold text-blue-600">${{ publicacion.precioPorDia }}</span>
                  <span class="text-sm text-gray-500 ml-1">/día</span>
                </div>

                <!-- Estado -->
                <div class="flex items-center space-x-2 mb-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': publicacion.estado === 'ACTIVA',
                      'bg-yellow-100 text-yellow-800': publicacion.estado === 'PAUSADA',
                      'bg-red-100 text-red-800': publicacion.estado === 'INACTIVA'
                    }"
                  >
                    {{ formatearEstado(publicacion.estado) }}
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': publicacion.estadoModeracion === 'APROBADA',
                      'bg-yellow-100 text-yellow-800': publicacion.estadoModeracion === 'PENDIENTE_REVISION',
                      'bg-red-100 text-red-800': publicacion.estadoModeracion === 'RECHAZADA'
                    }"
                  >
                    {{ formatearEstadoModeracion(publicacion.estadoModeracion) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex space-x-2">
              <router-link
                :to="`/publicacion/${publicacion.id}`"
                class="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Ver detalle
              </router-link>
              <button
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                @click="editarPublicacion(publicacion.id)"
              >
                Editar
              </button>
              <button
                class="flex-1 bg-red-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                @click="confirmarEliminar(publicacion)"
                :disabled="eliminando === publicacion.id"
              >
                {{ eliminando === publicacion.id ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { publicacionesService } from '../services/api'
import type { Publicacion } from '../services/api'

// Composables
const router = useRouter()

// Estado reactivo
const publicaciones = ref<Publicacion[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const eliminando = ref<string | null>(null)

// Cargar publicaciones al montar el componente
onMounted(async () => {
  await cargarPublicaciones()
})

// Métodos
const cargarPublicaciones = async () => {
  try {
    cargando.value = true
    error.value = null
    publicaciones.value = await publicacionesService.obtenerMisPublicaciones()
  } catch (err: any) {
    console.error('Error al cargar publicaciones:', err)
    error.value = err.message || 'Error al cargar las publicaciones'
  } finally {
    cargando.value = false
  }
}

const formatearEstado = (estado: string) => {
  const estados: Record<string, string> = {
    'ACTIVA': 'Activa',
    'PAUSADA': 'Pausada',
    'INACTIVA': 'Inactiva'
  }
  return estados[estado] || estado
}

const formatearEstadoModeracion = (estado: string) => {
  const estados: Record<string, string> = {
    'PENDIENTE_REVISION': 'Pendiente',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada'
  }
  return estados[estado] || estado
}

const editarPublicacion = (id: string) => {
  console.log('Editar publicación:', id)
  router.push(`/editar-publicacion/${id}`)
}

const confirmarEliminar = (publicacion: Publicacion) => {
  const confirmacion = confirm(
    `¿Estás seguro de que quieres eliminar la publicación "${publicacion.titulo}"?\n\nEsta acción no se puede deshacer.`
  )
  
  if (confirmacion) {
    eliminarPublicacion(publicacion.id)
  }
}

const eliminarPublicacion = async (id: string) => {
  try {
    eliminando.value = id
    await publicacionesService.eliminarPublicacion(id)
    
    // Remover la publicación de la lista local
    publicaciones.value = publicaciones.value.filter(p => p.id !== id)
    
    // Mostrar mensaje de éxito
    alert('Publicación eliminada exitosamente')
  } catch (err: any) {
    console.error('Error al eliminar publicación:', err)
    alert(err.response?.data?.message || 'Error al eliminar la publicación')
  } finally {
    eliminando.value = null
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>