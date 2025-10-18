<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Panel del Propietario</h1>
        <p class="mt-2 text-gray-600">Gestiona tus instrumentos musicales y solicitudes de alquiler</p>
      </div>

      <!-- Pestañas principales -->
      <div class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              @click="pestanaActiva = 'publicaciones'"
              :class="[
                pestanaActiva === 'publicaciones'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Mis Publicaciones
            </button>
            <button
              @click="pestanaActiva = 'solicitudes'"
              :class="[
                pestanaActiva === 'solicitudes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Solicitudes de Alquiler
              <span v-if="solicitudesPendientes.length > 0" class="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ solicitudesPendientes.length }}
              </span>
            </button>
            <button
              @click="pestanaActiva = 'reservas-activas'"
              :class="[
                pestanaActiva === 'reservas-activas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Reservas Activas
              <span v-if="reservasActivas.length > 0" class="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasActivas.length }}
              </span>
            </button>
            <button
              @click="pestanaActiva = 'historial'"
              :class="[
                pestanaActiva === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Historial de Reservas
            </button>
          </nav>
        </div>
      </div>

      <!-- Subtabs para Mis Publicaciones -->
      <div v-if="pestanaActiva === 'publicaciones'" class="mb-6">
        <div class="border-b border-gray-100">
          <nav class="-mb-px flex space-x-6" aria-label="Sub Tabs">
            <button
              @click="subPestanaPublicaciones = 'todas'"
              :class="[
                subPestanaPublicaciones === 'todas'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Todas ({{ publicaciones.length }})
            </button>
            <button
              @click="subPestanaPublicaciones = 'activas'"
              :class="[
                subPestanaPublicaciones === 'activas'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Activas ({{ publicacionesActivas.length }})
            </button>
            <button
              @click="subPestanaPublicaciones = 'pausadas'"
              :class="[
                subPestanaPublicaciones === 'pausadas'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Pausadas ({{ publicacionesPausadas.length }})
            </button>
            <button
              @click="subPestanaPublicaciones = 'revision'"
              :class="[
                subPestanaPublicaciones === 'revision'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              En Revisión ({{ publicacionesEnRevision.length }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Subtabs para Solicitudes -->
      <div v-if="pestanaActiva === 'solicitudes'" class="mb-6">
        <div class="border-b border-gray-100">
          <nav class="-mb-px flex space-x-6" aria-label="Sub Tabs">
            <button
              @click="subPestanaSolicitudes = 'pendientes'"
              :class="[
                subPestanaSolicitudes === 'pendientes'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Pendientes ({{ solicitudesPendientes.length }})
            </button>
            <button
              @click="subPestanaSolicitudes = 'aprobadas'"
              :class="[
                subPestanaSolicitudes === 'aprobadas'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Aprobadas ({{ solicitudesAprobadas.length }})
            </button>
            <button
              @click="subPestanaSolicitudes = 'rechazadas'"
              :class="[
                subPestanaSolicitudes === 'rechazadas'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Rechazadas ({{ solicitudesRechazadas.length }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenido de la pestaña Mis Publicaciones -->
      <div v-if="pestanaActiva === 'publicaciones'">
        <!-- Estado de carga -->
        <div v-if="cargando" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando publicaciones...</span>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar publicaciones</h3>
              <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Sin publicaciones -->
        <div v-else-if="publicaciones.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes publicaciones</h3>
          <p class="mt-1 text-sm text-gray-500">Comienza publicando tu primer instrumento musical.</p>
          <div class="mt-6">
            <router-link
              to="/crear-publicacion"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear publicación
            </router-link>
          </div>
        </div>

        <!-- Lista de publicaciones -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="publicacion in publicacionesFiltradas"
          :key="publicacion.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <!-- Imagen placeholder -->
          <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div class="w-full h-48 flex items-center justify-center">
              <svg class="h-12 w-12 text-blue-400 opacity-60" fill="currentColor" viewBox="0 0 24 24" :aria-label="publicacion.titulo">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ publicacion.titulo }}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ publicacion.descripcion }}</p>
                
                <!-- Precio -->
                <div class="flex items-center mb-3">
                  <span class="text-2xl font-bold text-blue-600">${{ publicacion.precioPorDia }}</span>
                  <span class="text-sm text-gray-500 ml-1">/día</span>
                </div>

                <!-- Estado -->
                <div class="flex items-center space-x-2 mb-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': publicacion.estado === 'ACTIVA',
                      'bg-yellow-100 text-yellow-800': publicacion.estado === 'PAUSADA',
                      'bg-red-100 text-red-800': publicacion.estado === 'INACTIVA'
                    }"
                  >
                    {{ formatearEstado(publicacion.estado) }}
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': publicacion.estadoModeracion === 'APROBADA',
                      'bg-yellow-100 text-yellow-800': publicacion.estadoModeracion === 'PENDIENTE_REVISION',
                      'bg-red-100 text-red-800': publicacion.estadoModeracion === 'RECHAZADA'
                    }"
                  >
                    {{ formatearEstadoModeracion(publicacion.estadoModeracion) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex space-x-2">
              <router-link
                :to="`/publicacion/${publicacion.id}`"
                class="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Ver detalle
              </router-link>
              <button
                class="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                @click="editarPublicacion(publicacion.id)"
              >
                Editar
              </button>
              <button
                class="flex-1 bg-red-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                @click="confirmarEliminar(publicacion)"
                :disabled="eliminando === publicacion.id"
              >
                {{ eliminando === publicacion.id ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Contenido de la pestaña Solicitudes de alquiler -->
      <div v-else-if="pestanaActiva === 'solicitudes'">
        <!-- Estado de carga solicitudes -->
        <div v-if="cargandoSolicitudes" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando solicitudes...</span>
        </div>

        <!-- Error solicitudes -->
        <div v-else-if="errorSolicitudes" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar solicitudes</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorSolicitudes }}</p>
            </div>
          </div>
        </div>

        <!-- Sin solicitudes -->
        <div v-else-if="solicitudesFiltradas.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay solicitudes {{ subPestanaSolicitudes }}</h3>
          <p class="mt-1 text-sm text-gray-500">
            <span v-if="subPestanaSolicitudes === 'pendientes'">Cuando recibas solicitudes de alquiler aparecerán aquí.</span>
            <span v-else-if="subPestanaSolicitudes === 'aprobadas'">Las solicitudes que apruebes aparecerán aquí.</span>
            <span v-else>Las solicitudes rechazadas aparecerán aquí.</span>
          </p>
        </div>

        <!-- Lista de solicitudes -->
        <div v-else class="space-y-6">
          <div
            v-for="solicitud in solicitudesFiltradas"
            :key="solicitud.id"
            class="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <!-- Imagen de la publicación -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <svg class="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                </div>

                <!-- Información de la solicitud -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ solicitud.publicacion.titulo }}</h3>
                      <p class="text-sm text-gray-600 mb-2">{{ solicitud.publicacion.descripcion }}</p>
                      
                      <!-- Fechas y precio -->
                      <div class="flex items-center space-x-4 mb-3">
                        <div class="flex items-center text-sm text-gray-500">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {{ formatearFecha(solicitud.fechaInicio) }} - {{ formatearFecha(solicitud.fechaFin) }}
                        </div>
                        <div class="flex items-center text-sm font-medium text-blue-600">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3-2-1.343-2-3-2z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                          </svg>
                          ${{ solicitud.precioTotal }}
                        </div>
                      </div>

                      <!-- Información del arrendatario -->
                      <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Datos del arrendatario</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-gray-500">Nombre:</span>
                            <span class="ml-1 text-gray-900">{{ solicitud.usuario.nombre }} {{ solicitud.usuario.apellido }}</span>
                          </div>
                          <div>
                            <span class="text-gray-500">Email:</span>
                            <span class="ml-1 text-gray-900">{{ solicitud.usuario.email }}</span>
                          </div>
                          <div v-if="solicitud.usuario.direccion">
                            <span class="text-gray-500">Dirección:</span>
                            <span class="ml-1 text-gray-900">{{ solicitud.usuario.direccion }}</span>
                          </div>
                          <div v-if="solicitud.telefonoContacto">
                            <span class="text-gray-500">Teléfono:</span>
                            <span class="ml-1 text-gray-900">{{ solicitud.telefonoContacto }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Botones de acción -->
                      <div class="flex space-x-3">
                        <button
                          @click="aprobarSolicitud(solicitud.id)"
                          :disabled="procesandoSolicitud === solicitud.id"
                          class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <span v-if="procesandoSolicitud === solicitud.id" class="flex items-center justify-center">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Procesando...
                          </span>
                          <span v-else>Aceptar</span>
                        </button>
                        <button
                          @click="mostrarModalRechazo(solicitud)"
                          :disabled="procesandoSolicitud === solicitud.id"
                          class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido de la pestaña Reservas Activas -->
      <div v-else-if="pestanaActiva === 'reservas-activas'">
        <!-- Estado de carga reservas activas -->
        <div v-if="cargandoReservasActivas" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando reservas activas...</span>
        </div>

        <!-- Error reservas activas -->
        <div v-else-if="errorReservasActivas" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar reservas activas</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorReservasActivas }}</p>
            </div>
          </div>
        </div>

        <!-- Sin reservas activas -->
        <div v-else-if="reservasActivas.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas activas</h3>
          <p class="mt-1 text-sm text-gray-500">Las reservas aprobadas y en curso aparecerán aquí.</p>
        </div>

        <!-- Lista de reservas activas -->
        <div v-else class="space-y-6">
          <div
            v-for="reserva in reservasActivas"
            :key="reserva.id"
            class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500"
          >
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <!-- Imagen de la publicación -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center">
                    <svg class="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                </div>

                <!-- Información de la reserva -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ reserva.publicacion.titulo }}</h3>
                      <p class="text-sm text-gray-600 mb-2">{{ reserva.publicacion.descripcion }}</p>
                      
                      <!-- Estado y fechas -->
                      <div class="flex items-center space-x-4 mb-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {{ formatearEstadoReserva(reserva.estado) }}
                        </span>
                        <div class="flex items-center text-sm text-gray-500">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {{ formatearFecha(reserva.fechaInicio) }} - {{ formatearFecha(reserva.fechaFin) }}
                        </div>
                        <div class="flex items-center text-sm font-medium text-green-600">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3-2-1.343-2-3-2z" />
                          </svg>
                          ${{ reserva.precioTotal }}
                        </div>
                      </div>

                      <!-- Información del arrendatario -->
                      <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Arrendatario</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-gray-500">Nombre:</span>
                            <span class="ml-1 text-gray-900">{{ reserva.usuario.nombre }} {{ reserva.usuario.apellido }}</span>
                          </div>
                          <div>
                            <span class="text-gray-500">Email:</span>
                            <span class="ml-1 text-gray-900">{{ reserva.usuario.email }}</span>
                          </div>
                          <div v-if="reserva.telefonoContacto">
                            <span class="text-gray-500">Teléfono:</span>
                            <span class="ml-1 text-gray-900">{{ reserva.telefonoContacto }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Botones de acción -->
                      <div class="flex space-x-3">
                        <button
                          @click="contactarArrendatario(reserva.usuario.email)"
                          class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                        >
                          Contactar
                        </button>
                        <button
                          @click="verDetalleReserva(reserva.id)"
                          class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido de la pestaña Historial de Reservas -->
      <div v-else-if="pestanaActiva === 'historial'">
        <!-- Estado de carga historial -->
        <div v-if="cargandoHistorial" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando historial...</span>
        </div>

        <!-- Error historial -->
        <div v-else-if="errorHistorial" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar historial</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorHistorial }}</p>
            </div>
          </div>
        </div>

        <!-- Sin historial -->
        <div v-else-if="historialReservas.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay historial de reservas</h3>
          <p class="mt-1 text-sm text-gray-500">Las reservas completadas y canceladas aparecerán aquí.</p>
        </div>

        <!-- Lista de historial -->
        <div v-else class="space-y-6">
          <div
            v-for="reserva in historialReservas"
            :key="reserva.id"
            class="bg-white rounded-lg shadow-md overflow-hidden"
            :class="{
              'border-l-4 border-gray-400': reserva.estado === 'COMPLETADA',
              'border-l-4 border-red-400': reserva.estado === 'CANCELADA'
            }"
          >
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <!-- Imagen de la publicación -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                    <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                </div>

                <!-- Información de la reserva -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ reserva.publicacion.titulo }}</h3>
                      <p class="text-sm text-gray-600 mb-2">{{ reserva.publicacion.descripcion }}</p>
                      
                      <!-- Estado y fechas -->
                      <div class="flex items-center space-x-4 mb-3">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="{
                            'bg-gray-100 text-gray-800': reserva.estado === 'COMPLETADA',
                            'bg-red-100 text-red-800': reserva.estado === 'CANCELADA'
                          }"
                        >
                          {{ formatearEstadoReserva(reserva.estado) }}
                        </span>
                        <div class="flex items-center text-sm text-gray-500">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {{ formatearFecha(reserva.fechaInicio) }} - {{ formatearFecha(reserva.fechaFin) }}
                        </div>
                        <div class="flex items-center text-sm font-medium text-gray-600">
                          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3-2-1.343-2-3-2z" />
                          </svg>
                          ${{ reserva.precioTotal }}
                        </div>
                      </div>

                      <!-- Información del arrendatario -->
                      <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Arrendatario</h4>
                        <div class="text-sm text-gray-700">
                          {{ reserva.usuario.nombre }} {{ reserva.usuario.apellido }} - {{ reserva.usuario.email }}
                        </div>
                      </div>

                      <!-- Calificación si está disponible -->
                      <div v-if="reserva.calificacion" class="bg-yellow-50 rounded-lg p-4 mb-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Calificación recibida</h4>
                        <div class="flex items-center space-x-2">
                          <div class="flex items-center">
                            <svg v-for="i in 5" :key="i" class="h-4 w-4" :class="i <= reserva.calificacion.puntuacion ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <span class="text-sm text-gray-600">{{ reserva.calificacion.puntuacion }}/5</span>
                        </div>
                        <p v-if="reserva.calificacion.comentario" class="text-sm text-gray-600 mt-2">{{ reserva.calificacion.comentario }}</p>
                      </div>

                      <!-- Botones de acción -->
                      <div class="flex space-x-3">
                        <button
                          @click="verDetalleReserva(reserva.id)"
                          class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                        >
                          Ver Detalle
                        </button>
                        <button
                          v-if="reserva.estado === 'COMPLETADA' && !reserva.calificacion"
                          @click="calificarArrendatario(reserva.id)"
                          class="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors duration-200"
                        >
                          Calificar Arrendatario
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de rechazo -->
  <div v-if="modalRechazoVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Rechazar solicitud</h3>
        <p class="text-sm text-gray-600 mb-4">
          ¿Estás seguro de que quieres rechazar esta solicitud de alquiler?
        </p>
        
        <div class="mb-4">
          <label for="motivo" class="block text-sm font-medium text-gray-700 mb-2">
            Motivo (opcional)
          </label>
          <textarea
            id="motivo"
            v-model="motivoRechazo"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Explica brevemente el motivo del rechazo..."
          ></textarea>
        </div>

        <div class="flex space-x-3">
          <button
            @click="confirmarRechazo"
            :disabled="procesandoSolicitud"
            class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="procesandoSolicitud" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </span>
            <span v-else>Confirmar rechazo</span>
          </button>
          <button
            @click="cerrarModalRechazo"
            :disabled="procesandoSolicitud"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { publicacionesService, reservasService } from '../services/api'
import type { Publicacion } from '../services/api'

// Tipos para las solicitudes
interface SolicitudReserva {
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

// Composables
const router = useRouter()

// Estado reactivo - Pestañas
const pestanaActiva = ref<'publicaciones' | 'solicitudes'>('publicaciones')
const subPestanaPublicaciones = ref<'todas' | 'activas' | 'pausadas' | 'revision'>('todas')
const subPestanaSolicitudes = ref<'pendientes' | 'aprobadas' | 'rechazadas'>('pendientes')

// Estado reactivo - Publicaciones
const publicaciones = ref<Publicacion[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const eliminando = ref<string | null>(null)

// Estado reactivo - Solicitudes
const solicitudesPendientes = ref<SolicitudReserva[]>([])
const cargandoSolicitudes = ref(false)
const errorSolicitudes = ref<string | null>(null)
const procesandoSolicitud = ref<string | null>(null)

// Estado reactivo - Modal de rechazo
const modalRechazoVisible = ref(false)
const solicitudArechazar = ref<SolicitudReserva | null>(null)
const motivoRechazo = ref('')

// Estado reactivo - Reservas Activas
const reservasActivas = ref<any[]>([])
const cargandoReservasActivas = ref(false)
const errorReservasActivas = ref<string | null>(null)

// Estado reactivo - Historial de Reservas
const historialReservas = ref<any[]>([])
const cargandoHistorial = ref(false)
const errorHistorial = ref<string | null>(null)

// Computed
const contadorSolicitudes = computed(() => (solicitudesPendientes.value || []).length)

// Computed properties para publicaciones
const publicacionesActivas = computed(() => (publicaciones.value || []).filter(p => p.estado === 'ACTIVA'))
const publicacionesPausadas = computed(() => (publicaciones.value || []).filter(p => p.estado === 'PAUSADA'))
const publicacionesEnRevision = computed(() => (publicaciones.value || []).filter(p => p.estadoModeracion === 'PENDIENTE_REVISION'))

// Computed properties para solicitudes
const solicitudesAprobadas = computed(() => (solicitudesPendientes.value || []).filter(s => s.estado === 'APROBADA'))
const solicitudesRechazadas = computed(() => (solicitudesPendientes.value || []).filter(s => s.estado === 'RECHAZADA'))

const publicacionesFiltradas = computed(() => {
  if (pestanaActiva.value !== 'publicaciones') return []
  
  const pubs = publicaciones.value || []
  
  switch (subPestanaPublicaciones.value) {
    case 'todas':
      return pubs
    case 'activas':
      return pubs.filter(p => p.estado === 'ACTIVA')
    case 'pausadas':
      return pubs.filter(p => p.estado === 'PAUSADA')
    case 'revision':
      return pubs.filter(p => p.estadoModeracion === 'PENDIENTE_REVISION')
    default:
      return pubs
  }
})

const solicitudesFiltradas = computed(() => {
  if (pestanaActiva.value !== 'solicitudes') return []
  
  const solicitudes = solicitudesPendientes.value || []
  
  switch (subPestanaSolicitudes.value) {
    case 'pendientes':
      return solicitudes.filter(s => s.estado === 'PENDIENTE')
    case 'aprobadas':
      return solicitudes.filter(s => s.estado === 'APROBADA')
    case 'rechazadas':
      return solicitudes.filter(s => s.estado === 'RECHAZADA')
    default:
      return solicitudes
  }
})

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarPublicaciones()
  await cargarSolicitudesPendientes()
})

// Métodos - Pestañas
const cambiarPestana = (pestana: 'publicaciones' | 'solicitudes' | 'reservas-activas' | 'historial') => {
  pestanaActiva.value = pestana
  if (pestana === 'solicitudes' && (!solicitudesPendientes.value || solicitudesPendientes.value.length === 0)) {
    cargarSolicitudesPendientes()
  } else if (pestana === 'reservas-activas' && (!reservasActivas.value || reservasActivas.value.length === 0)) {
    cargarReservasActivas()
  } else if (pestana === 'historial' && (!historialReservas.value || historialReservas.value.length === 0)) {
    cargarHistorialReservas()
  }
}

// Métodos - Publicaciones
const cargarPublicaciones = async () => {
  try {
    cargando.value = true
    error.value = null
    const response = await publicacionesService.obtenerMisPublicaciones()
    publicaciones.value = Array.isArray(response) ? response : []
  } catch (err: any) {
    console.error('Error al cargar publicaciones:', err)
    error.value = err.message || 'Error al cargar las publicaciones'
    publicaciones.value = []
  } finally {
    cargando.value = false
  }
}

// Métodos - Solicitudes
const cargarSolicitudesPendientes = async () => {
  try {
    cargandoSolicitudes.value = true
    errorSolicitudes.value = null
    const response = await reservasService.obtenerSolicitudesPendientes()
    solicitudesPendientes.value = Array.isArray(response) ? response : []
  } catch (err: any) {
    console.error('Error al cargar solicitudes:', err)
    errorSolicitudes.value = err.message || 'Error al cargar las solicitudes'
    solicitudesPendientes.value = []
  } finally {
    cargandoSolicitudes.value = false
  }
}

const aprobarSolicitud = async (solicitudId: string) => {
  try {
    procesandoSolicitud.value = solicitudId
    await reservasService.aprobarReserva(solicitudId, {})
    
    // Remover la solicitud de la lista
    if (Array.isArray(solicitudesPendientes.value)) {
      solicitudesPendientes.value = solicitudesPendientes.value.filter(s => s.id !== solicitudId)
    }
    
    // Mostrar mensaje de éxito
    alert('Solicitud aprobada exitosamente')
  } catch (err: any) {
    console.error('Error al aprobar solicitud:', err)
    alert(err.response?.data?.message || 'Error al aprobar la solicitud')
  } finally {
    procesandoSolicitud.value = null
  }
}

const mostrarModalRechazo = (solicitud: SolicitudReserva) => {
  solicitudArechazar.value = solicitud
  motivoRechazo.value = ''
  modalRechazoVisible.value = true
}

const cerrarModalRechazo = () => {
  modalRechazoVisible.value = false
  solicitudArechazar.value = null
  motivoRechazo.value = ''
}

const confirmarRechazo = async () => {
  if (!solicitudArechazar.value) return
  
  try {
    procesandoSolicitud.value = solicitudArechazar.value.id
    await reservasService.rechazarReserva(solicitudArechazar.value.id, {
      motivo: motivoRechazo.value || undefined
    })
    
    // Remover la solicitud de la lista
    if (Array.isArray(solicitudesPendientes.value)) {
      solicitudesPendientes.value = solicitudesPendientes.value.filter(s => s.id !== solicitudArechazar.value!.id)
    }
    
    // Cerrar modal y mostrar mensaje de éxito
    cerrarModalRechazo()
    alert('Solicitud rechazada exitosamente')
  } catch (err: any) {
    console.error('Error al rechazar solicitud:', err)
    alert(err.response?.data?.message || 'Error al rechazar la solicitud')
  } finally {
    procesandoSolicitud.value = null
  }
}

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Métodos - Reservas Activas
const cargarReservasActivas = async () => {
  try {
    cargandoReservasActivas.value = true
    errorReservasActivas.value = null
    // TODO: Implementar servicio para obtener reservas activas del propietario
    reservasActivas.value = []
  } catch (err: any) {
    console.error('Error al cargar reservas activas:', err)
    errorReservasActivas.value = err.message || 'Error al cargar las reservas activas'
  } finally {
    cargandoReservasActivas.value = false
  }
}

// Métodos - Historial de Reservas
const cargarHistorialReservas = async () => {
  try {
    cargandoHistorial.value = true
    errorHistorial.value = null
    // TODO: Implementar servicio para obtener historial de reservas del propietario
    historialReservas.value = []
  } catch (err: any) {
    console.error('Error al cargar historial:', err)
    errorHistorial.value = err.message || 'Error al cargar el historial'
  } finally {
    cargandoHistorial.value = false
  }
}

// Métodos - Acciones de Reservas
const contactarArrendatario = (email: string) => {
  window.location.href = `mailto:${email}`
}

const verDetalleReserva = (reservaId: string) => {
  console.log('Ver detalle de reserva:', reservaId)
  // TODO: Implementar navegación a detalle de reserva
}

const calificarArrendatario = (reservaId: string) => {
  console.log('Calificar arrendatario:', reservaId)
  // TODO: Implementar modal de calificación
}

const formatearEstadoReserva = (estado: string) => {
  const estados: Record<string, string> = {
    'PENDIENTE': 'Pendiente',
    'APROBADA': 'Aprobada',
    'ACTIVA': 'Activa',
    'COMPLETADA': 'Completada',
    'CANCELADA': 'Cancelada',
    'RECHAZADA': 'Rechazada'
  }
  return estados[estado] || estado
}

const formatearEstado = (estado: string) => {
  const estados: Record<string, string> = {
    'ACTIVA': 'Activa',
    'PAUSADA': 'Pausada',
    'INACTIVA': 'Inactiva'
  }
  return estados[estado] || estado
}

const formatearEstadoModeracion = (estado: string) => {
  const estados: Record<string, string> = {
    'PENDIENTE_REVISION': 'Pendiente',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada'
  }
  return estados[estado] || estado
}

const editarPublicacion = (id: string) => {
  console.log('Editar publicación:', id)
  router.push(`/editar-publicacion/${id}`)
}

const confirmarEliminar = (publicacion: Publicacion) => {
  const confirmacion = confirm(
    `¿Estás seguro de que quieres eliminar la publicación "${publicacion.titulo}"?\n\nEsta acción no se puede deshacer.`
  )
  
  if (confirmacion) {
    eliminarPublicacion(publicacion.id)
  }
}

const eliminarPublicacion = async (id: string) => {
  try {
    eliminando.value = id
    await publicacionesService.eliminarPublicacion(id)
    
    // Remover la publicación de la lista local
    if (Array.isArray(publicaciones.value)) {
      publicaciones.value = publicaciones.value.filter(p => p.id !== id)
    }
    
    // Mostrar mensaje de éxito
    alert('Publicación eliminada exitosamente')
  } catch (err: any) {
    console.error('Error al eliminar publicación:', err)
    alert(err.response?.data?.message || 'Error al eliminar la publicación')
  } finally {
    eliminando.value = null
  }
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