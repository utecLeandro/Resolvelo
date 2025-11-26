<template>
  <div class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <!-- Barra de búsqueda principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Campo de búsqueda -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="filtrosLocales.busqueda"
              type="text"
              placeholder="Buscar instrumentos musicales..."
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              @keydown.enter="aplicarFiltros"
              aria-label="Buscar instrumentos musicales"
            />
          </div>
        </div>
        
        <!-- Botones de filtros rápidos -->
        <div class="flex flex-wrap gap-2 lg:gap-3">
          <!-- Filtro de categoría -->
          <div class="relative">
            <button
              @click="toggleDropdown('categoria')"
              class="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'bg-blue-50 border-blue-300 text-blue-700': filtrosLocales.categoria }"
              aria-haspopup="true"
              :aria-expanded="dropdownAbierto === 'categoria'"
            >
              <span>{{ categoriaSeleccionada }}</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown de categorías -->
            <div
              v-if="dropdownAbierto === 'categoria'"
              class="absolute top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              @click.stop
            >
              <div class="py-1">
                <button
                  @click="seleccionarCategoria('')"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  :class="{ 'bg-blue-50 text-blue-700': !filtrosLocales.categoria }"
                >
                  Todas las categorías
                </button>
                <button
                  v-for="categoria in categorias"
                  :key="categoria.valor"
                  @click="seleccionarCategoria(categoria.valor)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  :class="{ 'bg-blue-50 text-blue-700': filtrosLocales.categoria === categoria.valor }"
                >
                  {{ categoria.etiqueta }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Filtro de ubicación -->
          <div class="relative">
            <button
              @click="toggleDropdown('ubicacion')"
              class="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'bg-blue-50 border-blue-300 text-blue-700': filtrosLocales.ciudad || filtrosLocales.departamento }"
              aria-haspopup="true"
              :aria-expanded="dropdownAbierto === 'ubicacion'"
            >
              <span>{{ ubicacionSeleccionada }}</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown de ubicación -->
            <div
              v-if="dropdownAbierto === 'ubicacion'"
              class="absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              @click.stop
            >
              <div class="p-4 space-y-3">
                <div>
                  <label for="departamento" class="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <select
                    id="departamento"
                    v-model="filtrosLocales.departamento"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    @change="filtrosLocales.ciudad = ''"
                  >
                    <option value="">Todos los departamentos</option>
                    <option v-for="depto in departamentos" :key="depto" :value="depto">
                      {{ depto }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label for="ciudad" class="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    id="ciudad"
                    v-model="filtrosLocales.ciudad"
                    type="text"
                    placeholder="Ingresa una ciudad"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div class="flex justify-end space-x-2 pt-2">
                  <button
                    @click="limpiarUbicacion"
                    class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Limpiar
                  </button>
                  <button
                    @click="cerrarDropdown"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Filtro de precio -->
          <div class="relative">
            <button
              @click="toggleDropdown('precio')"
              class="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'bg-blue-50 border-blue-300 text-blue-700': filtrosLocales.precioMinimo || filtrosLocales.precioMaximo }"
              aria-haspopup="true"
              :aria-expanded="dropdownAbierto === 'precio'"
            >
              <span>{{ precioSeleccionado }}</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown de precio -->
            <div
              v-if="dropdownAbierto === 'precio'"
              class="absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              @click.stop
            >
              <div class="p-4 space-y-3">
                <div>
                  <label for="precioMinimo" class="block text-sm font-medium text-gray-700 mb-1">
                    Precio mínimo por día
                  </label>
                  <input
                    id="precioMinimo"
                    v-model.number="filtrosLocales.precioMinimo"
                    type="number"
                    min="0"
                    placeholder="$0"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label for="precioMaximo" class="block text-sm font-medium text-gray-700 mb-1">
                    Precio máximo por día
                  </label>
                  <input
                    id="precioMaximo"
                    v-model.number="filtrosLocales.precioMaximo"
                    type="number"
                    min="0"
                    placeholder="$10000"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div class="flex justify-end space-x-2 pt-2">
                  <button
                    @click="limpiarPrecio"
                    class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Limpiar
                  </button>
                  <button
                    @click="cerrarDropdown"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Filtro de fechas -->
          <div class="relative">
            <button
              @click="toggleDropdown('fechas')"
              class="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'bg-blue-50 border-blue-300 text-blue-700': filtrosLocales.fechaInicio && filtrosLocales.fechaFin }"
              aria-haspopup="true"
              :aria-expanded="dropdownAbierto === 'fechas'"
            >
              <span>{{ fechasSeleccionadas }}</span>
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Dropdown de fechas -->
            <div
              v-if="dropdownAbierto === 'fechas'"
              class="absolute top-full mt-1 w-[340px] bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              @click.stop
            >
              <div class="p-4 space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      id="fechaInicio"
                      v-model="filtrosLocales.fechaInicio"
                      type="date"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label for="fechaFin" class="block text-sm font-medium text-gray-700 mb-1">
                      Fecha fin
                    </label>
                    <input
                      id="fechaFin"
                      v-model="filtrosLocales.fechaFin"
                      type="date"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <p v-if="mensajeErrorFechas" class="text-xs text-red-600">
                  {{ mensajeErrorFechas }}
                </p>
                
                <div class="flex justify-end space-x-2 pt-2">
                  <button
                    @click="limpiarFechas"
                    class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Limpiar
                  </button>
                  <button
                    @click="cerrarDropdown"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    :disabled="!!mensajeErrorFechas"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Botón de búsqueda -->
          <button
            @click="aplicarFiltros"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
      
      <!-- Filtros activos -->
      <div v-if="tienesFiltrosActivos" class="mt-3 flex flex-wrap gap-2">
        <span class="text-sm text-gray-600">Filtros activos:</span>
        
        <span
          v-if="filtrosLocales.categoria"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
        >
          {{ categorias.find(c => c.valor === filtrosLocales.categoria)?.etiqueta }}
          <button
            @click="seleccionarCategoria('')"
            class="ml-1 text-blue-600 hover:text-blue-800"
            aria-label="Quitar filtro de categoría"
          >
            
          </button>
        </span>
        
        <span
          v-if="filtrosLocales.departamento"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
        >
          {{ filtrosLocales.departamento }}
          <button
            @click="filtrosLocales.departamento = ''"
            class="ml-1 text-green-600 hover:text-green-800"
            aria-label="Quitar filtro de departamento"
          >
            
          </button>
        </span>
        
        <span
          v-if="filtrosLocales.ciudad"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
        >
          {{ filtrosLocales.ciudad }}
          <button
            @click="filtrosLocales.ciudad = ''"
            class="ml-1 text-green-600 hover:text-green-800"
            aria-label="Quitar filtro de ciudad"
          >
            
          </button>
        </span>
        
        <span
          v-if="filtrosLocales.precioMinimo || filtrosLocales.precioMaximo"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
        >
          ${{ filtrosLocales.precioMinimo || 0 }} - ${{ filtrosLocales.precioMaximo || '' }}
          <button
            @click="limpiarPrecio"
            class="ml-1 text-purple-600 hover:text-purple-800"
            aria-label="Quitar filtro de precio"
          >
            
          </button>
        </span>

        <span
          v-if="filtrosLocales.fechaInicio && filtrosLocales.fechaFin"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
        >
          {{ formatoEtiquetaFecha(filtrosLocales.fechaInicio) }} - {{ formatoEtiquetaFecha(filtrosLocales.fechaFin) }}
          <button
            @click="limpiarFechas"
            class="ml-1 text-yellow-600 hover:text-yellow-800"
            aria-label="Quitar filtro de fechas"
          >
            
          </button>
        </span>
        
        <button
          @click="limpiarTodosFiltros"
          class="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Limpiar todos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { FiltrosPublicacion } from '../services/api'

// Props
interface Props {
  filtros: FiltrosPublicacion
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'actualizar-filtros': [filtros: FiltrosPublicacion]
}>()

// Estado reactivo
const filtrosLocales = ref<FiltrosPublicacion>({ ...props.filtros })
const dropdownAbierto = ref<string | null>(null)

// Datos estáticos
const categorias = [
  { valor: 'GUITARRAS', etiqueta: 'Guitarras' },
  { valor: 'BATERIAS', etiqueta: 'Baterías' },
  { valor: 'TECLADOS', etiqueta: 'Teclados' },
  { valor: 'VIENTOS', etiqueta: 'Instrumentos de viento' },
  { valor: 'CUERDAS', etiqueta: 'Instrumentos de cuerda' },
  { valor: 'AMPLIFICADORES', etiqueta: 'Amplificadores' },
  { valor: 'AUDIO_PA', etiqueta: 'Audio PA' },
  { valor: 'PERCUSION', etiqueta: 'Percusión' },
  { valor: 'GRABACION', etiqueta: 'Equipos de grabación' },
  { valor: 'ILUMINACION', etiqueta: 'Iluminación' },
  { valor: 'ACCESORIOS', etiqueta: 'Accesorios' },
  { valor: 'OTROS', etiqueta: 'Otros' }
]

const departamentos = [
  'Montevideo', 'Canelones', 'Maldonado', 'Rocha', 'Treinta y Tres',
  'Cerro Largo', 'Rivera', 'Tacuarembó', 'Durazno', 'Flores',
  'Florida', 'Lavalleja', 'San José', 'Colonia', 'Soriano',
  'Río Negro', 'Paysandú', 'Salto', 'Artigas'
]

// Computed properties
const categoriaSeleccionada = computed(() => {
  if (!filtrosLocales.value.categoria) return 'Categoría'
  const categoria = categorias.find(c => c.valor === filtrosLocales.value.categoria)
  return categoria?.etiqueta || 'Categoría'
})

const ubicacionSeleccionada = computed(() => {
  const partes = []
  if (filtrosLocales.value.ciudad) partes.push(filtrosLocales.value.ciudad)
  if (filtrosLocales.value.departamento) partes.push(filtrosLocales.value.departamento)
  
  if (partes.length === 0) return 'Ubicación'
  return partes.join(', ')
})

const precioSeleccionado = computed(() => {
  const min = filtrosLocales.value.precioMinimo
  const max = filtrosLocales.value.precioMaximo
  
  if (!min && !max) return 'Precio'
  if (min && max) return `$${min} - $${max}`
  if (min) return `Desde $${min}`
  if (max) return `Hasta $${max}`
  return 'Precio'
})

const fechasSeleccionadas = computed(() => {
  const inicio = filtrosLocales.value.fechaInicio
  const fin = filtrosLocales.value.fechaFin
  if (!inicio && !fin) return 'Fechas'
  if (inicio && fin) {
    return `${formatoEtiquetaFecha(inicio)} - ${formatoEtiquetaFecha(fin)}`
  }
  if (inicio) return `Desde ${formatoEtiquetaFecha(inicio)}`
  if (fin) return `Hasta ${formatoEtiquetaFecha(fin)}`
  return 'Fechas'
})

const mensajeErrorFechas = computed(() => {
  const inicio = filtrosLocales.value.fechaInicio
  const fin = filtrosLocales.value.fechaFin
  if (inicio && fin) {
    // Validación simple: inicio <= fin
    const i = new Date(inicio)
    const f = new Date(fin)
    if (i > f) return 'La fecha inicio no puede ser posterior a la fecha fin.'
  }
  return ''
})

const tienesFiltrosActivos = computed(() => {
  return !!(
    filtrosLocales.value.categoria ||
    filtrosLocales.value.ciudad ||
    filtrosLocales.value.departamento ||
    filtrosLocales.value.precioMinimo ||
    filtrosLocales.value.precioMaximo ||
    filtrosLocales.value.busqueda ||
    (filtrosLocales.value.fechaInicio && filtrosLocales.value.fechaFin)
  )
})

// Métodos
const toggleDropdown = (tipo: string) => {
  dropdownAbierto.value = dropdownAbierto.value === tipo ? null : tipo
}

const cerrarDropdown = () => {
  dropdownAbierto.value = null
  aplicarFiltros()
}

const seleccionarCategoria = (categoria: string) => {
  filtrosLocales.value.categoria = categoria
  dropdownAbierto.value = null
  aplicarFiltros()
}

const limpiarUbicacion = () => {
  filtrosLocales.value.ciudad = ''
  filtrosLocales.value.departamento = ''
}

const limpiarPrecio = () => {
  filtrosLocales.value.precioMinimo = undefined
  filtrosLocales.value.precioMaximo = undefined
}

const limpiarFechas = () => {
  filtrosLocales.value.fechaInicio = undefined
  filtrosLocales.value.fechaFin = undefined
}

const limpiarTodosFiltros = () => {
  filtrosLocales.value = {
    busqueda: '',
    categoria: '',
    ciudad: '',
    departamento: '',
    precioMinimo: undefined,
    precioMaximo: undefined,
    fechaInicio: undefined,
    fechaFin: undefined,
  }
  aplicarFiltros()
}

const formatoEtiquetaFecha = (iso?: string) => {
  if (!iso) return ''
  try {
    const [, m, d] = iso.split('-')
    return `${d}/${m}`
  } catch {
    return iso
  }
}

const aplicarFiltros = () => {
  // Limpiar valores vacíos
  const filtrosLimpios = { ...filtrosLocales.value }
  Object.keys(filtrosLimpios).forEach(key => {
    const valor = filtrosLimpios[key as keyof FiltrosPublicacion]
    if (valor === '' || valor === null || valor === undefined) {
      delete filtrosLimpios[key as keyof FiltrosPublicacion]
    }
  })
  
  emit('actualizar-filtros', filtrosLimpios)
}

const manejarClickFuera = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    dropdownAbierto.value = null
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', manejarClickFuera)
})

onUnmounted(() => {
  document.removeEventListener('click', manejarClickFuera)
})
</script>

<style scoped>
/* Asegurar que los dropdowns estén por encima de otros elementos */
.z-50 {
  z-index: 50;
}

/* Mejorar la accesibilidad del foco */
button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

input:focus,
select:focus {
  outline: none;
  ring: 1px solid #3B82F6;
  border-color: #3B82F6;
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
