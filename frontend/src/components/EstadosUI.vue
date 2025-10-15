<!-- EstadosUI.vue - Componente reutilizable para estados de la aplicación -->
<script setup lang="ts">
import { computed } from 'vue'

// Props del componente
interface Props {
  tipo: 'carga' | 'error' | 'vacio' | 'sin-resultados'
  titulo?: string
  mensaje?: string
  mostrarBoton?: boolean
  textoBoton?: string
  icono?: string
}

const props = withDefaults(defineProps<Props>(), {
  titulo: '',
  mensaje: '',
  mostrarBoton: false,
  textoBoton: 'Reintentar',
  icono: ''
})

// Emits para eventos
const emit = defineEmits<{
  accion: []
}>()

// Configuración por defecto según el tipo
const configuracion = computed(() => {
  switch (props.tipo) {
    case 'carga':
      return {
        titulo: props.titulo || 'Cargando...',
        mensaje: props.mensaje || 'Por favor espera mientras cargamos la información.',
        icono: 'spinner',
        colorIcono: 'text-blue-600',
        mostrarBoton: false
      }
    case 'error':
      return {
        titulo: props.titulo || 'Algo salió mal',
        mensaje: props.mensaje || 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
        icono: 'exclamation-triangle',
        colorIcono: 'text-red-500',
        mostrarBoton: props.mostrarBoton
      }
    case 'vacio':
      return {
        titulo: props.titulo || 'No hay contenido',
        mensaje: props.mensaje || 'Aún no hay información disponible.',
        icono: 'document-text',
        colorIcono: 'text-gray-400',
        mostrarBoton: props.mostrarBoton
      }
    case 'sin-resultados':
      return {
        titulo: props.titulo || 'No se encontraron resultados',
        mensaje: props.mensaje || 'Intenta ajustar los filtros o buscar con otros términos.',
        icono: 'search',
        colorIcono: 'text-gray-400',
        mostrarBoton: props.mostrarBoton
      }
    default:
      return {
        titulo: props.titulo,
        mensaje: props.mensaje,
        icono: 'information-circle',
        colorIcono: 'text-gray-400',
        mostrarBoton: props.mostrarBoton
      }
  }
})

// Función para manejar la acción del botón
const manejarAccion = () => {
  emit('accion')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Icono -->
    <div class="mb-4">
      <!-- Spinner de carga -->
      <div 
        v-if="configuracion.icono === 'spinner'"
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        role="status"
        aria-label="Cargando"
      ></div>
      
      <!-- Icono de error -->
      <svg 
        v-else-if="configuracion.icono === 'exclamation-triangle'"
        class="w-12 h-12"
        :class="configuracion.colorIcono"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
      
      <!-- Icono de documento vacío -->
      <svg 
        v-else-if="configuracion.icono === 'document-text'"
        class="w-12 h-12"
        :class="configuracion.colorIcono"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      
      <!-- Icono de búsqueda -->
      <svg 
        v-else-if="configuracion.icono === 'search'"
        class="w-12 h-12"
        :class="configuracion.colorIcono"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>
      
      <!-- Icono de información por defecto -->
      <svg 
        v-else
        class="w-12 h-12"
        :class="configuracion.colorIcono"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </div>
    
    <!-- Título -->
    <h3 
      class="text-lg font-semibold text-gray-900 mb-2"
      :class="{ 'sr-only': tipo === 'carga' }"
    >
      {{ configuracion.titulo }}
    </h3>
    
    <!-- Mensaje -->
    <p 
      class="text-gray-600 max-w-md mb-6"
      :class="{ 'sr-only': tipo === 'carga' }"
    >
      {{ configuracion.mensaje }}
    </p>
    
    <!-- Botón de acción (opcional) -->
    <button
      v-if="configuracion.mostrarBoton"
      @click="manejarAccion"
      class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      :aria-label="`${textoBoton} - ${configuracion.titulo}`"
    >
      {{ textoBoton }}
    </button>
  </div>
</template>

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
button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Clase para lectores de pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>