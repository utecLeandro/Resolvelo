<template>
  <div 
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group"
    @click="navegarADetalle"
    role="button"
    tabindex="0"
    @keydown.enter="navegarADetalle"
    @keydown.space.prevent="navegarADetalle"
    :aria-label="`Ver detalles de ${publicacion.titulo}`"
  >
    <!-- Contenedor de icono musical -->
    <div class="relative aspect-square overflow-hidden rounded-t-xl bg-gradient-to-br from-blue-50 to-indigo-100">
      <!-- Icono musical -->
      <div class="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <svg class="h-16 w-16 text-blue-400" fill="currentColor" viewBox="0 0 24 24" :aria-label="`Icono de ${publicacion.titulo}`">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      
      <!-- Badge de categoría -->
      <div class="absolute top-3 left-3">
        <span class="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
          {{ formatearCategoria(publicacion.categoria) }}
        </span>
      </div>
      
      <!-- Badge de disponibilidad -->
      <div class="absolute top-3 right-3">
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
      </div>

    </div>
    
    <!-- Contenido de la tarjeta -->
    <div class="p-4">
      <!-- Ubicación -->
      <div class="flex items-center text-gray-600 text-sm mb-2">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        <span class="truncate">{{ ubicacionCompleta }}</span>
      </div>
      
      <!-- Título -->
      <h3 class="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
        {{ publicacion.titulo }}
      </h3>
      
      <!-- Marca y modelo -->
      <div v-if="publicacion.marca || publicacion.modelo" class="text-gray-600 text-sm mb-2">
        <span v-if="publicacion.marca">{{ publicacion.marca }}</span>
        <span v-if="publicacion.marca && publicacion.modelo"> - </span>
        <span v-if="publicacion.modelo">{{ publicacion.modelo }}</span>
      </div>
      
      <!-- Calificación y reseñas -->
      <div v-if="publicacion.calificacionPromedio" class="flex items-center mb-3">
        <div class="flex items-center">
          <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-sm font-medium text-gray-900">
            {{ publicacion.calificacionPromedio.toFixed(1) }}
          </span>
          <span class="text-sm text-gray-600 ml-1">
            ({{ publicacion.totalCalificaciones }})
          </span>
        </div>
      </div>
      
      <!-- Precio -->
      <div class="flex items-baseline justify-between">
        <div>
          <span class="text-xl font-bold text-gray-900">
            ${{ formatearPrecio(publicacion.precioPorDia) }}
          </span>
          <span class="text-gray-600 text-sm ml-1">por día</span>
        </div>
        
        <!-- Opciones de entrega -->
        <div class="flex space-x-1">
          <span 
            v-if="publicacion.entregaDomicilio"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            title="Entrega a domicilio disponible"
          >
            🚚
          </span>
          <span 
            v-if="publicacion.retiroLocal"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
            title="Retiro en local disponible"
          >
            🏪
          </span>
        </div>
      </div>
      
      <!-- Información adicional -->
      <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Mín. {{ publicacion.diasMinimoAlquiler }} día{{ publicacion.diasMinimoAlquiler > 1 ? 's' : '' }}</span>
        <span>{{ publicacion.visualizaciones }} vistas</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Publicacion } from '../services/api'

// Props
interface Props {
  publicacion: Publicacion
}

const props = defineProps<Props>()

// Composables
const router = useRouter()

// Computed properties eliminadas: imagenPrincipal, totalImagenes

const ubicacionCompleta = computed(() => {
  const partes = [props.publicacion.ciudad, props.publicacion.departamento].filter(Boolean)
  return partes.join(', ')
})

// Métodos
const navegarADetalle = () => {
  router.push(`/publicacion/${props.publicacion.id}`)
}

// Método eliminado: manejarErrorImagen

const formatearCategoria = (categoria: string): string => {
  // Convertir categorías del enum a texto legible
  const categorias: Record<string, string> = {
    'GUITARRAS': 'Guitarras',
    'BATERIAS': 'Baterías',
    'TECLADOS': 'Teclados',
    'VIENTOS': 'Instrumentos de Viento',
    'CUERDAS': 'Instrumentos de Cuerda',
    'AMPLIFICADORES': 'Amplificadores',
    'AUDIO_PA': 'Audio PA',
    'PERCUSION': 'Percusión',
    'GRABACION': 'Equipos de Grabación',
    'ILUMINACION': 'Iluminación',
    'ACCESORIOS': 'Accesorios',
    'OTROS': 'Otros'
  }
  
  return categorias[categoria] || categoria
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}
</script>

<style scoped>
/* Utilidad para limitar líneas de texto */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Asegurar que las tarjetas tengan altura consistente */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Mejorar la accesibilidad del foco */
.group:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Transiciones suaves */
.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>