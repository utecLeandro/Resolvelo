<template>
  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-6 overflow-x-hidden">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de publicaciones</h1>
        <p class="text-sm text-gray-600">Listado y moderación de publicaciones</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="cargarPublicaciones(1)"
          :disabled="isLoading"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-16 0m16 8a8 8 0 01-16 0" />
          </svg>
          Refrescar
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="col-span-1 md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="busqueda">Buscar</label>
          <input
            id="busqueda"
            v-model="busqueda"
            type="text"
            placeholder="Título, descripción..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @keyup.enter="aplicarFiltros"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="categoria">Categoría</label>
          <select
            id="categoria"
            v-model="categoria"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="aplicarFiltros"
          >
            <option value="">Todas</option>
            <option v-for="c in categorias" :key="c.valor" :value="c.valor">
              {{ c.etiqueta }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="ordenarPor">Ordenar por</label>
          <select
            id="ordenarPor"
            v-model="ordenarPor"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="aplicarFiltros"
          >
            <option value="fechaCreacion">Fecha de creación</option>
            <option value="precioPorDia">Precio por día</option>
            <option value="visualizaciones">Visualizaciones</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="estadoModeracion">Estado de moderación</label>
          <select
            id="estadoModeracion"
            v-model="estadoModeracion"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="aplicarFiltros"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE_REVISION">Pendiente de revisión</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
          </select>
        </div>
        
      </div>
      <div class="mt-4 flex justify-end">
        <button
          class="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="limpiarFiltros"
          :disabled="isLoading"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Estados -->
    <div v-if="isLoading" class="flex items-center gap-2 text-gray-700 mb-4">
      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16 8 8 0 010-16z"></path>
      </svg>
      Cargando publicaciones...
    </div>

    <div v-if="errorMensaje" class="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
      <div class="flex justify-between items-start">
        <div>
          <strong class="font-semibold">Error:</strong> {{ errorMensaje }}
          <div v-if="errorCodigo === 401 || errorCodigo === 403" class="mt-2">
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Iniciar sesión
            </RouterLink>
          </div>
        </div>
        <button
          class="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          @click="cargarPublicaciones(1)"
        >
          Reintentar
        </button>
      </div>
    </div>

    <div v-if="!isLoading && !errorMensaje && (!publicaciones || publicaciones.length === 0)" class="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
      No hay publicaciones para mostrar.
    </div>

    <!-- Tabla -->
    <div v-if="!isLoading && !errorMensaje && publicaciones && publicaciones.length > 0" class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div>
        <table class="min-w-full w-full table-fixed divide-y divide-gray-200">
          <colgroup>
            <col style="width:24%" />
            <col style="width:14%" />
            <col style="width:20%" />
            <col style="width:12%" />
            <col style="width:10%" />
            <col style="width:20%" />
          </colgroup>
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moderación</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pub in publicaciones" :key="pub.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <div class="text-sm font-medium text-gray-900">{{ pub.titulo }}</div>
                <div class="text-xs text-gray-500 break-all">ID: {{ pub.id }}</div>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {{ formatearCategoria(pub.categoria) }}
                </span>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <div class="flex items-center">
                  <div class="w-8 h-8 shrink-0 aspect-square bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                    {{ obtenerIniciales(pub.propietario?.nombre, pub.propietario?.apellido) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ pub.propietario?.nombre || '—' }} {{ pub.propietario?.apellido || '' }}
                    </div>
                    <div class="text-xs text-gray-500 break-all">ID: {{ pub.propietarioId || pub.propietario?.id || '—' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="estadoBadgeClass(pub.estadoModeracion)">
                  {{ pub.estadoModeracion || '—' }}
                </span>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words text-sm text-gray-500">
                {{ formatearFecha(pub.fechaCreacion) }}
              </td>
              <td class="px-6 py-4 align-top text-right text-sm font-medium">
                <div class="flex flex-wrap justify-end gap-2">
                  <RouterLink
                    :to="`/publicacion/${pub.id}`"
                    class="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    Ver
                  </RouterLink>
                  <RouterLink
                    :to="`/editar-publicacion/${pub.id}`"
                    class="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Editar
                  </RouterLink>
                  <button
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                    @click="eliminar(pub.id)"
                  >
                    Eliminar
                  </button>
                  <template v-if="pub.estadoModeracion === 'PENDIENTE_REVISION' || pub.estadoModeracion === 'EN_REVISION'">
                    <button
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                      @click="aprobar(pub.id)"
                    >
                      Aprobar
                    </button>
                    <button
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
                      @click="rechazar(pub.id)"
                    >
                      Rechazar
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Página {{ paginacion.paginaActual }} de {{ paginacion.totalPaginas }} — Total: {{ paginacion.totalElementos }} publicaciones
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="paginacion.paginaActual <= 1 || isLoading"
            @click="cargarPublicaciones(paginacion.paginaActual - 1)"
          >
            Anterior
          </button>
          <button
            class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="paginacion.paginaActual >= paginacion.totalPaginas || isLoading"
            @click="cargarPublicaciones(paginacion.paginaActual + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
    <!-- Modal de rechazo -->
    <BaseModal
      :is-open="mostrarModalRechazo"
      title="Rechazar publicación"
      @close="cerrarModalRechazo"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          Por favor, indica el motivo por el cual estás rechazando esta publicación.
          Este mensaje será enviado al propietario.
        </p>
        
        <div>
          <label for="motivo" class="block text-sm font-medium text-gray-700">Motivo del rechazo</label>
          <textarea
            id="motivo"
            v-model="motivoRechazo"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Ej: Las fotos no cumplen con los requisitos de calidad..."
          ></textarea>
        </div>

        <div v-if="errorRechazo" class="text-sm text-red-600">
          {{ errorRechazo }}
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          @click="cerrarModalRechazo"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          :disabled="!motivoRechazo.trim() || procesandoRechazo"
          @click="confirmarRechazo"
        >
          <span v-if="procesandoRechazo" class="mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16 8 8 0 010-16z"></path>
            </svg>
          </span>
          Rechazar publicación
        </button>
      </template>
    </BaseModal>

    <!-- Modal de eliminación -->
    <BaseModal
      :is-open="mostrarModalEliminar"
      title="Eliminar publicación"
      @close="cerrarModalEliminar"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
        </p>

        <div v-if="errorEliminacion" class="text-sm text-red-600">
          {{ errorEliminacion }}
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          @click="cerrarModalEliminar"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          :disabled="procesandoEliminacion"
          @click="confirmarEliminacion"
        >
          <span v-if="procesandoEliminacion" class="mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16 8 8 0 010-16z"></path>
            </svg>
          </span>
          Eliminar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import BaseModal from '../components/common/BaseModal.vue'
import { type Publicacion, type RespuestaPublicaciones } from '../services/api'
import { adminService } from '../services/admin'

// Estado
const publicaciones = ref<Publicacion[]>([])
const paginacion = ref({ paginaActual: 1, totalPaginas: 1, totalElementos: 0, elementosPorPagina: 10 })
const isLoading = ref(false)
const errorMensaje = ref<string | null>(null)
const errorCodigo = ref<number | null>(null)

// Estado para modal de rechazo
const mostrarModalRechazo = ref(false)
const publicacionARechazar = ref<string | null>(null)
const motivoRechazo = ref('')
const procesandoRechazo = ref(false)
const errorRechazo = ref('')

// Estado para modal de eliminación
const mostrarModalEliminar = ref(false)
const publicacionAEliminar = ref<string | null>(null)
const procesandoEliminacion = ref(false)
const errorEliminacion = ref('')

// Catálogo de categorías (enum) — alineado con FiltrosBusqueda.vue
const categorias = [
  { valor: 'GUITARRAS', etiqueta: 'Guitarras' },
  { valor: 'BATERIAS', etiqueta: 'Baterías' },
  { valor: 'TECLADOS', etiqueta: 'Teclados' },
  { valor: 'VIENTOS', etiqueta: 'Vientos' },
  { valor: 'CUERDAS', etiqueta: 'Cuerdas' },
  { valor: 'AMPLIFICADORES', etiqueta: 'Amplificadores' },
  { valor: 'AUDIO_PA', etiqueta: 'Audio PA' },
  { valor: 'PERCUSION', etiqueta: 'Percusión' },
  { valor: 'GRABACION', etiqueta: 'Home Studio' },
  { valor: 'ILUMINACION', etiqueta: 'Iluminación' },
  { valor: 'ACCESORIOS', etiqueta: 'Accesorios' },
  { valor: 'OTROS', etiqueta: 'Otros' },
  { valor: 'AUDIO_PA', etiqueta: 'Micrófonos' },
  { valor: 'ACCESORIOS', etiqueta: 'Fundas' },
  { valor: 'PERCUSION', etiqueta: 'Platillos' },
  { valor: 'GUITARRAS', etiqueta: 'Bajos' },
]

// Filtros
const busqueda = ref('')
const categoria = ref('')
const ordenarPor = ref('fechaCreacion')
const direccionOrden = ref<'asc' | 'desc'>('desc')
const estadoModeracion = ref('')

function aplicarFiltros() {
  cargarPublicaciones(1)
}

function limpiarFiltros() {
  busqueda.value = ''
  categoria.value = ''
  ordenarPor.value = 'fechaCreacion'
  direccionOrden.value = 'desc'
  estadoModeracion.value = ''
  cargarPublicaciones(1)
}

async function cargarPublicaciones(pagina = 1) {
  try {
    isLoading.value = true
    errorMensaje.value = null
    errorCodigo.value = null
    const resp: RespuestaPublicaciones = await adminService.listarPublicacionesAdmin({
      busqueda: busqueda.value || undefined,
      categoria: categoria.value || undefined,
      ordenarPor: ordenarPor.value,
      direccionOrden: direccionOrden.value,
      incluirTodosEstadosModeracion: !estadoModeracion.value,
      estadoModeracion: estadoModeracion.value || undefined,
      pagina,
      limite: paginacion.value.elementosPorPagina,
    })
    publicaciones.value = resp.publicaciones || []
    paginacion.value = resp.paginacion || paginacion.value
  } catch (err: any) {
    console.error('Error cargando publicaciones', err)
    const status = err?.response?.status
    errorCodigo.value = typeof status === 'number' ? status : null
    if (status === 401) {
      errorMensaje.value = 'No autorizado. Inicia sesión con una cuenta de administrador.'
    } else if (status === 403) {
      errorMensaje.value = 'Acceso denegado. Necesitas rol de administrador para ver esta página.'
    } else {
      errorMensaje.value = err?.response?.data?.message || err?.message || 'Error al cargar publicaciones'
    }
  } finally {
    isLoading.value = false
  }
}

function formatearFecha(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString()
}

function formatearCategoria(valor?: string) {
  if (!valor) return '—'
  const cat = categorias.find(c => c.valor === valor)
  return cat?.etiqueta || valor
}

function obtenerIniciales(nombre?: string, apellido?: string) {
  const n = (nombre || '').trim()
  const a = (apellido || '').trim()
  const ini = [n[0], a[0]].filter(Boolean).join('')
  return ini ? ini.toUpperCase() : 'PR'
}

function estadoBadgeClass(estado?: string) {
  switch (estado) {
    case 'APROBADA':
      return 'bg-green-100 text-green-800'
    case 'RECHAZADA':
      return 'bg-red-100 text-red-800'
    case 'PENDIENTE':
    case 'PENDIENTE_REVISION':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// === Lógica de Eliminación ===

function eliminar(id: string) {
  publicacionAEliminar.value = id
  errorEliminacion.value = ''
  mostrarModalEliminar.value = true
}

function cerrarModalEliminar() {
  mostrarModalEliminar.value = false
  publicacionAEliminar.value = null
  errorEliminacion.value = ''
}

async function confirmarEliminacion() {
  if (!publicacionAEliminar.value) return

  try {
    procesandoEliminacion.value = true
    errorEliminacion.value = ''
    await adminService.eliminarPublicacion(publicacionAEliminar.value)
    cerrarModalEliminar()
    await cargarPublicaciones(paginacion.value.paginaActual)
  } catch (err: any) {
    console.error('Error al eliminar publicación', err)
    errorEliminacion.value = err?.response?.data?.message || err?.message || 'Error al eliminar la publicación'
  } finally {
    procesandoEliminacion.value = false
  }
}

// === Lógica de Aprobación ===

async function aprobar(id: string) {
  try {
    isLoading.value = true
    await adminService.aprobarPublicacion(id)
    await cargarPublicaciones(paginacion.value.paginaActual)
  } catch (err: any) {
    console.error('Error al aprobar publicación', err)
    const status = err?.response?.status
    errorCodigo.value = typeof status === 'number' ? status : null
    if (status === 401) {
      errorMensaje.value = 'No autorizado. Inicia sesión con una cuenta de administrador.'
    } else if (status === 403) {
      errorMensaje.value = 'Acceso denegado. Necesitas rol de administrador.'
    } else {
      errorMensaje.value = err?.response?.data?.message || err?.message || 'Error al aprobar publicación'
    }
  } finally {
    isLoading.value = false
  }
}

// === Lógica de Rechazo ===

function rechazar(id: string) {
  publicacionARechazar.value = id
  motivoRechazo.value = ''
  errorRechazo.value = ''
  mostrarModalRechazo.value = true
}

function cerrarModalRechazo() {
  mostrarModalRechazo.value = false
  publicacionARechazar.value = null
  motivoRechazo.value = ''
  errorRechazo.value = ''
}

async function confirmarRechazo() {
  if (!publicacionARechazar.value) return
  if (!motivoRechazo.value.trim()) {
    errorRechazo.value = 'Debes indicar un motivo para el rechazo.'
    return
  }

  try {
    procesandoRechazo.value = true
    errorRechazo.value = ''
    await adminService.rechazarPublicacion(publicacionARechazar.value, motivoRechazo.value)
    cerrarModalRechazo()
    await cargarPublicaciones(paginacion.value.paginaActual)
  } catch (err: any) {
    console.error('Error al rechazar publicación', err)
    errorRechazo.value = err?.response?.data?.message || err?.message || 'Error al rechazar la publicación'
  } finally {
    procesandoRechazo.value = false
  }
}

onMounted(() => {
  cargarPublicaciones()
})
</script>

<style scoped>
table th, table td { white-space: nowrap; }
</style>
