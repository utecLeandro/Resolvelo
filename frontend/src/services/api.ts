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

export default api