/**
 * Servicio de API para comunicación con el backend NestJS
 * - Configuración de axios con base URL del backend
 * - Interceptores para manejo de errores y tokens JWT
 * - Métodos para autenticación (login/registro)
 */

import axios from 'axios'

// URL base del API desde variables de entorno
// En desarrollo, usamos el proxy de Vite (/api) para evitar problemas de CORS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Configuración base de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentar timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Configuraciones adicionales para mejorar compatibilidad
  withCredentials: false,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Aceptar errores 4xx para manejarlos apropiadamente
  }
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
    // Manejo específico de errores de red
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Error de conexión de red:', error.message)
      error.message = 'No se puede conectar al servidor. Verifica tu conexión a internet.'
    } else if (error.code === 'ENOTFOUND') {
      console.error('Servidor no encontrado:', error.message)
      error.message = 'Servidor no encontrado. Verifica la URL del servidor.'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.error('Timeout de conexión:', error.message)
      error.message = 'La conexión tardó demasiado. Intenta nuevamente.'
    }
    
    // Manejo de errores HTTP
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token')
      // TODO: redirigir a login si es necesario
    }
    
    // Log detallado para debugging
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    })
    
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

// Función auxiliar para fallback con fetch
async function fetchFallback(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// Servicios de autenticación
export const authService = {
  // Registro de nuevo usuario
  async registro(datos: RegistroRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', datos)
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for registro:', error.message)
      return await fetchFallback('/auth/register', {
        method: 'POST',
        body: JSON.stringify(datos)
      })
    }
  },

  // Login de usuario existente
  async login(datos: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', datos)
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for login:', error.message)
      return await fetchFallback('/auth/login', {
        method: 'POST',
        body: JSON.stringify(datos)
      })
    }
  },

  // Obtener el perfil del usuario autenticado a partir del JWT (mock)
  async perfil() {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for perfil:', error.message)
      return await fetchFallback('/auth/profile')
    }
  },

  // Verificar token actual
  async verificarToken(): Promise<boolean> {
    try {
      await api.get('/auth/profile')
      return true
    } catch (axiosError) {
      try {
        console.warn('Axios failed, trying fetch fallback for verificarToken')
        await fetchFallback('/auth/profile')
        return true
      } catch (fetchError) {
        return false
      }
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

export interface ReservaActiva {
  fechaInicio: string
  fechaFin: string
}

export interface VerificacionDisponibilidad {
  disponible: boolean
}

// Tipo para crear publicación
export interface CrearPublicacionRequest {
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
  diasMinimoAlquiler?: number
  diasMaximoAlquiler?: number
  direccion: string
  ciudad: string
  departamento: string
  codigoPostal?: string
  latitud?: number
  longitud?: number
  entregaDomicilio?: boolean
  retiroLocal?: boolean
  estadoEquipo: string
  instrucciones?: string
}

// Tipo para actualizar publicación
export interface ActualizarPublicacionRequest {
  titulo?: string
  descripcion?: string
  categoria?: string
  marca?: string
  modelo?: string
  anioFabricacion?: number
  precioPorDia?: number
  precioPorSemana?: number
  precioPorMes?: number
  deposito?: number
  diasMinimoAlquiler?: number
  diasMaximoAlquiler?: number
  direccion?: string
  ciudad?: string
  departamento?: string
  codigoPostal?: string
  latitud?: number
  longitud?: number
  entregaDomicilio?: boolean
  retiroLocal?: boolean
  estadoEquipo?: string
  instrucciones?: string
}

// Servicios de publicaciones
export const publicacionesService = {
  // Crear una nueva publicación
  async crearPublicacion(datos: CrearPublicacionRequest): Promise<Publicacion> {
    try {
      // Obtener el perfil del usuario autenticado para conseguir su ID
      const perfil = await authService.perfil()
      const response = await api.post(`/publicaciones?usuarioId=${perfil.id}`, datos)
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for crearPublicacion:', error.message)
      const perfil = await authService.perfil()
      return await fetchFallback(`/publicaciones?usuarioId=${perfil.id}`, {
        method: 'POST',
        body: JSON.stringify(datos)
      })
    }
  },

  // Obtener mis publicaciones
  async obtenerMisPublicaciones(): Promise<Publicacion[]> {
    try {
      // Obtener el perfil del usuario autenticado para conseguir su ID
      const perfil = await authService.perfil()
      const response = await api.get(`/publicaciones/mis-publicaciones?usuarioId=${perfil.id}`)
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for obtenerMisPublicaciones:', error.message)
      const perfil = await authService.perfil()
      return await fetchFallback(`/publicaciones/mis-publicaciones?usuarioId=${perfil.id}`)
    }
  },

  // Obtener todas las publicaciones con filtros opcionales
  async obtenerPublicaciones(filtros: FiltrosPublicacion = {}): Promise<RespuestaPublicaciones> {
    const params = new URLSearchParams()
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/publicaciones?${queryString}` : '/publicaciones'
    
    try {
      console.log('🔍 Intentando obtener publicaciones con Axios:', endpoint)
      const response = await api.get(endpoint)
      console.log('✅ Axios exitoso para obtenerPublicaciones')
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for obtenerPublicaciones:', error.message)
      const fallbackEndpoint = queryString ? `/publicaciones?${queryString}` : '/publicaciones'
      return await fetchFallback(fallbackEndpoint)
    }
  },

  // Obtener una publicación específica por ID
  async obtenerPublicacionPorId(id: string): Promise<Publicacion> {
    try {
      const response = await api.get(`/publicaciones/${id}`)
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for obtenerPublicacionPorId:', error.message)
      return await fetchFallback(`/publicaciones/${id}`)
    }
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

  // Obtener reservas activas (rangos ocupados) de una publicación
  async obtenerReservasActivasDePublicacion(id: string): Promise<ReservaActiva[]> {
    const response = await api.get(`/publicaciones/${id}/reservas-activas`)
    return response.data
  },

  // Verificar disponibilidad de una publicación en un rango de fechas
  async verificarDisponibilidadPublicacion(
    id: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<VerificacionDisponibilidad> {
    const response = await api.get(`/publicaciones/${id}/disponibilidad/${encodeURIComponent(fechaInicio)}/${encodeURIComponent(fechaFin)}`)
    return response.data
  },

  // Actualizar una publicación existente
  async actualizarPublicacion(id: string, datos: ActualizarPublicacionRequest): Promise<Publicacion> {
    // Obtener el perfil del usuario autenticado para conseguir su ID
    const perfil = await authService.perfil()
    const response = await api.patch(`/publicaciones/${id}?usuarioId=${perfil.id}`, datos)
    return response.data
  },

  // Eliminar una publicación
  async eliminarPublicacion(id: string): Promise<void> {
    // Obtener el perfil del usuario autenticado para conseguir su ID
    const perfil = await authService.perfil()
    await api.delete(`/publicaciones/${id}?usuarioId=${perfil.id}`)
  },
}

// Tipos para las reservas
export interface SolicitudReserva {
  id: string
  fechaInicio: string
  fechaFin: string
  precioTotal: number
  telefonoContacto?: string
  estado: string
  publicacion: {
    titulo: string
    descripcion: string
  }
  usuario: {
    nombre: string
    apellido: string
    email: string
    direccion?: string
  }
}

export interface AprobarReservaRequest {
  notasPropietario?: string
}

export interface RechazarReservaRequest {
  motivo?: string
}

export interface CrearReservaRequest {
  usuarioId: string
  publicacionId: string
  propietarioId: string
  fechaInicio: string
  fechaFin: string
  precioTotal: number
  comisionPlataforma: number
  tipoEntrega: string
  direccionEntrega: string
  telefonoContacto: string
  notasUsuario?: string
}

// Servicios de reservas
export const reservasService = {
  // Crear una nueva reserva
  async crearReserva(datos: CrearReservaRequest): Promise<any> {
    const response = await api.post('/usuarios/reservas/crear', datos)
    return response.data
  },

  // Obtener solicitudes de alquiler pendientes para el propietario
  async obtenerSolicitudesPendientes(): Promise<SolicitudReserva[]> {
    const response = await api.get('/usuarios/reservas/mis-solicitudes')
    return response.data.data || []
  },

  // Obtener todas las solicitudes de alquiler para el propietario
  async obtenerTodasLasSolicitudes(): Promise<SolicitudReserva[]> {
    const response = await api.get('/usuarios/reservas/todas-mis-solicitudes')
    return response.data.data || []
  },

  // Aprobar una reserva
  async aprobarReserva(reservaId: string, datos: AprobarReservaRequest): Promise<any> {
    const response = await api.patch(`/usuarios/reservas/${reservaId}/aceptar`, datos)
    return response.data
  },

  // Rechazar una reserva
  async rechazarReserva(reservaId: string, datos: RechazarReservaRequest): Promise<any> {
    const response = await api.patch(`/usuarios/reservas/${reservaId}/rechazar`, datos)
    return response.data
  },

  // Obtener mis reservas como arrendatario
  async obtenerMisReservas(): Promise<any> {
    const response = await api.get('/usuarios/reservas/mis-reservas')
    return response.data
  },

  // Obtener reservas activas del propietario
  async obtenerReservasActivasPropietario(): Promise<any> {
    const response = await api.get('/usuarios/reservas/mis-reservas-activas')
    return response.data
  },

  // Obtener historial de reservas del propietario
  async obtenerHistorialReservasPropietario(): Promise<any> {
    const response = await api.get('/usuarios/reservas/mi-historial-reservas')
    return response.data
  },

  // Obtener una reserva específica por ID
  async obtenerReservaPorId(reservaId: string): Promise<any> {
    console.log('🌐 Llamando API para reserva:', reservaId)
    try {
      const response = await api.get(`/usuarios/reservas/${reservaId}`)
      console.log('📡 Respuesta completa de axios:', response)
      console.log('📊 Status:', response.status)
      console.log('📋 Headers:', response.headers)
      console.log('💾 Data:', response.data)
      
      // El backend devuelve {success: true, data: {...}, timestamp: "..."}
      // Devolvemos response.data que ya contiene esa estructura
      return response.data
    } catch (error) {
      console.error('🚨 Error en obtenerReservaPorId:', error)
      throw error
    }
  },

  // Activar una reserva (cambiar estado de CONFIRMADA a EN_CURSO)
  async activarReserva(reservaId: string): Promise<any> {
    const response = await api.post(`/usuarios/reservas/${reservaId}/activar`)
    return response.data
  },
}

export default api

// Servicios de usuario (perfil)
export const usuarioService = {
  async obtenerPerfil(id: string) {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  async actualizarPerfil(id: string, datos: { nombre?: string; apellido?: string; telefono?: string; direccion?: string }) {
    const response = await api.patch(`/usuarios/${id}`, datos)
    return response.data
  },
}