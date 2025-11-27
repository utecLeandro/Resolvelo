<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Encabezado -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Editar Publicación</h1>
        <p class="mt-2 text-gray-600">Modifica la información de tu instrumento musical</p>
      </div>

      <!-- Estado de carga -->
      <div v-if="cargandoPublicacion" class="text-center py-8">
        <div class="text-gray-600">Cargando información de la publicación...</div>
      </div>

      <!-- Error al cargar -->
      <div v-else-if="errorCarga" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="text-red-800">{{ errorCarga }}</div>
        <button 
          @click="$router.push('/mis-publicaciones')"
          class="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Volver a mis publicaciones
        </button>
      </div>

      <!-- Formulario -->
      <div v-else class="bg-white shadow-sm rounded-lg">
        <form @submit.prevent="actualizarPublicacion" class="p-6 space-y-6">
          <!-- Título -->
          <div>
            <label for="titulo" class="block text-sm font-medium text-gray-700 mb-2">
              Título de la publicación *
            </label>
            <input
              id="titulo"
              v-model="formulario.titulo"
              type="text"
              required
              placeholder="Ej: Guitarra Acústica Yamaha FG800"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Categoría -->
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              id="categoria"
              v-model="formulario.categoria"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              <option value="GUITARRAS">Guitarras</option>
              <option value="BATERIAS">Baterías</option>
              <option value="TECLADOS">Teclados</option>
              <option value="VIENTOS">Instrumentos de viento</option>
              <option value="CUERDAS">Instrumentos de cuerda</option>
              <option value="AMPLIFICADORES">Amplificadores</option>
              <option value="AUDIO_PA">Audio PA</option>
              <option value="PERCUSION">Percusión</option>
              <option value="GRABACION">Equipos de grabación</option>
              <option value="ILUMINACION">Iluminación</option>
              <option value="ACCESORIOS">Accesorios</option>
              <option value="OTROS">Otros</option>
              <!-- Alias solicitados -->
              <option value="AUDIO_PA">Micrófonos</option>
              <option value="ACCESORIOS">Fundas</option>
              <option value="PERCUSION">Platillos</option>
              <option value="GUITARRAS">Bajos</option>
              <option value="GRABACION">Home Studio</option>
              <option value="VIENTOS">Vientos</option>
              <option value="CUERDAS">Cuerdas</option>
            </select>
          </div>

          <!-- Marca, Modelo y Año -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="marca" class="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                id="marca"
                v-model="formulario.marca"
                type="text"
                placeholder="Ej: Yamaha, Fender, Gibson"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="modelo" class="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <input
                id="modelo"
                v-model="formulario.modelo"
                type="text"
                placeholder="Ej: FG800, Stratocaster, Les Paul"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="anio" class="block text-sm font-medium text-gray-700 mb-2">
                Año de fabricación
              </label>
              <input
                id="anio"
                v-model="formulario.anio"
                type="number"
                min="1900"
                :max="new Date().getFullYear()"
                placeholder="Ej: 2020"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              v-model="formulario.descripcion"
              required
              rows="4"
              placeholder="Describe tu instrumento, su estado, características especiales, etc."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Precio, Ciudad y Departamento -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="precio" class="block text-sm font-medium text-gray-700 mb-2">
                Precio por día $ *
              </label>
              <div class="flex">
                <span class="inline-flex items-center px-3 border border-gray-300 bg-gray-50 text-gray-700 rounded-l-md">$</span>
                <input
                  id="precio"
                  v-model="formulario.precio"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="150.50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-l-0"
                />
              </div>
            </div>
            <div>
              <label for="ciudad" class="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                id="ciudad"
                v-model="formulario.ciudad"
                type="text"
                required
                placeholder="Ej: Santa Lucía"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label for="departamento" class="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <input
                id="departamento"
                v-model="formulario.departamento"
                type="text"
                required
                placeholder="Ej: Canelones"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Estado del instrumento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estado del instrumento *
            </label>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center">
                <input
                  v-model="formulario.estadoInstrumento"
                  type="radio"
                  value="NUEVO"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Nuevo
              </label>
              <label class="flex items-center">
                <input
                  v-model="formulario.estadoInstrumento"
                  type="radio"
                  value="EXCELENTE"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Excelente
              </label>
              <label class="flex items-center">
                <input
                  v-model="formulario.estadoInstrumento"
                  type="radio"
                  value="BUENO"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Bueno
              </label>
              <label class="flex items-center">
                <input
                  v-model="formulario.estadoInstrumento"
                  type="radio"
                  value="REGULAR"
                  class="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Regular
              </label>
            </div>
          </div>

        </form>
        <div class="px-6 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Imágenes</h3>
          <ImagenesUploader :publicacion-id="(route.params.id as string)" />
        </div>
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="cancelar"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="enviando"
              @click="actualizarPublicacion"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ enviando ? 'Actualizando...' : 'Actualizar Publicación' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { publicacionesService, type ActualizarPublicacionRequest } from '../services/api'
import ImagenesUploader from '../components/ImagenesUploader.vue'

const router = useRouter()
const route = useRoute()

// Estado del componente
const cargandoPublicacion = ref(true)
const enviando = ref(false)
const errorCarga = ref<string | null>(null)

// Estado del formulario
const formulario = ref({
  titulo: '',
  categoria: '',
  descripcion: '',
  precio: '',
  ciudad: '',
  departamento: '',
  estadoInstrumento: '',
  marca: '',
  modelo: '',
  anio: ''
})

// Cargar datos de la publicación al montar el componente
onMounted(async () => {
  await cargarPublicacion()
})

// Método para cargar la publicación existente
const cargarPublicacion = async () => {
  try {
    cargandoPublicacion.value = true
    errorCarga.value = null
    
    const publicacionId = route.params.id as string
    if (!publicacionId) {
      throw new Error('ID de publicación no válido')
    }

    const publicacion = await publicacionesService.obtenerPublicacionPorId(publicacionId)
    
    // Pre-cargar el formulario con los datos existentes
    formulario.value = {
      titulo: publicacion.titulo || '',
      categoria: publicacion.categoria || '',
      descripcion: publicacion.descripcion || '',
      precio: publicacion.precioPorDia?.toString() || '',
      ciudad: publicacion.ciudad || '',
      departamento: publicacion.departamento || '',
      estadoInstrumento: publicacion.estadoEquipo || '',
      marca: publicacion.marca || '',
      modelo: publicacion.modelo || '',
      anio: publicacion.anioFabricacion?.toString() || ''
    }
    
  } catch (error: any) {
    console.error('Error al cargar publicación:', error)
    errorCarga.value = error.message || 'Error al cargar la información de la publicación'
  } finally {
    cargandoPublicacion.value = false
  }
}

// Método para actualizar la publicación
const actualizarPublicacion = async () => {
  // Validar campos requeridos
  if (!formulario.value.titulo || !formulario.value.categoria || !formulario.value.descripcion || 
      !formulario.value.precio || !formulario.value.ciudad || !formulario.value.departamento || 
      !formulario.value.estadoInstrumento) {
    alert('Por favor, completa todos los campos requeridos.')
    return
  }

  // Validar que el precio sea un número válido
  const precio = parseFloat(formulario.value.precio)
  if (isNaN(precio) || precio <= 0) {
    alert('Por favor, ingresa un precio válido mayor a 0.')
    return
  }

  try {
    enviando.value = true

    const publicacionId = route.params.id as string
    
    // Preparar datos para enviar
    const datosActualizacion: ActualizarPublicacionRequest = {
      titulo: formulario.value.titulo,
      categoria: formulario.value.categoria,
      descripcion: formulario.value.descripcion,
      precioPorDia: precio,
      ciudad: formulario.value.ciudad,
      departamento: formulario.value.departamento,
      estadoEquipo: formulario.value.estadoInstrumento
    }

    // Agregar campos opcionales solo si tienen valor
    if (formulario.value.marca) {
      datosActualizacion.marca = formulario.value.marca
    }
    if (formulario.value.modelo) {
      datosActualizacion.modelo = formulario.value.modelo
    }
    if (formulario.value.anio) {
      const anio = parseInt(formulario.value.anio)
      if (!isNaN(anio)) {
        datosActualizacion.anioFabricacion = anio
      }
    }

    await publicacionesService.actualizarPublicacion(publicacionId, datosActualizacion)

    // Mostrar mensaje de éxito y redirigir
    alert('¡Publicación actualizada exitosamente!')
    router.push('/mis-publicaciones')

  } catch (error: any) {
    console.error('Error al actualizar publicación:', error)
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`)
    } else {
      alert('Error al actualizar la publicación. Por favor, intenta nuevamente.')
    }
  } finally {
    enviando.value = false
  }
}

// Método para cancelar
const cancelar = () => {
  router.push('/mis-publicaciones')
}
</script>
