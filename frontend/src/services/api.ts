/**
 * Servicio de API para comunicación con el backend NestJS
 * - Configuración de axios con base URL del backend
 * - Interceptores para manejo de errores y tokens JWT
 * - Métodos para autenticación (login/registro)
 */

import axios from 'axios'

// Configuración base de la API
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend NestJS
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
  precioPorDia: number
  precioPorSemana?: number
  precioPorMes?: number
  deposito?: number
  disponible: boolean
  diasMinimoAlquiler: number
  diasMaximoAlquiler?: number
  direccion: string
  ciudad: string
  departamento: string
  codigoPostal?: string
  latitud?: number
  longitud?: number
  estado: string
  estadoModeracion: string
  entregaDomicilio: boolean
  retiroLocal: boolean
  estadoEquipo: string
  instrucciones?: string
  fechaCreacion: string
  fechaActualizacion: string
  fechaPublicacion?: string
  visualizaciones: number
  totalReservas: number
  calificacionPromedio?: number
  totalCalificaciones: number
  propietarioId: string
  propietario?: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
  imagenes?: ImagenPublicacion[]
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
  orden?: 'asc' | 'desc'
}

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

// Servicios de publicaciones
export const publicacionesService = {
  // Obtener todas las publicaciones con filtros (endpoint público)
  async obtenerPublicaciones(filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    // Agregar filtros como parámetros de consulta
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/publicaciones?${params.toString()}`)
    return response.data
  },

  // Obtener una publicación específica por ID (endpoint público)
  async obtenerPublicacionPorId(id: string): Promise<Publicacion> {
    const response = await api.get(`/publicaciones/${id}`)
    return response.data
  },

  // Buscar publicaciones por término (endpoint público)
  async buscarPublicaciones(termino: string, filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    // Agregar filtros como parámetros de consulta
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/publicaciones/buscar/${encodeURIComponent(termino)}?${params.toString()}`)
    return response.data
  },

  // Obtener publicaciones por categoría (endpoint público)
  async obtenerPublicacionesPorCategoria(categoria: string, filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    // Agregar filtros como parámetros de consulta
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })
    
    const response = await api.get(`/publicaciones/categoria/${encodeURIComponent(categoria)}?${params.toString()}`)
    return response.data
  },

  // Obtener publicaciones disponibles en un rango de fechas (endpoint público)
  async obtenerPublicacionesDisponibles(
    fechaInicio: string, 
    fechaFin: string, 
    filtros: FiltrosPublicacion = {}
  ): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    // Agregar filtros como parámetros de consulta
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