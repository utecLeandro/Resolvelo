<template>
  <div class="min-h-screen">
    <!-- Breadcrumb y navegación de regreso -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <button 
            @click="$router.go(-1)"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Volver atrás"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/catalogo" class="text-gray-500 hover:text-gray-700">
                  Catálogo
                </router-link>
              </li>
              <li>
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </li>
              <li>
                <span class="text-gray-900 font-medium">Detalle del instrumento</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Estados de carga y error -->
      <EstadosUI
        v-if="cargando"
        tipo="carga"
        mensaje="Cargando detalles del instrumento..."
      />

      <EstadosUI
        v-else-if="error"
        tipo="error"
        titulo="Error al cargar el instrumento"
        :mensaje="error"
        :mostrar-boton="true"
        texto-boton="Intentar nuevamente"
        @accion="cargarPublicacion"
      />

      <!-- Detalle de la publicación -->
      <div v-else-if="publicacion" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Galería de imágenes -->
        <div class="space-y-4">
          <!-- Imagen principal -->
          <div class="aspect-w-16 aspect-h-12 bg-gray-200 rounded-xl overflow-hidden">
            <img
              :src="imagenPrincipal"
              :alt="publicacion.titulo"
              class="w-full h-full object-cover"
              @error="manejarErrorImagen"
            />
          </div>
          
          <!-- Miniaturas -->
          <div v-if="publicacion.imagenes && publicacion.imagenes.length > 1" class="grid grid-cols-4 gap-2">
            <button
              v-for="(imagen, index) in publicacion.imagenes.slice(0, 4)"
              :key="imagen.id"
              @click="cambiarImagenPrincipal(imagen.url)"
              :class="[
                'aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden border-2 transition-colors',
                imagenPrincipal === imagen.url ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
              ]"
            >
              <img
                :src="imagen.url"
                :alt="`${publicacion.titulo} - imagen ${index + 1}`"
                class="w-full h-full object-cover"
                @error="manejarErrorImagen"
              />
            </button>
          </div>
        </div>

        <!-- Información del instrumento -->
        <div class="space-y-6">
          <!-- Título y ubicación -->
          <div>
            <div class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {{ categoriaTexto }}
              </span>
              <span>•</span>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ publicacion.ciudad }}, {{ publicacion.departamento }}
              </div>
            </div>
            
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ publicacion.titulo }}</h1>
            
            <!-- Calificación y estadísticas -->
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <div v-if="publicacion.calificacionPromedio" class="flex items-center">
                <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="font-medium">{{ publicacion.calificacionPromedio.toFixed(1) }}</span>
                <span class="ml-1">({{ publicacion.totalCalificaciones }} reseñas)</span>
              </div>
              <span>•</span>
              <span>{{ publicacion.totalReservas }} alquileres</span>
            </div>
          </div>

          <!-- Información del equipo -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 class="font-semibold text-gray-900">Detalles del equipo</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="publicacion.marca">
                <span class="text-gray-600">Marca:</span>
                <span class="ml-2 font-medium">{{ publicacion.marca }}</span>
              </div>
              <div v-if="publicacion.modelo">
                <span class="text-gray-600">Modelo:</span>
                <span class="ml-2 font-medium">{{ publicacion.modelo }}</span>
              </div>
              <div v-if="publicacion.anioFabricacion">
                <span class="text-gray-600">Año:</span>
                <span class="ml-2 font-medium">{{ publicacion.anioFabricacion }}</span>
              </div>
              <div v-if="publicacion.estadoEquipo">
                <span class="text-gray-600">Estado:</span>
                <span class="ml-2 font-medium">{{ estadoTexto }}</span>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div v-if="publicacion.descripcion">
            <h3 class="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p class="text-gray-700 leading-relaxed">{{ publicacion.descripcion }}</p>
          </div>

          <!-- Precios -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Precios de alquiler</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Por día</span>
                <span class="text-2xl font-bold text-gray-900">${{ publicacion.precioPorDia }}</span>
              </div>
              <div v-if="publicacion.precioPorSemana" class="flex justify-between items-center">
                <span class="text-gray-600">Por semana</span>
                <span class="text-xl font-semibold text-gray-900">${{ publicacion.precioPorSemana }}</span>
              </div>
              <div v-if="publicacion.precioPorMes" class="flex justify-between items-center">
                <span class="text-gray-600">Por mes</span>
                <span class="text-xl font-semibold text-gray-900">${{ publicacion.precioPorMes }}</span>
              </div>
              <div v-if="publicacion.deposito" class="flex justify-between items-center pt-3 border-t border-gray-200">
                <span class="text-gray-600">Depósito de garantía</span>
                <span class="font-semibold text-gray-900">${{ publicacion.deposito }}</span>
              </div>
            </div>
            
            <!-- Información de alquiler -->
            <div class="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <div v-if="publicacion.diasMinimoAlquiler">
                Alquiler mínimo: {{ publicacion.diasMinimoAlquiler }} días
              </div>
              <div v-if="publicacion.diasMaximoAlquiler">
                Alquiler máximo: {{ publicacion.diasMaximoAlquiler }} días
              </div>
            </div>
          </div>

          <!-- Opciones de entrega -->
          <div v-if="tieneOpcionesEntrega" class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Opciones de entrega</h3>
            <div class="space-y-3">
              <div v-if="publicacion.entregaDomicilio">
                <span class="text-green-600 font-medium">✓ Entrega a domicilio</span>
              </div>
              <div v-if="publicacion.retiroLocal">
                <span class="text-green-600 font-medium">✓ Retiro en local</span>
              </div>
            </div>
          </div>

          <!-- Botón de contacto -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <button
              @click="contactarPropietario"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Contactar para alquilar
            </button>
            <p v-if="!usuarioAutenticado" class="text-xs text-gray-500 text-center mt-2">
              Necesitas iniciar sesión para contactar al propietario
            </p>
            <p v-else class="text-xs text-green-600 text-center mt-2">
              ✓ Listo para contactar al propietario
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EstadosUI from '../components/EstadosUI.vue'
import { publicacionesService } from '../services/api'
import type { Publicacion } from '../services/api'

// Composables
const route = useRoute()
const router = useRouter()

// Estado reactivo
const publicacion = ref<Publicacion | null>(null)
const cargando = ref(false)
const error = ref<string | null>(null)
const imagenPrincipal = ref<string>('')
const usuarioAutenticado = ref(false)
const datosUsuario = ref<any>(null)

// Computed properties
const categoriaTexto = computed(() => {
  if (!publicacion.value?.categoria) return ''
  
  const categorias: Record<string, string> = {
    'Guitars': 'Guitarras',
    'Drums': 'Batería',
    'Keyboards': 'Teclados',
    'Winds': 'Instrumentos de viento',
    'Strings': 'Instrumentos de cuerda',
    'Amplifiers': 'Amplificadores',
    'PA_Audio': 'Audio PA',
    'Percussion': 'Percusión',
    'Recording': 'Equipos de grabación',
    'Lighting': 'Iluminación',
    'Accessories': 'Accesorios',
    'Others': 'Otros'
  }
  
  return categorias[publicacion.value.categoria] || publicacion.value.categoria
})

const estadoTexto = computed(() => {
  if (!publicacion.value?.estadoEquipo) return ''
  
  const estados: Record<string, string> = {
    'EXCELENTE': 'Excelente',
    'MUY_BUENO': 'Muy bueno',
    'BUENO': 'Bueno',
    'REGULAR': 'Regular',
    'NECESITA_REPARACION': 'Necesita reparación'
  }
  
  return estados[publicacion.value.estadoEquipo] || publicacion.value.estadoEquipo
})

const tieneOpcionesEntrega = computed(() => {
  return publicacion.value?.entregaDomicilio || publicacion.value?.retiroLocal
})

// Métodos
const verificarAutenticacion = () => {
  try {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      usuarioAutenticado.value = true
      datosUsuario.value = JSON.parse(userData)
    } else {
      usuarioAutenticado.value = false
      datosUsuario.value = null
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error)
    usuarioAutenticado.value = false
    datosUsuario.value = null
  }
}

const cargarPublicacion = async () => {
  const id = route.params.id as string
  
  if (!id) {
    error.value = 'ID de publicación no válido'
    return
  }
  
  try {
    cargando.value = true
    error.value = null
    
    publicacion.value = await publicacionesService.obtenerPublicacionPorId(id)
    
    // Configurar imagen principal
    if (publicacion.value?.imagenes && publicacion.value.imagenes.length > 0) {
      imagenPrincipal.value = publicacion.value.imagenes[0].url
    } else {
      imagenPrincipal.value = '/placeholder-instrument.jpg'
    }
    
  } catch (err) {
    console.error('Error al cargar publicación:', err)
    error.value = 'No se pudo cargar la información del instrumento. Por favor, intenta nuevamente.'
  } finally {
    cargando.value = false
  }
}

const cambiarImagenPrincipal = (url: string) => {
  imagenPrincipal.value = url
}

const manejarErrorImagen = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-instrument.jpg'
}

const contactarPropietario = () => {
  if (!usuarioAutenticado.value) {
    // Redirigir al login con mensaje de que necesita autenticarse
    router.push({
      path: '/login',
      query: {
        redirect: route.fullPath,
        message: 'Inicia sesión para contactar al propietario del instrumento'
      }
    })
  } else {
    // Usuario autenticado - implementar lógica de contacto
    // Por ahora mostrar un mensaje de confirmación
    alert(`¡Hola ${datosUsuario.value?.nombre}! La funcionalidad de contacto se implementará próximamente.`)
  }
}

// Lifecycle hooks
onMounted(() => {
  verificarAutenticacion()
  cargarPublicacion()
})

// Expose reactive properties and methods
defineExpose({
  publicacion,
  cargando,
  error,
  imagenPrincipal,
  cargarPublicacion,
  cambiarImagenPrincipal,
  contactarPropietario,
  estadoTexto,
  categoriaTexto,
  tieneOpcionesEntrega
})
</script>

<style scoped>
/* Aspect ratio utilities */
.aspect-w-16 {
  position: relative;
  padding-bottom: 75%; /* 16:12 ratio */
}

.aspect-w-1 {
  position: relative;
  padding-bottom: 100%; /* 1:1 ratio */
}

.aspect-w-16 > img,
.aspect-w-1 > img {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

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

/* Estilos para el grid responsive */
@media (max-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>