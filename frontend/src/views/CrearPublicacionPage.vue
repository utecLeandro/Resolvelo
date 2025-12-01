<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Encabezado -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Crear Nueva Publicación
        </h1>
        <p class="text-gray-600">
          Publica tu instrumento musical para que otros puedan alquilarlo
        </p>
      </div>

      <!-- Formulario -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Imágenes</h2>
          <p class="text-sm text-gray-600 mb-4">Seleccioná imágenes ahora; se subirán al crear la publicación.</p>
          <ImagenesUploader ref="uploaderRef" :publicacion-id="publicacionCreadaId" :defer="true" />
        </div>
        <form v-if="!publicacionCreadaId" @submit.prevent="crearPublicacion" class="space-y-6">
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="titulo" class="block text-sm font-medium text-gray-700 mb-2">
                Título de la publicación *
              </label>
              <input
                id="titulo"
                v-model="formulario.titulo"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Guitarra Acústica Yamaha FG800"
              />
            </div>

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
          </div>

          <!-- Información del instrumento -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="marca" class="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                id="marca"
                v-model="formulario.marca"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Yamaha, Fender, Gibson"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: FG800, Stratocaster, Les Paul"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 2020"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe tu instrumento, su estado, características especiales, etc."
            ></textarea>
          </div>

          <!-- Precio y ubicación -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  min="1"
                  step="0.01"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-l-0"
                  placeholder="150.50"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Santa Lucía"
              />
            </div>

            <div>
              <label for="departamento" class="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <select
                id="departamento"
                v-model="formulario.departamento"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un departamento</option>
                <option v-for="depto in departamentos" :key="depto" :value="depto">{{ depto }}</option>
              </select>
            </div>
          </div>

          <!-- Estado del instrumento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Estado del instrumento *
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          <!-- Botones -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="cancelar"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="enviando"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ enviando ? 'Creando...' : 'Crear Publicación' }}
            </button>
          </div>
        </form>

        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { publicacionesService, type CrearPublicacionRequest } from '../services/api'
import ImagenesUploader from '../components/ImagenesUploader.vue'

const router = useRouter()

// Estado del formulario
const enviando = ref(false)
const publicacionCreadaId = ref<string | null>(null)
const uploaderRef = ref<InstanceType<typeof ImagenesUploader> | null>(null)
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

const departamentos = [
  'Montevideo', 'Canelones', 'Maldonado', 'Rocha', 'Treinta y Tres',
  'Cerro Largo', 'Rivera', 'Tacuarembó', 'Durazno', 'Flores',
  'Florida', 'Lavalleja', 'San José', 'Colonia', 'Soriano',
  'Río Negro', 'Paysandú', 'Salto', 'Artigas'
]

// Variables eliminadas: imagenes, progresoSubida, errorImagenes

// Método para crear la publicación
const crearPublicacion = async () => {
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
    alert('El precio por día debe ser un número válido mayor a 0.')
    return
  }

  enviando.value = true
  
  try {
    // Preparar datos para enviar al backend
    const datosPublicacion: CrearPublicacionRequest = {
      titulo: formulario.value.titulo,
      descripcion: formulario.value.descripcion,
      categoria: formulario.value.categoria,
      marca: formulario.value.marca || undefined,
      modelo: formulario.value.modelo || undefined,
      anioFabricacion: formulario.value.anio ? parseInt(formulario.value.anio) : undefined,
      precioPorDia: precio,
      ciudad: formulario.value.ciudad,
      departamento: formulario.value.departamento,
      direccion: `${formulario.value.ciudad}, ${formulario.value.departamento}`, // Dirección temporal
      estadoEquipo: formulario.value.estadoInstrumento,
      entregaDomicilio: false,
      retiroLocal: true,
      diasMinimoAlquiler: 1
    }

    console.log('Enviando datos al backend:', datosPublicacion)
    
    // Llamar a la API para crear la publicación
    const publicacionCreada = await publicacionesService.crearPublicacion(datosPublicacion)
    publicacionCreadaId.value = publicacionCreada.id
    console.log('Publicación creada exitosamente:', publicacionCreada)
    await nextTick()
    if (uploaderRef.value && (uploaderRef.value as any).hasPreviews && (uploaderRef.value as any).hasPreviews()) {
      await (uploaderRef.value as any).subir()
    }
    router.push('/mis-publicaciones')
  } catch (error: any) {
    console.error('Error al crear la publicación:', error)
    
    // Mostrar mensaje de error más específico
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`)
    } else {
      alert('Error al crear la publicación. Por favor, intenta nuevamente.')
    }
  } finally {
    enviando.value = false
  }
}

// Método para cancelar
const cancelar = () => {
  router.push('/catalogo')
}

// Navegación automática a Mis publicaciones se realiza tras crear y subir imágenes
</script>
