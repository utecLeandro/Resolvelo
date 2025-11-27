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
  notasInternas?: string
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
  async crearPreferenciaMercadoPago(reservaId: string, descripcion?: string): Promise<{ ok: boolean; preferenciaId?: string; transaccionId?: string; redirectUrl?: string; init_point?: string; sandbox_init_point?: string; message?: string }> {
    // Forzar que 4xx sean tratados como error para poder manejar mensajes del backend correctamente
    const response = await api.post(
      '/transacciones/mercado-pago/crear-preferencia',
      { reservaId, descripcion },
      { validateStatus: (status) => status >= 200 && status < 300 }
    )
    return response.data
  },
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
  },

  async confirmarPagoMercadoPago(paymentId: string): Promise<Transaccion> {
    const response = await api.post('/transacciones/mercado-pago/confirmar', { paymentId })
    return response.data
  },

  async verificarEstadoMercadoPagoPorTransaccion(id: string): Promise<Transaccion> {
    const response = await api.get(`/transacciones/mercado-pago/verificar/${id}`)
    return response.data
  },

  async completarTransaccion(id: string): Promise<Transaccion> {
    const response = await api.put(`/transacciones/${id}/completar`)
    return response.data
  },

  async procesarPagoBrick(payload: { formData: any; transaccionId?: string; preferenceId?: string }): Promise<Transaccion> {
    const body = { ...payload.formData, transaccionId: payload.transaccionId, preferenceId: payload.preferenceId }
    const response = await api.post('/transacciones/mercado-pago/process-payment', body)
    return response.data
  },

  async obtenerMpPublicKey(): Promise<string> {
    try {
      const res = await api.get('/config/mp-public-key')
      return String(res.data?.publicKey || '')
    } catch {
      return ''
    }
  }
}