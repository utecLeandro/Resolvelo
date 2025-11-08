<template>
  <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-6 overflow-x-hidden">
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
        <p class="text-sm text-gray-600">Administra el estado y verificación de las cuentas</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="cargarUsuarios(1)"
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
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="busqueda">Buscar</label>
          <input
            id="busqueda"
            v-model="busqueda"
            type="text"
            placeholder="Nombre, apellido o email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @keyup.enter="aplicarFiltros"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="rol">Rol</label>
          <select
            id="rol"
            v-model="rolFiltro"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="aplicarFiltros"
          >
            <option value="">Todos</option>
            <option value="USUARIO">Usuario</option>
            <option value="MODERADOR">Moderador</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="activo">Estado</label>
          <select
            id="activo"
            v-model="activoFiltro"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="aplicarFiltros"
          >
            <option :value="null">Todos</option>
            <option :value="true">Activos</option>
            <option :value="false">Deshabilitados</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          class="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="limpiarFiltros"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Estados -->
    <div v-if="cargando" class="flex items-center gap-2 text-gray-700 mb-4">
      <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16 8 8 0 010-16z"></path>
      </svg>
      Cargando usuarios...
    </div>

    <div v-if="errorMensaje" class="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-700">
      <div class="flex justify-between items-start">
        <div>
          <strong class="font-semibold">Error:</strong> {{ errorMensaje }}
        </div>
        <button
          class="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
          @click="cargarUsuarios(1)"
        >
          Reintentar
        </button>
      </div>
    </div>

    <div v-if="!cargando && !errorMensaje && (!usuarios || usuarios.length === 0)" class="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-600">
      No hay usuarios para mostrar.
    </div>

    <!-- Tabla -->
    <div v-if="!cargando && !errorMensaje && usuarios && usuarios.length > 0" class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div>
        <table class="min-w-full w-full table-fixed divide-y divide-gray-200">
          <colgroup>
            <col style="width:24%" />
            <col style="width:24%" />
            <col style="width:10%" />
            <col style="width:10%" />
            <col style="width:12%" />
            <col style="width:10%" />
            <col style="width:10%" />
          </colgroup>
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verificación</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="u in usuarios" :key="u.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <div class="flex items-center">
                  <div class="w-8 h-8 shrink-0 aspect-square bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                    {{ obtenerIniciales(u.nombre, u.apellido) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ u.nombre }} {{ u.apellido }}</div>
                    <div class="text-xs text-gray-500 break-all">ID: {{ u.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <div class="text-sm text-gray-900 break-all">{{ u.email }}</div>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="rolBadgeClass(u.rol)">
                  {{ formatearRol(u.rol) }}
                </span>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="u.activo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'">
                  {{ u.activo ? 'Activo' : 'Deshabilitado' }}
                </span>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="verificacionBadgeClass(u.estadoVerificacion)">
                  {{ u.estadoVerificacion }}
                </span>
              </td>
              <td class="px-6 py-4 align-top whitespace-normal break-words text-sm text-gray-500">
                {{ formatearFecha(u.fechaCreacion) }}
              </td>
              <td class="px-6 py-4 align-top text-right text-sm font-medium">
                <div class="flex flex-wrap justify-end gap-2">
                  <button
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="u.activo ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'"
                    @click="toggleEstado(u)"
                  >
                    <svg v-if="u.activo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                    </svg>
                    {{ u.activo ? 'Deshabilitar' : 'Habilitar' }}
                  </button>
                  <button
                    v-if="u.estadoVerificacion === 'PENDIENTE'"
                    class="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    @click="verificar(u)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Verificar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Página {{ paginacion.paginaActual }} de {{ paginacion.totalPaginas }} — Total: {{ paginacion.totalElementos }} usuarios
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="paginacion.paginaActual <= 1"
            @click="cargarUsuarios(paginacion.paginaActual - 1)"
          >
            Anterior
          </button>
          <button
            class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="paginacion.paginaActual >= paginacion.totalPaginas"
            @click="cargarUsuarios(paginacion.paginaActual + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import adminService, { type UsuarioAdminListItem, type RespuestaUsuariosAdmin } from '../services/admin'

const usuarios = ref<UsuarioAdminListItem[]>([])
const cargando = ref<boolean>(false)
const errorMensaje = ref<string | null>(null)

// Filtros y paginación
const busqueda = ref<string>('')
const rolFiltro = ref<string>('')
const activoFiltro = ref<boolean | null>(null)
const paginacion = ref<{ paginaActual: number; totalPaginas: number; totalElementos: number; elementosPorPagina: number }>({
  paginaActual: 1,
  totalPaginas: 1,
  totalElementos: 0,
  elementosPorPagina: 10,
})

function aplicarFiltros() {
  cargarUsuarios(1)
}

function limpiarFiltros() {
  busqueda.value = ''
  rolFiltro.value = ''
  activoFiltro.value = null
  cargarUsuarios(1)
}

async function cargarUsuarios(pagina = 1) {
  cargando.value = true
  try {
    errorMensaje.value = null
    const params: any = { pagina, limite: paginacion.value.elementosPorPagina }
    if (busqueda.value) params.busqueda = busqueda.value
    if (rolFiltro.value) params.rol = rolFiltro.value
    if (activoFiltro.value !== null) params.activo = activoFiltro.value

    const res: RespuestaUsuariosAdmin = await adminService.listarUsuarios(params)
    if (!res || !Array.isArray(res.usuarios)) {
      throw new Error('Respuesta inválida del servidor al listar usuarios')
    }
    usuarios.value = res.usuarios
    paginacion.value = res.paginacion
  } catch (e: any) {
    console.error('Error cargando usuarios:', e?.message || e)
    const status = e?.response?.status
    const backendMsg = e?.response?.data?.message || e?.message
    if (status === 401) {
      errorMensaje.value = 'No estás autenticado. Por favor, inicia sesión e intenta nuevamente.'
    } else if (status === 403) {
      errorMensaje.value = 'No tienes permisos de administrador para ver esta página.'
    } else if (status === 0) {
      errorMensaje.value = 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
    } else {
      errorMensaje.value = backendMsg || 'Ocurrió un error al cargar los usuarios.'
    }
  } finally {
    cargando.value = false
  }
}

async function toggleEstado(u: UsuarioAdminListItem) {
  try {
    const res = await adminService.cambiarEstadoUsuario(u.id, !u.activo, !u.activo ? 'Rehabilitación de cuenta' : 'Deshabilitación')
    const idx = usuarios.value.findIndex(x => x.id === u.id)
    if (idx >= 0) usuarios.value[idx] = { ...usuarios.value[idx], ...res.usuario }
  } catch (e: any) {
    console.error('Error cambiando estado:', e?.message || e)
    const status = e?.response?.status
    const backendMsg = e?.response?.data?.message || e?.message
    if (status === 401) {
      errorMensaje.value = 'No estás autenticado. Por favor, inicia sesión e intenta nuevamente.'
    } else if (status === 403) {
      errorMensaje.value = 'No tienes permisos de administrador para realizar esta acción.'
    } else {
      errorMensaje.value = backendMsg || 'Ocurrió un error al cambiar el estado del usuario.'
    }
  }
}

async function verificar(u: UsuarioAdminListItem) {
  try {
    const res = await adminService.verificarUsuario(u.id, 'Verificación manual por administrador')
    const idx = usuarios.value.findIndex(x => x.id === u.id)
    if (idx >= 0) usuarios.value[idx] = { ...usuarios.value[idx], ...res.usuario }
  } catch (e: any) {
    console.error('Error verificando usuario:', e?.message || e)
    const status = e?.response?.status
    const backendMsg = e?.response?.data?.message || e?.message
    if (status === 401) {
      errorMensaje.value = 'No estás autenticado. Por favor, inicia sesión e intenta nuevamente.'
    } else if (status === 403) {
      errorMensaje.value = 'No tienes permisos de administrador para realizar esta acción.'
    } else {
      errorMensaje.value = backendMsg || 'Ocurrió un error al verificar al usuario.'
    }
  }
}

function obtenerIniciales(nombre?: string, apellido?: string) {
  const n = (nombre || '').trim().charAt(0)
  const a = (apellido || '').trim().charAt(0)
  return (n + a).toUpperCase() || 'U'
}

function formatearRol(rol: UsuarioAdminListItem['rol']) {
  switch (rol) {
    case 'USUARIO': return 'Usuario'
    case 'MODERADOR': return 'Moderador'
    case 'ADMINISTRADOR': return 'Administrador'
    case 'SUPER_ADMIN': return 'Super Admin'
    default: return rol
  }
}

function rolBadgeClass(rol: UsuarioAdminListItem['rol']) {
  switch (rol) {
    case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
    case 'ADMINISTRADOR': return 'bg-blue-100 text-blue-800'
    case 'MODERADOR': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function verificacionBadgeClass(estado: string) {
  switch (estado) {
    case 'VERIFICADO': return 'bg-green-100 text-green-800'
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800'
    case 'RECHAZADO': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatearFecha(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString()
  } catch {
    return iso
  }
}

onMounted(() => cargarUsuarios(1))
</script>

<style scoped>
/* Sin estilos personalizados: usamos Tailwind para mantener consistencia visual */
</style>