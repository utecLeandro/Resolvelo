<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
    <div class="p-6">
      <div class="flex items-start space-x-4">
        <!-- Imagen de la publicación -->
        <div class="flex-shrink-0">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <svg class="h-10 w-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        </div>

        <!-- Información de la reserva -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ reserva.publicacion.titulo }}</h3>
              <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ reserva.publicacion.descripcion }}</p>
              
              <!-- Estado de la reserva -->
              <div class="flex items-center mb-3">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    estadoClases[reserva.estado]
                  ]"
                >
                  {{ formatearEstado(reserva.estado) }}
                </span>
                
                <!-- Motivo de rechazo si aplica -->
                <div v-if="reserva.estado === 'RECHAZADA' && reserva.motivoRechazo" class="ml-3">
                  <button
                    @click="mostrarMotivoRechazo = !mostrarMotivoRechazo"
                    class="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Ver motivo
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Fechas y precio -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div class="font-medium">Período</div>
                <div>{{ formatearFecha(reserva.fechaInicio) }} - {{ formatearFecha(reserva.fechaFin) }}</div>
              </div>
            </div>
            
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3-2-1.343-2-3-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
              </svg>
              <div>
                <div class="font-medium">Precio Total</div>
                <div class="text-lg font-bold text-blue-600">${{ formatearPrecio(reserva.precioTotal) }}</div>
              </div>
            </div>

            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div class="font-medium">Ubicación</div>
                <div>{{ reserva.publicacion.direccion }}, {{ reserva.publicacion.ciudad }}, {{ reserva.publicacion.departamento }}</div>
              </div>
            </div>
          </div>

          <!-- Información del propietario -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Propietario</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-500">Nombre:</span>
                <span class="ml-1 text-gray-900">{{ reserva.publicacion.propietario.nombre }} {{ reserva.publicacion.propietario.apellido }}</span>
              </div>
              <div>
                <span class="text-gray-500">Fecha solicitud:</span>
                <span class="ml-1 text-gray-900">{{ formatearFecha(reserva.fechaCreacion) }}</span>
              </div>
            </div>
          </div>

          <!-- Motivo de rechazo expandible -->
          <div v-if="reserva.estado === 'RECHAZADA' && reserva.motivoRechazo && mostrarMotivoRechazo" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-medium text-red-800 mb-2">Motivo del rechazo</h4>
            <p class="text-sm text-red-700">{{ reserva.motivoRechazo }}</p>
          </div>

          <!-- Información de pago para reservas confirmadas -->
          <div v-if="reserva.estado === 'CONFIRMADA'" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-sm font-medium text-green-800">¡Reserva aprobada!</h4>
                <p class="text-sm text-green-700">Procede con el pago para confirmar tu reserva.</p>
              </div>
            </div>
          </div>

          <!-- Información de transacción para reservas en curso/completadas -->
          <div v-if="(reserva.estado === 'EN_CURSO' || reserva.estado === 'COMPLETADA') && reserva.transaccion" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-medium text-blue-800 mb-2">Información de pago</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-blue-600">ID Transacción:</span>
                <span class="ml-1 text-blue-900 font-mono">{{ reserva.transaccion.id }}</span>
              </div>
              <div v-if="reserva.transaccion.fechaPago">
                <span class="text-blue-600">Fecha de pago:</span>
                <span class="ml-1 text-blue-900">{{ formatearFecha(reserva.transaccion.fechaPago) }}</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción según el tipo -->
          <div class="flex space-x-3">
            <!-- Acciones para reservas pendientes -->
            <template v-if="tipo === 'pendiente'">
              <button
                @click="$emit('cancelar', reserva.id)"
                class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Cancelar solicitud
              </button>
              <router-link
                :to="`/publicacion/${reserva.publicacion.id}`"
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Ver publicación
              </router-link>
            </template>

            <!-- Acciones para reservas aprobadas -->
            <template v-if="tipo === 'aprobada'">
              <button
                @click="$emit('pagar', reserva.id)"
                class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Proceder al pago
              </button>
              <router-link
                :to="`/publicacion/${reserva.publicacion.id}`"
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Ver publicación
              </router-link>
            </template>

            <!-- Acciones para reservas activas -->
            <template v-if="tipo === 'activa'">
              <button
                @click="$emit('contactar', reserva)"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Contactar propietario
              </button>
              <router-link
                :to="`/publicacion/${reserva.publicacion.id}`"
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Ver publicación
              </router-link>
            </template>

            <!-- Acciones para reservas completadas -->
            <template v-if="tipo === 'completada'">
              <button
                @click="$emit('calificar', reserva.id)"
                class="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Calificar experiencia
              </button>
              <router-link
                :to="`/publicacion/${reserva.publicacion.id}`"
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Ver publicación
              </router-link>
            </template>

            <!-- Acciones para reservas rechazadas -->
            <template v-if="tipo === 'rechazada'">
              <router-link
                :to="`/publicacion/${reserva.publicacion.id}`"
                class="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Ver publicación
              </router-link>
              <router-link
                to="/catalogo"
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Buscar alternativas
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Tipos
interface ReservaArrendatario {
  id: string
  fechaInicio: string
  fechaFin: string
  precioTotal: number
  telefonoContacto?: string
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'RECHAZADA' | 'CANCELADA'
  motivoRechazo?: string
  fechaCreacion: string
  publicacion: {
    id: string
    titulo: string
    descripcion: string
    precioPorDia: number
    categoria: string
    direccion: string
    ciudad: string
    departamento: string
    imagenes: string[]
    propietario: {
      nombre: string
      apellido: string
      email: string
      telefono?: string
    }
  }
  transaccion?: {
    id: string
    estado: string
    fechaPago?: string
  }
}

// Props
interface Props {
  reserva: ReservaArrendatario
  tipo: 'pendiente' | 'aprobada' | 'activa' | 'completada' | 'rechazada'
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  cancelar: [reservaId: string]
  pagar: [reservaId: string]
  contactar: [reserva: ReservaArrendatario]
  calificar: [reservaId: string]
}>()

// Estado reactivo
const mostrarMotivoRechazo = ref(false)

// Clases CSS para los diferentes estados
const estadoClases = {
  'PENDIENTE': 'bg-yellow-100 text-yellow-800',
  'APROBADA': 'bg-green-100 text-green-800',
  'CONFIRMADA': 'bg-green-100 text-green-800',
  'ACTIVA': 'bg-blue-100 text-blue-800',
  'EN_CURSO': 'bg-blue-100 text-blue-800',
  'COMPLETADA': 'bg-gray-100 text-gray-800',
  'RECHAZADA': 'bg-red-100 text-red-800',
  'CANCELADA': 'bg-gray-100 text-gray-600'
}

// Métodos
const formatearEstado = (estado: string): string => {
  const estados: Record<string, string> = {
    'PENDIENTE': 'Pendiente de aprobación',
    'APROBADA': 'Aprobada - Pendiente de pago',
    'CONFIRMADA': 'Confirmada - Pendiente de pago',
    'ACTIVA': 'Activa',
    'EN_CURSO': 'Activa',
    'COMPLETADA': 'Completada',
    'RECHAZADA': 'Rechazada',
    'CANCELADA': 'Cancelada'
  }
  return estados[estado] || estado
}

const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>