<template>
  <div class="min-h-screen bg-gray-50">
    
    <!-- Componente de filtros -->
    <FiltrosBusqueda 
      :filtros="filtros" 
      @actualizar-filtros="actualizarFiltros"
    />
    
    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Título y estadísticas -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ tituloSeccion }}
        </h1>
        <p class="text-gray-600">
          {{ estadisticasTexto }}
        </p>
      </div>
      
      <!-- Estados de carga, error y sin resultados -->
      <EstadosUI
        v-if="cargando"
        tipo="carga"
        mensaje="Cargando instrumentos musicales disponibles..."
      />
      
      <EstadosUI
        v-else-if="error"
        tipo="error"
        titulo="Error al cargar instrumentos"
        :mensaje="error"
        :mostrar-boton="true"
        texto-boton="Intentar nuevamente"
        @accion="cargarPublicaciones"
      />
      
      <EstadosUI
        v-else-if="publicaciones.length === 0 && !cargando"
        tipo="sin-resultados"
        titulo="No se encontraron instrumentos"
        mensaje="Intenta ajustar tus filtros de búsqueda o explora otras categorías."
        :mostrar-boton="true"
        texto-boton="Ver todos los instrumentos"
        @accion="limpiarFiltros"
      />
      
      <!-- Grid de publicaciones -->
      <div v-else>
        <!-- Barra de ordenamiento -->
        <div class="flex items-center justify-end mb-4">
          <label class="mr-2 text-sm text-gray-600">Ordenar por</label>
          <select
            v-model="ordenSeleccionado"
            @change="aplicarOrden"
            class="text-sm px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Ordenar publicaciones"
          >
            <option value="relevancia">Más relevantes</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <PublicacionCard
            v-for="publicacion in publicaciones"
            :key="publicacion.id"
            :publicacion="publicacion"
          />
        </div>
        
        <!-- Paginación -->
        <div v-if="totalPaginas > 1" class="flex justify-center items-center space-x-2">
          <button
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual <= 1"
            class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Página anterior"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7-7-7" />
            </svg>
          </button>
          
          <div class="flex space-x-1">
            <button
              v-for="pagina in paginasVisibles"
              :key="pagina"
              @click="cambiarPagina(pagina)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium',
                pagina === paginaActual
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
              ]"
              :aria-label="`Ir a página ${pagina}`"
              :aria-current="pagina === paginaActual ? 'page' : undefined"
            >
              {{ pagina }}
            </button>
          </div>
          
          <button
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual >= totalPaginas"
            class="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Página siguiente"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
    <!-- Footer removido: usamos PiePagina (footer global con fondo oscuro) del layout principal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicacionCard from '../components/PublicacionCard.vue'
import FiltrosBusqueda from '../components/FiltrosBusqueda.vue'
import EstadosUI from '../components/EstadosUI.vue'
import { publicacionesService, type Publicacion, type FiltrosPublicacion, type RespuestaPublicaciones } from '../services/api'

// Composables
const route = useRoute()
const router = useRouter()

// Estado reactivo
const publicaciones = ref<Publicacion[]>([])
const cargando = ref(false)
const error = ref<string | null>(null)
const totalPublicaciones = ref(0)
const paginaActual = ref(1)
const totalPaginas = ref(1)
const limite = ref(12)

// Orden seleccionado en la UI
const ordenSeleccionado = ref<'relevancia' | 'precio_asc' | 'precio_desc'>('relevancia')

// Filtros iniciales desde query params
const filtros = ref<FiltrosPublicacion>({
  busqueda: (route.query.busqueda as string) || '',
  categoria: (route.query.categoria as string) || '',
  ciudad: (route.query.ciudad as string) || '',
  departamento: (route.query.departamento as string) || '',
  precioMinimo: route.query.precioMinimo ? Number(route.query.precioMinimo) : undefined,
  precioMaximo: route.query.precioMaximo ? Number(route.query.precioMaximo) : undefined,
  fechaInicio: (route.query.fechaInicio as string) || undefined,
  fechaFin: (route.query.fechaFin as string) || undefined,
  pagina: route.query.pagina ? Number(route.query.pagina) : 1,
  limite: limite.value,
  ordenarPor: (route.query.ordenarPor as string) || 'fechaCreacion',
  direccionOrden: (route.query.direccionOrden as 'asc' | 'desc') || 'desc'
})

// Inicializar el selector según los filtros actuales
ordenSeleccionado.value = obtenerIdOrdenDesdeFiltros(filtros.value)

// Computed properties
const tituloSeccion = computed(() => {
  const tieneFechas = filtros.value.fechaInicio && filtros.value.fechaFin
  if (filtros.value.busqueda) {
    return `Resultados para "${filtros.value.busqueda}"`
  }
  if (filtros.value.categoria) {
    const categorias: Record<string, string> = {
      'GUITARRAS': 'Guitarras',
      'BATERIAS': 'Baterías',
      'TECLADOS': 'Teclados',
      'VIENTOS': 'Instrumentos de viento',
      'CUERDAS': 'Instrumentos de cuerda',
      'AMPLIFICADORES': 'Amplificadores',
      'AUDIO_PA': 'Audio PA',
      'PERCUSION': 'Percusión',
      'GRABACION': 'Equipos de grabación',
      'ILUMINACION': 'Iluminación',
      'ACCESORIOS': 'Accesorios',
      'OTROS': 'Otros instrumentos'
    }
    const base = categorias[filtros.value.categoria] || 'Instrumentos musicales'
    if (tieneFechas) {
      return `${base} disponibles entre ${formatoEtiquetaFecha(filtros.value.fechaInicio!)} y ${formatoEtiquetaFecha(filtros.value.fechaFin!)}`
    }
    return base
  }
  if (tieneFechas) {
    return `Instrumentos disponibles entre ${formatoEtiquetaFecha(filtros.value.fechaInicio!)} y ${formatoEtiquetaFecha(filtros.value.fechaFin!)}`
  }
  return 'Instrumentos musicales disponibles'
})

const estadisticasTexto = computed(() => {
  if (cargando.value) return 'Cargando...'
  if (totalPublicaciones.value === 0) return 'No se encontraron instrumentos'
  if (totalPublicaciones.value === 1) return '1 instrumento disponible'
  return `${totalPublicaciones.value.toLocaleString()} instrumentos disponibles`
})

const paginasVisibles = computed(() => {
  const paginas = []
  const inicio = Math.max(1, paginaActual.value - 2)
  const fin = Math.min(totalPaginas.value, paginaActual.value + 2)
  
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  
  return paginas
})

// Métodos
const cargarPublicaciones = async () => {
  try {
    cargando.value = true
    error.value = null
    
    let respuesta: RespuestaPublicaciones
    if (filtros.value.fechaInicio && filtros.value.fechaFin) {
      const { fechaInicio, fechaFin, ...otrosFiltros } = filtros.value
      respuesta = await publicacionesService.obtenerPublicacionesDisponibles(
        fechaInicio!,
        fechaFin!,
        otrosFiltros
      )
    } else {
      respuesta = await publicacionesService.obtenerPublicaciones(filtros.value)
    }
    
    publicaciones.value = respuesta.publicaciones
    totalPublicaciones.value = respuesta.paginacion.totalElementos
    paginaActual.value = respuesta.paginacion.paginaActual
    totalPaginas.value = respuesta.paginacion.totalPaginas
    
  } catch (err) {
    console.error('Error al cargar publicaciones:', err)
    error.value = 'No se pudieron cargar los instrumentos. Por favor, intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

const actualizarFiltros = (nuevosFiltros: FiltrosPublicacion) => {
  filtros.value = { ...nuevosFiltros, pagina: 1, limite: limite.value }
  actualizarURL()
  cargarPublicaciones()
}

const cambiarPagina = (nuevaPagina: number) => {
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
    filtros.value.pagina = nuevaPagina
    paginaActual.value = nuevaPagina
    actualizarURL()
    cargarPublicaciones()
    
    // Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const limpiarFiltros = () => {
  filtros.value = {
    pagina: 1,
    limite: limite.value,
    ordenarPor: 'fechaCreacion',
    direccionOrden: 'desc'
  }
  actualizarURL()
  cargarPublicaciones()
}

// Mapear el selector de orden a los parámetros del backend
function obtenerIdOrdenDesdeFiltros(f: FiltrosPublicacion): 'relevancia' | 'precio_asc' | 'precio_desc' {
  if (f.ordenarPor === 'precioPorDia') {
    return f.direccionOrden === 'asc' ? 'precio_asc' : 'precio_desc'
  }
  // Por defecto mostramos "Más relevantes"
  return 'relevancia'
}

const aplicarOrden = () => {
  switch (ordenSeleccionado.value) {
    case 'precio_asc':
      filtros.value.ordenarPor = 'precioPorDia'
      filtros.value.direccionOrden = 'asc'
      break
    case 'precio_desc':
      filtros.value.ordenarPor = 'precioPorDia'
      filtros.value.direccionOrden = 'desc'
      break
    default:
      filtros.value.ordenarPor = 'calificacionPromedio'
      filtros.value.direccionOrden = 'desc'
      break
  }
  filtros.value.pagina = 1
  actualizarURL()
  cargarPublicaciones()
}

const formatoEtiquetaFecha = (iso: string) => {
  try {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}`
  } catch {
    return iso
  }
}

const actualizarURL = () => {
  const query: Record<string, string> = {}
  
  Object.entries(filtros.value).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && key !== 'limite') {
      query[key] = value.toString()
    }
  })
  
  router.replace({ query })
}

// Watchers
watch(() => route.query, (newQuery) => {
  // Actualizar filtros cuando cambien los query params
  filtros.value = {
    busqueda: (newQuery.busqueda as string) || '',
    categoria: (newQuery.categoria as string) || '',
    ciudad: (newQuery.ciudad as string) || '',
    departamento: (newQuery.departamento as string) || '',
    precioMinimo: newQuery.precioMinimo ? Number(newQuery.precioMinimo) : undefined,
    precioMaximo: newQuery.precioMaximo ? Number(newQuery.precioMaximo) : undefined,
    fechaInicio: (newQuery.fechaInicio as string) || undefined,
    fechaFin: (newQuery.fechaFin as string) || undefined,
    pagina: newQuery.pagina ? Number(newQuery.pagina) : 1,
    limite: limite.value,
    ordenarPor: (newQuery.ordenarPor as string) || 'fechaCreacion',
    direccionOrden: (newQuery.direccionOrden as 'asc' | 'desc') || 'desc'
  }
  // Mantener sincronizado el selector de orden
  ordenSeleccionado.value = obtenerIdOrdenDesdeFiltros(filtros.value)
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  cargarPublicaciones()
})
</script>

<style scoped>
/* Animación de carga */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transiciones suaves */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Mejorar la accesibilidad del foco */
button:focus,
a:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Asegurar que el grid sea responsive */
@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 640px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
