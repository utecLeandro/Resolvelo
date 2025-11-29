<template>
  <div class="space-y-4">
    <div class="border-2 border-dashed rounded-lg p-6 text-center" :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
      <p class="text-sm text-gray-600">Selecciona hasta 5 imágenes (JPEG, PNG, WebP, máx 10MB)</p>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" @change="onFileChange" />
      <button class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" @click="fileInput?.click()">Elegir archivos</button>
    </div>

    <div v-if="previews.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="(item, idx) in previews" :key="item.id" class="border rounded-lg p-2 relative">
        <img :src="item.previewUrl" alt="preview" class="w-full h-32 object-cover rounded" />
        <div class="mt-2 flex items-center justify-between">
          <label class="text-xs flex items-center space-x-2">
            <input type="radio" name="principal" :checked="principalIndex === idx" @change="principalIndex = idx" />
            <span>Principal</span>
          </label>
          <span class="text-xs text-gray-500">{{ Math.round(item.file.size/1024) }} KB</span>
        </div>
        <div class="mt-2 h-2 bg-gray-200 rounded">
          <div class="h-2 bg-blue-600 rounded" :style="{ width: item.progress + '%' }"></div>
        </div>
        <button class="absolute top-2 right-2 bg-white rounded-full shadow p-1" @click="removePreview(idx)">
          ✕
        </button>
      </div>
    </div>

    <div class="flex items-center space-x-3" v-if="previews.length > 0">
      <button v-if="!props.defer" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" :disabled="subiendo || !props.publicacionId" @click="subir">Subir imágenes</button>
      <span v-if="subiendo" class="text-sm text-gray-600">Subiendo…</span>
    </div>

    <div v-if="!props.defer && mensajeError" class="text-sm text-red-600">{{ mensajeError }}</div>
    <div v-if="!props.defer && mensajeOk" class="text-sm text-green-600">{{ mensajeOk }}</div>

    <div v-if="!props.defer && imagenes.length > 0" class="mt-6">
      <h4 class="font-semibold mb-3">Imágenes existentes</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div v-for="img in imagenes" :key="img.id" class="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div class="aspect-square bg-gray-50">
            <img :src="img.url" alt="Imagen de publicación" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="px-2 pt-2">
            <div class="flex items-center justify-between text-xs">
              <span :class="img.esPrincipal ? 'text-blue-700 font-semibold' : 'text-gray-600'">{{ img.esPrincipal ? 'Principal' : 'Secundaria' }}</span>
              <span class="text-gray-500">#{{ img.orden }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <button class="px-2 py-1 bg-blue-600 text-white rounded text-xs w-full" @click="marcarPrincipal(img.id)">Principal</button>
              <button class="px-2 py-1 bg-red-600 text-white rounded text-xs w-full" @click="eliminar(img.id)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { imagenesService, type ImagenPublicacion } from '../services/api'

const props = withDefaults(defineProps<{ publicacionId?: string | null; defer?: boolean }>(), { defer: false })

const fileInput = ref<HTMLInputElement | null>(null)
const previews = ref<Array<{ id: string; file: File; previewUrl: string; progress: number }>>([])
const principalIndex = ref<number | null>(null)
const subiendo = ref(false)
const imagenes = ref<ImagenPublicacion[]>([])
const dragging = ref(false)
const mensajeError = ref('')
const mensajeOk = ref('')

const cargar = async () => {
  try {
    if (!props.publicacionId) return
    imagenes.value = await imagenesService.listar(props.publicacionId)
  } catch (e: any) {
    mensajeError.value = e?.response?.data?.message || 'No se pudieron listar imágenes'
  }
}

onMounted(cargar)

const onFileChange = (ev: Event) => {
  const input = ev.target as HTMLInputElement
  const files = Array.from(input.files || [])
  agregarArchivos(files)
  input.value = ''
}

const onDragOver = () => { dragging.value = true }
const onDragLeave = () => { dragging.value = false }
const onDrop = (ev: DragEvent) => {
  dragging.value = false
  const files = Array.from(ev.dataTransfer?.files || [])
  agregarArchivos(files)
}

const agregarArchivos = (files: File[]) => {
  const actual = previews.value.length
  const disponibles = Math.max(0, 5 - actual)
  const toAdd = files.slice(0, disponibles)
  for (const f of toAdd) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      mensajeError.value = 'Tipo de archivo no permitido'
      continue
    }
    if (f.size > 10 * 1024 * 1024) {
      mensajeError.value = 'El archivo supera 10MB'
      continue
    }
    const url = URL.createObjectURL(f)
    previews.value.push({ id: `${Date.now()}-${Math.random()}`, file: f, previewUrl: url, progress: 0 })
  }
}

const removePreview = (idx: number) => {
  const item = previews.value[idx]
  if (item) URL.revokeObjectURL(item.previewUrl)
  previews.value.splice(idx, 1)
  if (principalIndex.value === idx) principalIndex.value = null
}

const subir = async () => {
  try {
    subiendo.value = true
    mensajeError.value = ''
    mensajeOk.value = ''
    if (previews.value.length === 0) {
      mensajeError.value = 'Selecciona al menos una imagen'
      return
    }
    const resultados: ImagenPublicacion[] = []
    for (let i = 0; i < previews.value.length; i++) {
      const item = previews.value[i]
      if (!item) continue
      const esPrincipal = principalIndex.value === i
      if (!props.publicacionId) {
        mensajeError.value = 'La publicación aún no fue creada'
        break
      }
      const res = await imagenesService.uploadLocal(props.publicacionId, item.file, { esPrincipal }, (p) => {
        item.progress = p
      })
      resultados.push(...res)
    }
    previews.value.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    previews.value = []
    principalIndex.value = null
    if (props.publicacionId) {
      imagenes.value = await imagenesService.listar(props.publicacionId)
    }
    mensajeOk.value = 'Imágenes subidas correctamente'
  } catch (e: any) {
    mensajeError.value = e?.response?.data?.message || 'Falló la subida'
  } finally {
    subiendo.value = false
  }
}

const marcarPrincipal = async (imagenId: string) => {
  try {
    if (!props.publicacionId) return
    await imagenesService.setPrincipal(props.publicacionId, imagenId)
    await cargar()
  } catch (e: any) {
    mensajeError.value = e?.response?.data?.message || 'No se pudo marcar principal'
  }
}

const eliminar = async (imagenId: string) => {
  try {
    if (!props.publicacionId) return
    await imagenesService.eliminar(props.publicacionId, imagenId)
    await cargar()
  } catch (e: any) {
    mensajeError.value = e?.response?.data?.message || 'No se pudo eliminar'
  }
}

defineExpose({
  subir,
  hasPreviews: () => previews.value.length > 0,
})
</script>

<style scoped>
</style>
