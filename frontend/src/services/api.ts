/**
 * Servicio de API para comunicación con el backend NestJS
 * - Configuración de axios con base URL del backend
 * - Interceptores para manejo de errores y tokens JWT
 * - Métodos para autenticación (login/registro)
 */

import axios from 'axios'

// URL base del API desde variables de entorno
// En desarrollo, usamos el proxy de Vite (/api) para evitar problemas de CORS
const envUrl = import.meta.env.VITE_API_BASE_URL
// Asegurar que la URL termine en /api si viene definida, sino usar /api por defecto
const API_BASE_URL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`) 
  : '/api'

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
    
    if (!error.response) {
      error.response = { status: 0, statusText: 'Network Error', data: { message: error.message } } as any
    } else {
      if (!error.response.data || typeof error.response.data !== 'object') {
        error.response.data = { message: error.message || 'Error desconocido' }
      }
      if (error.response.status === 500) {
        error.message = 'Error interno del servidor'
        error.response.data.message = 'Error interno del servidor'
      }
      (error.response.data as any).path = error.config?.url
      ;(error.response.data as any).method = error.config?.method
    }
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
    apellido?: string
    email: string
    rol?: 'USUARIO' | 'MODERADOR' | 'ADMINISTRADOR' | 'SUPER_ADMIN'
    estadoVerificacion: string
    emailVerificado?: boolean
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
      if (response.status >= 400) {
        const mensaje = (response.data && (response.data.message || response.data.error)) || 'Error en registro'
        const err: any = new Error(mensaje)
        err.response = response
        throw err
      }
      return response.data
    } catch (error: any) {
      // Si es un error de validación (400-499), no reintentar con fetch
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error
      }
      console.warn('Axios failed, trying fetch fallback for registro:', error.message)
      return await fetchFallback('/auth/register', {
        method: 'POST',
        body: JSON.stringify(datos)
      })
    }
  },

  // Verificar email de usuario
  async verificarEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`)
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for verificarEmail:', error.message)
      return await fetchFallback(`/auth/verify-email?token=${token}`)
    }
  },

  // Solicitar recuperación de contraseña
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for forgotPassword:', error.message)
      return await fetchFallback('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
    }
  },

  // Completar recuperación de contraseña
  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/reset-password', { email, token, newPassword })
      return response.data
    } catch (error: any) {
      console.warn('Axios failed, trying fetch fallback for resetPassword:', error.message)
      return await fetchFallback('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword })
      })
    }
  },

  // Login de usuario existente
  async login(datos: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', datos)
      // Con validateStatus aceptamos 4xx como "success"; validamos manualmente
      if (response.status !== 200) {
        const mensaje = (response.data && (response.data.message || response.data.error)) || 'Credenciales incorrectas'
        const err: any = new Error(mensaje)
        err.response = response
        throw err
      }
      return response.data
    } catch (error: any) {
      console.warn('Axios failed or status != 200, trying fetch fallback for login:', error.message)
      return await fetchFallback('/auth/login', {
        method: 'POST',
        body: JSON.stringify(datos)
      })
    }
  },

  async loginConGubUy(code: string, redirectUri: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/gubuy/token', { code, redirect_uri: redirectUri })
      if (response.status !== 200) {
        const mensaje = (response.data && (response.data.message || response.data.error)) || 'Intercambio de código fallido'
        const err: any = new Error(mensaje)
        err.response = response
        throw err
      }
      return response.data
    } catch (error: any) {
      return await fetchFallback('/auth/gubuy/token', {
        method: 'POST',
        body: JSON.stringify({ code, redirect_uri: redirectUri })
      })
    }
  },

  async loginConGubUySimulado(payload: { nombre: string; apellido: string; documentoIdentidad: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/gubuy/validate', payload)
      if (response.status !== 200) {
        const mensaje = (response.data && (response.data.message || response.data.error)) || 'Validación fallida'
        const err: any = new Error(mensaje)
        err.response = response
        throw err
      }
      return response.data
    } catch (error: any) {
      return await fetchFallback('/auth/gubuy/validate', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }
  },

  // Obtener el perfil del usuario autenticado a partir del JWT (mock)
  async perfil() {
    try {
      const response = await api.get('/auth/profile')
      // Axios considera 4xx como "success" por nuestro validateStatus; validamos manualmente
      if (response.status !== 200) {
        const mensaje = (response.data && (response.data.message || response.data.error)) || 'No autorizado'
        throw new Error(`perfil: ${mensaje}`)
      }
      return response.data
    } catch (error: any) {
      console.warn('Axios failed or status != 200, trying fetch fallback for perfil:', error.message)
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
      if (rutaGuardada === '/login' || rutaGuardada.startsWith('/gubuy')) {
        return '/catalogo'
      }
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
  estadisticasReservas?: {
     total: number
     pendientes: number
     aprobadas: number
     rechazadas: number
     canceladas: number
     confirmadas: number
     activas: number
     completadas: number
   }
  // Campo _count que viene del backend
  _count?: {
    reservas: number
    calificaciones: number
  }
  calificaciones?: Calificacion[]
}

export interface ImagenPublicacion {
  id: string
  url: string
  descripcion?: string
  orden: number
  esPrincipal: boolean
}

export interface Calificacion {
  id: string
  puntuacion: number
  comentario?: string | null
  fechaCreacion: string
  usuarioCalificador?: {
    id: string
    nombre: string
    apellido: string
  }
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

export const imagenesService = {
  async presign(publicacionId: string, files: Array<{ fileName: string; contentType: string; size: number }>): Promise<{ uploads: Array<{ key: string; url: string; method: 'PUT'; expiresAt: string; contentType: string }> }> {
    const payload = { publicacionId, files }
    const response = await api.post('/imagenes/presign', payload)
    if (response.status >= 400) throw { response }
    return response.data
  },

  async finalizar(publicacionId: string, images: Array<{ url: string; descripcion?: string; orden?: number; esPrincipal?: boolean }>): Promise<ImagenPublicacion[]> {
    const response = await api.post(`/publicaciones/${encodeURIComponent(publicacionId)}/imagenes/finalizar`, { images })
    if (response.status >= 400) throw { response }
    return response.data
  },

  async listar(publicacionId: string): Promise<ImagenPublicacion[]> {
    const response = await api.get(`/publicaciones/${encodeURIComponent(publicacionId)}/imagenes`)
    if (response.status >= 400) throw { response }
    return response.data
  },

  async setPrincipal(publicacionId: string, imagenId: string): Promise<{ success: boolean }> {
    const response = await api.patch(`/publicaciones/${encodeURIComponent(publicacionId)}/imagenes/${encodeURIComponent(imagenId)}/principal`)
    if (response.status >= 400) throw { response }
    return response.data
  },

  async eliminar(publicacionId: string, imagenId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/publicaciones/${encodeURIComponent(publicacionId)}/imagenes/${encodeURIComponent(imagenId)}`)
    if (response.status >= 400) throw { response }
    return response.data
  },

  async uploadLocal(publicacionId: string, file: File, options: { descripcion?: string; orden?: number; esPrincipal?: boolean } = {}, onProgress?: (p: number) => void): Promise<ImagenPublicacion[]> {
    const fd = new FormData()
    fd.append('file', file)
    if (options.descripcion) fd.append('descripcion', options.descripcion)
    if (typeof options.orden === 'number') fd.append('orden', String(options.orden))
    if (typeof options.esPrincipal === 'boolean') fd.append('esPrincipal', String(options.esPrincipal))
    const response = await api.post(`/publicaciones/${encodeURIComponent(publicacionId)}/imagenes/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          const percent = Math.round((evt.loaded / evt.total) * 100)
          onProgress(percent)
        }
      },
    })
    if (response.status >= 400) throw { response }
    return response.data?.data || []
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
    imagenes?: ImagenPublicacion[]
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
    const data = response.data
    if (response.status >= 400) {
      throw { response: { data } }
    }
    if (data && data.success === false) {
      throw { response: { data } }
    }
    return data
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

  // Alias por PUT directo al controlador de reservas
  async activarReservaPut(reservaId: string): Promise<any> {
    const response = await api.put(`/reservas/${reservaId}/activar`)
    return response.data
  },

  // Finalizar una reserva (propietario) - Cambio manual de EN_CURSO a COMPLETADA
  async finalizarReserva(reservaId: string): Promise<any> {
    const response = await api.post(`/reservas/${reservaId}/finalizar`)
    return response.data
  },

  // Cancelar una reserva (arrendatario)
  async cancelarReserva(reservaId: string): Promise<any> {
    const response = await api.patch(`/usuarios/reservas/${reservaId}/cancelar`)
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

  async subirAvatar(id: string, file: File): Promise<{ success: boolean; avatarUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/usuarios/${id}/avatar/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

// Servicios de mensajes
export interface InfoChatReserva {
  contraparte: { id: string; nombre: string; apellido: string; avatarUrl?: string | null }
  publicacion: { id: string; titulo: string; ciudad?: string; departamento?: string; precioPorDia?: number | null; imagenPrincipalUrl?: string | null }
  reserva: { id: string; fechaInicio?: string; fechaFin?: string; estado?: string; tipoEntrega?: string; direccionEntrega?: string | null; precioTotal?: number | null }
  yo: { id: string; rol: 'ARRENDATARIO' | 'PROPIETARIO' }
}

export const mensajesService = {
  async listarPorReserva(reservaId: string): Promise<{ mensajes: any[]; info?: InfoChatReserva }> {
    const response = await api.get(`/mensajes/reserva/${encodeURIComponent(reservaId)}`)
    return response.data
  },
  async enviarMensaje(payload: { reservaId: string; contenido: string; receptorId?: string }): Promise<{ mensaje: any }> {
    const response = await api.post('/mensajes/enviar', payload)
    return response.data
  },
  async marcarLeidos(reservaId: string): Promise<{ ok: boolean }> {
    const response = await api.post(`/mensajes/reserva/${encodeURIComponent(reservaId)}/leer`)
    return response.data
  },
  async listarMisConversaciones(): Promise<{ conversaciones: Array<{ reservaId: string; publicacion: { id: string; titulo: string; imagenPrincipalUrl?: string | null }; ultimoMensaje: any | null; noLeidos: number; contraparte: { id: string; nombre: string; apellido: string; avatarUrl?: string | null } }> }> {
    const response = await api.get('/mensajes/mis-conversaciones')
    return response.data
  },
}

export const calificacionesService = {
  async crearCalificacion(payload: { reservaId: string; puntuacion: number; comentario?: string }): Promise<any> {
    const response = await api.post('/calificaciones', payload)
    return response.data
  },
  async listarPorPublicacion(publicacionId: string, params: { take?: number; skip?: number } = {}): Promise<{ success: boolean; data: Calificacion[] }> {
    const qs = new URLSearchParams()
    if (params.take) qs.append('take', String(params.take))
    if (params.skip) qs.append('skip', String(params.skip))
    const response = await api.get(`/calificaciones/publicaciones/${encodeURIComponent(publicacionId)}${qs.toString() ? `?${qs.toString()}` : ''}`)
    return response.data
  }
}

// Tipos y servicios de notificaciones
export interface NotificacionItem {
  id: string
  tipo: 'MENSAJE' | 'RESEÑA' | 'PUBLICACION_EVENTO'
  titulo: string
  mensaje: string
  timestamp: string
  read: boolean
  icon?: string
  data?: Record<string, any>
}

export const notificacionesService = {
  async listar(): Promise<{ items: NotificacionItem[]; noLeidas: number }> {
    const response = await api.get('/notificaciones')
    return response.data
  },
  async marcarLeidas(): Promise<{ ok: boolean }> {
    const response = await api.post('/notificaciones/marcar-leidas')
    return response.data
  },
  async registrarInteraccion(payload: { id: string; tipo: string; data?: any }): Promise<{ ok: boolean }> {
    const response = await api.post('/notificaciones/interaccion', payload)
    return response.data
  }
}
