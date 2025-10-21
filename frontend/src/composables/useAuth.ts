import { ref, computed } from 'vue'
import { authService, usuarioService } from '../services/api'

// Estado global reactivo del usuario
const usuarioAutenticado = ref(false)
const datosUsuario = ref<{
  id: string
  nombre: string
  apellido: string
  email: string
  documentoIdentidad?: string
  direccion?: string
} | null>(null)

// Computed para el nombre completo del usuario
const nombreCompleto = computed(() => {
  if (!datosUsuario.value) return ''
  return `${datosUsuario.value.nombre} ${datosUsuario.value.apellido}`.trim()
})

// Computed para las iniciales del usuario
const iniciales = computed(() => {
  if (!datosUsuario.value) return 'U'
  const nombre = datosUsuario.value.nombre || ''
  const apellido = datosUsuario.value.apellido || ''
  
  const inicialesArray = []
  if (nombre) inicialesArray.push(nombre.charAt(0).toUpperCase())
  if (apellido) inicialesArray.push(apellido.charAt(0).toUpperCase())
  
  return inicialesArray.slice(0, 2).join('')
})

export function useAuth() {
  // Función para verificar el estado de autenticación
  const verificarAutenticacion = async () => {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      usuarioAutenticado.value = false
      datosUsuario.value = null
      return
    }

    // Intentar obtener datos del usuario desde localStorage primero
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        usuarioAutenticado.value = true
        datosUsuario.value = user
        
        // Intentar actualizar con datos del backend en segundo plano
        try {
          const perfil = await usuarioService.obtenerPerfil(user.id)
          datosUsuario.value = {
            id: perfil.id,
            nombre: perfil.nombre || '',
            apellido: perfil.apellido || '',
            email: perfil.email || '',
            documentoIdentidad: perfil.documentoIdentidad,
            direccion: perfil.direccion
          }
          
          // Actualizar localStorage con los datos más recientes
          localStorage.setItem('userData', JSON.stringify(datosUsuario.value))
        } catch (backendError) {
          console.warn('No se pudo actualizar el perfil desde el backend:', backendError)
          // Mantener los datos del localStorage si el backend falla
        }
        
        return
      } catch (parseError) {
        console.error('Error al parsear datos del usuario:', parseError)
        limpiarAutenticacion()
        return
      }
    }

    // Si no hay datos en localStorage, limpiar autenticación
    limpiarAutenticacion()
  }

  // Función para actualizar los datos del usuario
  const actualizarDatosUsuario = (nuevosDatos: Partial<typeof datosUsuario.value>) => {
    if (datosUsuario.value && nuevosDatos) {
      datosUsuario.value = { ...datosUsuario.value, ...nuevosDatos }
      
      // Actualizar localStorage
      localStorage.setItem('userData', JSON.stringify(datosUsuario.value))
    }
  }

  // Función para limpiar la autenticación
  const limpiarAutenticacion = () => {
    usuarioAutenticado.value = false
    datosUsuario.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('userData')
  }

  // Función para cerrar sesión
  const cerrarSesion = () => {
    limpiarAutenticacion()
  }

  return {
    // Estado reactivo
    usuarioAutenticado: computed(() => usuarioAutenticado.value),
    datosUsuario: computed(() => datosUsuario.value),
    nombreCompleto,
    iniciales,
    
    // Métodos
    verificarAutenticacion,
    actualizarDatosUsuario,
    limpiarAutenticacion,
    cerrarSesion
  }
}