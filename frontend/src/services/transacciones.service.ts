import api from './api'

export interface ProcesarPagoDto {
  reservaId: string
  metodoPago?: string
  descripcion?: string
}

export interface RespuestaPagoDto {
  exito: boolean
  transaccionId: string
  referenciaExterna: string
  mensaje: string
  fechaProcesamiento: string
}

export interface Transaccion {
  id: string
  tipo: string
  estado: string
  monto: number
  moneda: string
  metodoPago?: string
  referenciaExterna?: string
  fechaCreacion: string
  fechaProcesamiento?: string
  fechaCompletado?: string
  descripcion?: string
  reserva?: {
    id: string
    fechaInicio: string
    fechaFin: string
    publicacion: {
      titulo: string
      precioPorDia: number
    }
  }
}

export const transaccionesService = {
  async procesarPago(datos: ProcesarPagoDto): Promise<RespuestaPagoDto> {
    const response = await api.post('/transacciones/procesar-pago', datos)
    return response.data
  },

  async obtenerMisTransacciones(): Promise<Transaccion[]> {
    const response = await api.get('/transacciones/mis-transacciones')
    return response.data
  },

  async obtenerTransaccion(id: string): Promise<Transaccion> {
    const response = await api.get(`/transacciones/${id}`)
    return response.data
  }
}