/**
 * Servicio de API para comunicación con el backend NestJS
 * - Configuración de axios con base URL del backend
 * - Interceptores para manejo de errores y tokens JWT
 * - Métodos para autenticación (login/registro)
 */

import axios from 'axios'

// URL base del API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Configuración base de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token JWT a las requests (cuando esté disponible)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejo de respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token')
      // TODO: redirigir a login si es necesario
    }
    return Promise.reject(error)
  }
)

// Tipos para las requests de autenticación
export interface RegistroRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  documentoIdentidad: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    nombre: string
    email: string
    estadoVerificacion: string
  }
}

// Servicios de autenticación
export const authService = {
  // Registro de nuevo usuario
  async registro(datos: RegistroRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', datos)
    return response.data
  },

  // Login de usuario existente
  async login(datos: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', datos)
    return response.data
  },

  // Verificar token actual
  async verificarToken(): Promise<boolean> {
    try {
      await api.get('/auth/profile')
      return true
    } catch {
      return false
    }
  },

  // Obtener ruta de redirección post-login
  obtenerRutaRedireccion(): string {
    const rutaGuardada = sessionStorage.getItem('rutaAnteriorLogin')
    if (rutaGuardada) {
      // Limpiar la ruta guardada después de obtenerla
      sessionStorage.removeItem('rutaAnteriorLogin')
      return rutaGuardada
    }
    // Ruta por defecto si no hay ruta guardada
    return '/catalogo'
  },
}

// Tipos para las publicaciones
export interface Publicacion {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  marca?: string
  modelo?: string
  anioFabricacion?: number
  precioPorDia: number // Precio por día como número
  precioPorSemana?: number | null
  precioPorMes?: number | null
  deposito?: number | null
  disponible: boolean
  diasMinimoAlquiler: number
  diasMaximoAlquiler?: number | null
  direccion: string
  ciudad: string
  departamento: string
  codigoPostal?: string | null
  latitud?: number | null
  longitud?: number | null
  estado: string
  estadoModeracion: string
  entregaDomicilio: boolean
  retiroLocal: boolean
  // Campos adicionales que vienen del backend
  fechaModeracion?: string | null
  moderadoPor?: string | null
  comentarioModeracion?: string | null
  estadoEquipo: string
  instrucciones?: string | null
  fechaCreacion: string
  fechaActualizacion: string
  fechaPublicacion?: string | null
  fechaVencimiento?: string | null
  visualizaciones: number
  totalReservas: number
  calificacionPromedio?: number | null
  totalCalificaciones: number
  propietarioId: string
  propietario?: {
    id: string
    nombre: string
    apellido: string
    calificacionPromedio?: number | null
    totalCalificaciones: number
  }
  imagenes?: ImagenPublicacion[]
  // Campo _count que viene del backend
  _count?: {
    reservas: number
    calificaciones: number
  }
}

export interface ImagenPublicacion {
  id: string
  url: string
  descripcion?: string
  orden: number
  esPrincipal: boolean
}

export interface FiltrosPublicacion {
  categoria?: string
  ciudad?: string
  departamento?: string
  precioMinimo?: number
  precioMaximo?: number
  fechaInicio?: string
  fechaFin?: string
  busqueda?: string
  pagina?: number
  limite?: number
  ordenarPor?: string
  direccionOrden?: 'asc' | 'desc'
}

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[]
  paginacion: {
    paginaActual: number
    totalPaginas: number
    totalElementos: number
    elementosPorPagina: number
  }
}

// Servicios de publicaciones
export const publicacionesService = {
  // Obtener todas las publicaciones con filtros opcionales
  async obtenerPublicaciones(filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const url = `${API_BASE_URL}/publicaciones?${params.toString()}`
    console.log('🔍 URL de la solicitud:', url)
    console.log('🔍 Filtros enviados:', filtros)

    // Usar fetch directo para evitar problemas con interceptores
    const response = await fetch(url)
    console.log('🔍 Status de respuesta:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔍 Error response body:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }
    return await response.json()
  },

  // Obtener una publicación específica por ID
  async obtenerPublicacionPorId(id: string): Promise<Publicacion> {
    const response = await api.get(`/publicaciones/${id}`)
    return response.data
  },

  // Buscar publicaciones por término
  async buscarPublicaciones(termino: string, filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/publicaciones/buscar/${encodeURIComponent(termino)}?${params.toString()}`)
    return response.data
  },

  // Obtener publicaciones por categoría
  async obtenerPublicacionesPorCategoria(categoria: string, filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/publicaciones/categoria/${encodeURIComponent(categoria)}?${params.toString()}`)
    return response.data
  },

  // Obtener publicaciones disponibles en un rango de fechas
  async obtenerPublicacionesDisponibles(
    fechaInicio: string, 
    fechaFin: string, 
    filtros: FiltrosPublicacion = {}
  ): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(
      `/publicaciones/disponibles/${encodeURIComponent(fechaInicio)}/${encodeURIComponent(fechaFin)}?${params.toString()}`
    )
    return response.data
  },
}

export default api