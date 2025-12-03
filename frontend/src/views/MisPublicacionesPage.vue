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
        <div class="border-b border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <nav class="-mb-px flex space-x-8 min-w-full sm:min-w-0" aria-label="Tabs">
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
              Solicitudes Activas
              <span v-if="reservasActivasFiltradas.length > 0" class="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs font-medium">
                {{ reservasActivasFiltradas.length }}
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
        <div class="border-b border-gray-100 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <nav class="-mb-px flex space-x-6 min-w-full sm:min-w-0" aria-label="Sub Tabs">
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
        <div class="border-b border-gray-100 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <nav class="-mb-px flex space-x-6 min-w-full sm:min-w-0" aria-label="Sub Tabs">
            <button
              @click="subPestanaSolicitudes = 'pendientes'"
              :class="[
                subPestanaSolicitudes === 'pendientes'
                  ? 'border-blue-400 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Pendientes ({{ solicitudesPendientesCount.length }})
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3-2-1.343-2-3-2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
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
          <!-- Imagen de publicación -->
          <div class="aspect-w-16 aspect-h-9 bg-white">
            <div class="w-full h-48 flex items-center justify-center overflow-hidden">
              <img v-if="obtenerImagenPrincipalUrl(publicacion.imagenes)" :src="obtenerImagenPrincipalUrl(publicacion.imagenes)" alt="Imagen de publicación" class="w-full h-full object-contain" @error="()=>{}" />
              <svg v-else class="h-12 w-12 text-blue-400 opacity-60" fill="currentColor" viewBox="0 0 24 24" :aria-label="publicacion.titulo">
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
                <div class="flex items-center space-x-2 mb-3">
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

                <!-- Estadísticas de Reservas -->
                <div v-if="publicacion.estadisticasReservas" class="mb-4">
                  <h4 class="text-xs font-medium text-gray-700 mb-2">Estadísticas de Reservas</h4>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <!-- Total de reservas -->
                    <div class="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                      <span class="text-gray-600">Total:</span>
                      <span class="font-medium text-gray-900">{{ publicacion.estadisticasReservas.total }}</span>
                    </div>
                    
                    <!-- Pendientes -->
                    <div v-if="publicacion.estadisticasReservas.pendientes > 0" class="flex items-center justify-between bg-yellow-50 px-2 py-1 rounded">
                      <span class="text-yellow-700">Pendientes:</span>
                      <span class="font-medium text-yellow-800">{{ publicacion.estadisticasReservas.pendientes }}</span>
                    </div>
                    
                    <!-- Aprobadas -->
                    <div v-if="publicacion.estadisticasReservas.aprobadas > 0" class="flex items-center justify-between bg-blue-50 px-2 py-1 rounded">
                      <span class="text-blue-700">Aprobadas:</span>
                      <span class="font-medium text-blue-800">{{ publicacion.estadisticasReservas.aprobadas }}</span>
                    </div>
                    
                    <!-- Confirmadas -->
                    <div v-if="publicacion.estadisticasReservas.confirmadas > 0" class="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                      <span class="text-green-700">Confirmadas:</span>
                      <span class="font-medium text-green-800">{{ publicacion.estadisticasReservas.confirmadas }}</span>
                    </div>
                    
                    <!-- Activas -->
                    <div v-if="publicacion.estadisticasReservas.activas > 0" class="flex items-center justify-between bg-purple-50 px-2 py-1 rounded">
                      <span class="text-purple-700">Activas:</span>
                      <span class="font-medium text-purple-800">{{ publicacion.estadisticasReservas.activas }}</span>
                    </div>
                    
                    <!-- Completadas -->
                    <div v-if="publicacion.estadisticasReservas.completadas > 0" class="flex items-center justify-between bg-emerald-50 px-2 py-1 rounded">
                      <span class="text-emerald-700">Completadas:</span>
                      <span class="font-medium text-emerald-800">{{ publicacion.estadisticasReservas.completadas }}</span>
                    </div>
                    
                    <!-- Rechazadas -->
                    <div v-if="publicacion.estadisticasReservas.rechazadas > 0" class="flex items-center justify-between bg-red-50 px-2 py-1 rounded">
                      <span class="text-red-700">Rechazadas:</span>
                      <span class="font-medium text-red-800">{{ publicacion.estadisticasReservas.rechazadas }}</span>
                    </div>
                    
                    <!-- Canceladas -->
                    <div v-if="publicacion.estadisticasReservas.canceladas > 0" class="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                      <span class="text-gray-700">Canceladas:</span>
                      <span class="font-medium text-gray-800">{{ publicacion.estadisticasReservas.canceladas }}</span>
                    </div>
                  </div>
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
            :id="`solicitud-${solicitud.id}`"
            :class="[
              'rounded-lg shadow-md overflow-hidden',
              solicitud.estado === 'CONFIRMADA' 
                ? 'bg-white border-l-4 border-green-500' 
                : 'bg-white',
              highlightSolicitudId === solicitud.id ? 'ring-2 ring-orange-400 rounded-lg transition-shadow duration-500' : ''
            ]"
          >
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <!-- Imagen de la publicación -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <img v-if="obtenerImagenPrincipalUrl(solicitud.publicacion.imagenes)" :src="obtenerImagenPrincipalUrl(solicitud.publicacion.imagenes)" alt="Imagen de publicación" class="w-full h-full object-contain" />
                    <svg v-else class="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
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
                            <span class="text-gray-500">Fecha de solicitud:</span>
                            <span class="ml-1 text-gray-900">{{ formatearFecha(solicitud.fechaCreacion) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Botones de acción condicionales -->
                      <!-- Para solicitudes aprobadas (CONFIRMADA) -->
                      <div v-if="solicitud.estado === 'CONFIRMADA'" class="space-y-3">
                        <!-- Estado confirmada -->
                        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                          Confirmada
                        </div>
                        
                        <!-- Botones para solicitud confirmada -->
                        <div class="flex space-x-3">
                          <button
                            @click="irAlChatReserva(solicitud.id)"
                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            Contactar
                          </button>
                          <button
                            @click="verDetallesSolicitud(solicitud)"
                            class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            Ver Detalle
                          </button>
                        </div>
                      </div>

                      <!-- Para solicitudes pendientes -->
                      <div v-else-if="solicitud.estado === 'PENDIENTE'" class="flex space-x-3">
                        <button
                          @click="aprobarSolicitud(solicitud)"
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

                      <!-- Para solicitudes rechazadas -->
                      <div v-else-if="solicitud.estado === 'RECHAZADA'" class="flex items-center">
                        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                          Rechazada
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

      <!-- Contenido de la pestaña Reservas Activas -->
      <div v-else-if="pestanaActiva === 'reservas-activas'">
        <!-- Header con botón de actualización -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">Reservas Activas</h3>
          <button
            @click="cargarReservasActivas"
            :disabled="cargandoReservasActivas"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg class="h-4 w-4 mr-1" :class="{ 'animate-spin': cargandoReservasActivas }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ cargandoReservasActivas ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">Se muestran reservas en curso con pago exitoso. No incluye confirmadas.</p>

        <!-- Estado de carga reservas activas -->
        <div v-if="cargandoReservasActivas" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando reservas activas...</span>
        </div>

        <!-- Error reservas activas -->
        <div v-else-if="errorReservasActivas" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-red-800">Error al cargar reservas activas</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorReservasActivas }}</p>
              <div class="mt-3">
                <button
                  @click="cargarReservasActivas"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin reservas activas -->
        <div v-else-if="reservasActivasFiltradas.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes reservas activas</h3>
          <p class="mt-1 text-sm text-gray-500">Las reservas pagadas y en curso aparecerán aquí.</p>
        </div>

        <!-- Lista de reservas activas -->
        <div v-else class="space-y-6">
          <div
            v-for="reserva in reservasActivasFiltradas"
            :key="reserva.id"
            :id="`reserva-${reserva.id}`"
            :class="[
              'bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500',
              highlightReservaId === reserva.id ? 'ring-2 ring-green-400 rounded-lg transition-shadow duration-500' : ''
            ]"
          >
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <!-- Imagen de la publicación -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <img v-if="obtenerImagenPrincipalUrl(reserva.publicacion.imagenes)" :src="obtenerImagenPrincipalUrl(reserva.publicacion.imagenes)" alt="Imagen de publicación" class="w-full h-full object-contain" />
                    <svg v-else class="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
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
                            <span class="text-gray-500">Fecha de solicitud:</span>
                            <span class="ml-1 text-gray-900">{{ formatearFecha(reserva.fechaCreacion) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Botones de acción -->
                      <div class="flex space-x-3">
                        <button
                          @click="irAlChatReserva(reserva.id)"
                          class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                        >
                          Contactar
                        </button>
                        <button
                          v-if="reserva.estado === 'EN_CURSO'"
                          @click="finalizarReserva(reserva.id)"
                          class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                        >
                          Finalizar
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
        <!-- Header con botón de actualización -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">Historial de Reservas</h3>
          <button
            @click="cargarHistorialReservas"
            :disabled="cargandoHistorial"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg class="h-4 w-4 mr-1" :class="{ 'animate-spin': cargandoHistorial }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ cargandoHistorial ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>

        <!-- Estado de carga historial -->
        <div v-if="cargandoHistorial" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Cargando historial...</span>
        </div>

        <!-- Error historial -->
        <div v-else-if="errorHistorial" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-red-800">Error al cargar historial</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorHistorial }}</p>
              <div class="mt-3">
                <button
                  @click="cargarHistorialReservas"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
              </div>
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
                  <div class="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <img v-if="obtenerImagenPrincipalUrl(reserva.publicacion.imagenes)" :src="obtenerImagenPrincipalUrl(reserva.publicacion.imagenes)" alt="Imagen de publicación" class="w-full h-full object-contain" />
                    <svg v-else class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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
            :disabled="!!procesandoSolicitud"
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
            :disabled="!!procesandoSolicitud"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de calificación -->
  <div v-if="modalCalificacionVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Calificar arrendatario</h3>
        
        <div v-if="reservaAcalificar" class="mb-4 p-3 bg-gray-50 rounded-md">
          <p class="text-sm text-gray-600">
            <strong>Arrendatario:</strong> {{ reservaAcalificar.usuario?.nombre }} {{ reservaAcalificar.usuario?.apellido }}
          </p>
          <p class="text-sm text-gray-600">
            <strong>Equipo:</strong> {{ reservaAcalificar.publicacion?.titulo }}
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Calificación
          </label>
          <div class="flex items-center space-x-1">
            <button
              v-for="star in 5"
              :key="star"
              @click="calificacion = star"
              class="text-2xl focus:outline-none"
              :class="star <= calificacion ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </button>
            <span class="ml-2 text-sm text-gray-600">({{ calificacion }}/5)</span>
          </div>
        </div>

        <div class="mb-4">
          <label for="comentario" class="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            v-model="comentarioCalificacion"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Comparte tu experiencia con este arrendatario..."
          ></textarea>
        </div>

        <div class="flex space-x-3">
          <button
            @click="enviarCalificacion"
            :disabled="enviandoCalificacion"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="enviandoCalificacion" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </span>
            <span v-else>Enviar calificación</span>
          </button>
          <button
            @click="cerrarModalCalificacion"
            :disabled="enviandoCalificacion"
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
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { publicacionesService, reservasService } from '../services/api'
import type { Publicacion } from '../services/api'
let bc: BroadcastChannel | null = null

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
    imagenes?: Array<string | { url: string; esPrincipal?: boolean }>
  }
  usuario: {
    nombre: string
    apellido: string
    email: string
    direccion?: string
  }
  fechaCreacion?: string
}

// Composables
const router = useRouter()
const route = useRoute()

// Estado reactivo - Pestañas
const pestanaActiva = ref<'publicaciones' | 'solicitudes' | 'reservas-activas' | 'historial'>('publicaciones')
const subPestanaPublicaciones = ref<'todas' | 'activas' | 'pausadas' | 'revision'>('todas')
const subPestanaSolicitudes = ref<'pendientes' | 'aprobadas' | 'rechazadas'>('pendientes')

// Estado reactivo - Publicaciones
type EstadisticasReservas = {
  total: number
  pendientes: number
  aprobadas: number
  confirmadas: number
  activas: number
  completadas: number
  rechazadas: number
  canceladas: number
}

type PublicacionConStats = Publicacion & { estadisticasReservas?: EstadisticasReservas }

const publicaciones = ref<PublicacionConStats[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const eliminando = ref<string | null>(null)

// Estado reactivo - Solicitudes
const solicitudesPendientes = ref<SolicitudReserva[]>([])
const cargandoSolicitudes = ref(false)
const errorSolicitudes = ref<string | null>(null)
const procesandoSolicitud = ref<string | null>(null)
const focusSolicitudId = ref<string | null>(null)
const highlightSolicitudId = ref<string | null>(null)
const focusReservaId = ref<string | null>(null)
const highlightReservaId = ref<string | null>(null)

// Función de notificación nativa
const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success', offsetPx: number = 16) => {
  try {
    // Crear elemento de notificación
    const notificacion = document.createElement('div')
    notificacion.className = `fixed right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
      tipo === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`
    notificacion.textContent = mensaje
    notificacion.style.top = `${offsetPx}px`
    
    // Estilos iniciales para animación
    notificacion.style.transform = 'translateX(100%)'
    notificacion.style.opacity = '0'
    
    // Agregar al DOM
    document.body.appendChild(notificacion)
    
    // Animar entrada
    setTimeout(() => {
      notificacion.style.transform = 'translateX(0)'
      notificacion.style.opacity = '1'
    }, 10)
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notificacion.style.transform = 'translateX(100%)'
      notificacion.style.opacity = '0'
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion)
        }
      }, 300)
    }, 3000)
  } catch (error) {
    console.error('Error en mostrarNotificacion:', error)
    // Fallback: usar alert nativo
    alert(`${tipo === 'success' ? '✅' : '❌'} ${mensaje}`)
  }
}

// Watcher temporal para debug
watch(procesandoSolicitud, (newVal, oldVal) => {
  console.log('🔍 procesandoSolicitud cambió:', { oldVal, newVal })
})

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

// Estado reactivo - Modal de calificación
const modalCalificacionVisible = ref(false)
const reservaAcalificar = ref<any | null>(null)
const calificacion = ref(5)
const comentarioCalificacion = ref('')
const enviandoCalificacion = ref(false)

// Computed
const obtenerImagenPrincipalUrl = (imagenes: any): string => {
  if (!Array.isArray(imagenes) || imagenes.length === 0) return ''
  const first = imagenes[0]
  if (typeof first === 'string') return first || ''
  const principal = (imagenes as any[]).find(i => i?.esPrincipal) || first
  return principal?.url || ''
}

// Computed properties para publicaciones
const publicacionesActivas = computed(() => (publicaciones.value || []).filter(p => p.estado === 'ACTIVA' && p.estadoModeracion === 'APROBADA'))
const publicacionesPausadas = computed(() => (publicaciones.value || []).filter(p => p.estado === 'PAUSADA'))
const publicacionesEnRevision = computed(() => (publicaciones.value || []).filter(p => p.estadoModeracion === 'PENDIENTE_REVISION'))

// Computed properties para solicitudes
const solicitudesPendientesCount = computed(() => (solicitudesPendientes.value || []).filter(s => s.estado === 'PENDIENTE'))
const solicitudesAprobadas = computed(() => (solicitudesPendientes.value || []).filter(s => s.estado === 'CONFIRMADA'))
const solicitudesRechazadas = computed(() => (solicitudesPendientes.value || []).filter(s => s.estado === 'RECHAZADA'))

const publicacionesFiltradas = computed(() => {
  if (pestanaActiva.value !== 'publicaciones') return []
  
  const pubs = publicaciones.value || []
  
  switch (subPestanaPublicaciones.value) {
    case 'todas':
      return pubs
    case 'activas':
      return pubs.filter(p => p.estado === 'ACTIVA' && p.estadoModeracion === 'APROBADA')
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
      return solicitudes.filter(s => s.estado === 'CONFIRMADA')
    case 'rechazadas':
      return solicitudes.filter(s => s.estado === 'RECHAZADA')
    default:
      return solicitudes
  }
})

const reservasActivasFiltradas = computed(() => {
  const rs = reservasActivas.value || []
  return rs.filter(r => r.estado === 'EN_CURSO' && ((r.transacciones || []).some((tx: any) => tx.estado === 'COMPLETADA')))
})

// Cargar datos al montar el componente
onMounted(async () => {
  console.log('🚀 MisPublicacionesPage montado')
  console.log('🔍 Estado inicial procesandoSolicitud:', procesandoSolicitud.value)
  await cargarPublicaciones()
  await cargarSolicitudesPendientes()
  window.addEventListener('reserva-actualizada', manejarActualizacionPropietario)
  window.addEventListener('storage', storageListener)
  try {
    bc = new BroadcastChannel('resolvelo-events')
    bc.onmessage = async (ev: MessageEvent) => {
      const data = ev.data || {}
      if (data?.tipo === 'reserva-actualizada' && (data?.nuevoEstado === 'EN_CURSO' || data?.accion === 'pago-aprobado')) {
        pestanaActiva.value = 'reservas-activas'
        await cargarReservasActivas()
      }
    }
  } catch {}
  const tab = (route.query.tab as string) || ''
  const focus = (route.query.focus as string) || ''
  if (tab === 'solicitudes') {
    pestanaActiva.value = 'solicitudes'
    if (focus) focusSolicitudId.value = focus
  } else if (tab === 'reservas-activas') {
    pestanaActiva.value = 'reservas-activas'
    if (focus) focusReservaId.value = focus
    await cargarReservasActivas()
  }
})

const manejarActualizacionPropietario = async (event: Event) => {
  try {
    const { nuevoEstado, accion } = (event as CustomEvent).detail || {}
    if (nuevoEstado === 'EN_CURSO' || accion === 'pago-aprobado') {
      pestanaActiva.value = 'reservas-activas'
      await cargarReservasActivas()
    }
  } catch {}
}

const storageListener = async (ev: StorageEvent) => {
  try {
    if (ev.key !== 'reserva_actualizada_event') return
    const val = ev.newValue
    if (!val) return
    const data = JSON.parse(val)
    if (data?.nuevoEstado === 'EN_CURSO' || data?.accion === 'pago-aprobado') {
      pestanaActiva.value = 'reservas-activas'
      await cargarReservasActivas()
    }
  } catch {}
}

onUnmounted(() => {
  window.removeEventListener('reserva-actualizada', manejarActualizacionPropietario)
  window.removeEventListener('storage', storageListener)
  try {
    if (bc) bc.close()
    bc = null
  } catch {}
})

watch(focusSolicitudId, async (id) => {
  if (!id) return
  await nextTick()
  setTimeout(() => {
    const el = document.getElementById(`solicitud-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightSolicitudId.value = id
      setTimeout(() => {
        if (highlightSolicitudId.value === id) {
          highlightSolicitudId.value = null
        }
      }, 3000)
    }
  }, 150)
})

watch(focusReservaId, async (id) => {
  if (!id) return
  await nextTick()
  setTimeout(() => {
    const el = document.getElementById(`reserva-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightReservaId.value = id
      setTimeout(() => {
        if (highlightReservaId.value === id) {
          highlightReservaId.value = null
        }
      }, 3000)
    }
  }, 150)
})

// Métodos - Pestañas
 

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
    const response = await reservasService.obtenerTodasLasSolicitudes()
    solicitudesPendientes.value = Array.isArray(response) ? response : []
  } catch (err: any) {
    console.error('Error al cargar solicitudes:', err)
    errorSolicitudes.value = err.message || 'Error al cargar las solicitudes'
    solicitudesPendientes.value = []
  } finally {
    cargandoSolicitudes.value = false
  }
}

const aprobarSolicitud = async (solicitud: SolicitudReserva) => {
  // Establecer estado de procesamiento
  procesandoSolicitud.value = solicitud.id
  
  try {
    const response = await reservasService.aprobarReserva(solicitud.id, {})
    
    if (response.success) {
       const solicitudIndex = solicitudesPendientes.value.findIndex(s => s.id === solicitud.id)
       if (solicitudIndex !== -1) {
         const target = solicitudesPendientes.value[solicitudIndex]
         if (target) target.estado = 'CONFIRMADA'
       }
       
       // Emitir evento para actualización en tiempo real
       const evento = new CustomEvent('reserva-actualizada', {
         detail: {
           reservaId: solicitud.id,
           nuevoEstado: 'CONFIRMADA',
           accion: 'aprobada'
         }
       })
      window.dispatchEvent(evento)
      
      // Mostrar mensaje de éxito
      mostrarNotificacion('Solicitud aprobada exitosamente', 'success', 64)
      
      // Recargar solo las publicaciones (para actualizar estadísticas)
      await cargarPublicaciones()
      
      // Opcional: recargar solicitudes después de un pequeño delay para sincronizar con el servidor
      setTimeout(async () => {
        await cargarSolicitudesPendientes()
      }, 1000)
    } else {
      throw new Error(response.message || 'Error al aprobar la solicitud')
    }
  } catch (error: any) {
    console.error('Error al aprobar solicitud:', error)
    mostrarNotificacion(error.message || 'Error al aprobar la solicitud', 'error')
  } finally {
    // Limpiar estado de procesamiento
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
    
    const response = await reservasService.rechazarReserva(solicitudArechazar.value.id, {
      motivo: motivoRechazo.value || undefined
    })
    
    if (response.success) {
      const solicitudIndex = solicitudesPendientes.value.findIndex(s => s.id === solicitudArechazar.value!.id)
      if (solicitudIndex !== -1) {
        const target = solicitudesPendientes.value[solicitudIndex]
        if (target) target.estado = 'RECHAZADA'
      }
      
      // Emitir evento para actualización en tiempo real
      const evento = new CustomEvent('reserva-actualizada', {
        detail: {
          reservaId: solicitudArechazar.value.id,
          nuevoEstado: 'RECHAZADA',
          accion: 'rechazada'
        }
      })
      window.dispatchEvent(evento)
      
      // Cerrar modal y mostrar mensaje de éxito
      cerrarModalRechazo()
      mostrarNotificacion('Solicitud rechazada exitosamente', 'success')
      
      // Recargar solo las publicaciones (para actualizar estadísticas)
      await cargarPublicaciones()
      
      // Opcional: recargar solicitudes después de un pequeño delay para sincronizar con el servidor
      setTimeout(async () => {
        await cargarSolicitudesPendientes()
      }, 1000)
    } else {
      throw new Error(response.message || 'Error al rechazar la solicitud')
    }
  } catch (error: any) {
    console.error('Error al rechazar solicitud:', error)
    mostrarNotificacion(error.message || 'Error al rechazar la solicitud', 'error')
  }
}

const formatearFecha = (fecha?: string) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Flujo unificado: el botón Contactar abre el chat de la reserva

const verDetallesSolicitud = (solicitud: SolicitudReserva) => {
  // Aquí puedes implementar la lógica para mostrar los detalles completos
  // Por ejemplo, abrir un modal con toda la información de la solicitud
  console.log('Ver detalles de solicitud:', solicitud)
  
  // Por ahora, mostrar una notificación con información básica
  const fechaInicio = formatearFecha(solicitud.fechaInicio)
  const fechaFin = formatearFecha(solicitud.fechaFin)
  const mensaje = `Solicitud de ${solicitud.usuario?.nombre} para ${solicitud.publicacion?.titulo} del ${fechaInicio} al ${fechaFin} por $${solicitud.precioTotal}`
  
  mostrarNotificacion(mensaje, 'success')
}

// Métodos - Reservas Activas
const cargarReservasActivas = async () => {
  try {
    cargandoReservasActivas.value = true
    errorReservasActivas.value = null
    
    console.log('🔄 Cargando reservas activas del propietario...')
    const response = await reservasService.obtenerReservasActivasPropietario()
    
    if (response.success) {
      reservasActivas.value = response.data || []
      console.log('✅ Reservas activas cargadas:', reservasActivas.value.length)
    } else {
      throw new Error(response.message || 'Error al obtener reservas activas')
    }
  } catch (err: any) {
    console.error('❌ Error al cargar reservas activas:', err)
    errorReservasActivas.value = err.message || 'Error al cargar las reservas activas'
    reservasActivas.value = []
  } finally {
    cargandoReservasActivas.value = false
  }
}

// Métodos - Historial de Reservas
const cargarHistorialReservas = async () => {
  try {
    cargandoHistorial.value = true
    errorHistorial.value = null
    
    console.log('🔄 Cargando historial de reservas del propietario...')
    const response = await reservasService.obtenerHistorialReservasPropietario()
    
    if (response.success) {
      historialReservas.value = response.data || []
      console.log('✅ Historial de reservas cargado:', historialReservas.value.length)
    } else {
      throw new Error(response.message || 'Error al obtener historial de reservas')
    }
  } catch (err: any) {
    console.error('❌ Error al cargar historial:', err)
    errorHistorial.value = err.message || 'Error al cargar el historial'
    historialReservas.value = []
  } finally {
    cargandoHistorial.value = false
  }
}

// Métodos - Acciones de Reservas

const finalizarReserva = async (reservaId: string) => {
  if (!confirm('¿Confirmas que el instrumento ha sido devuelto y deseas finalizar la reserva?')) {
    return
  }
  
  try {
    cargandoReservasActivas.value = true
    await reservasService.finalizarReserva(reservaId)
    mostrarNotificacion('Reserva finalizada exitosamente', 'success')
    
    // Recargar reservas activas
    await cargarReservasActivas()
  } catch (err: any) {
    console.error('Error al finalizar reserva:', err)
    mostrarNotificacion(err.response?.data?.message || 'Error al finalizar la reserva', 'error')
    cargandoReservasActivas.value = false
  }
}

const verDetalleReserva = (reservaId: string) => {
  console.log('Ver detalle de reserva:', reservaId)
  // Navegar a la página de detalle de reserva
  router.push(`/reservas/${reservaId}`)
}

const irAlChatReserva = (reservaId: string) => {
  router.push(`/mensajes/reserva/${reservaId}`)
}

const calificarArrendatario = (reservaId: string) => {
  console.log('Calificar arrendatario:', reservaId)
  
  // Buscar la reserva en el historial
  const reserva = historialReservas.value.find(r => r.id === reservaId)
  if (!reserva) {
    console.error('Reserva no encontrada:', reservaId)
    return
  }
  
  // Configurar el modal de calificación
  reservaAcalificar.value = reserva
  calificacion.value = 5
  comentarioCalificacion.value = ''
  modalCalificacionVisible.value = true
}

const cerrarModalCalificacion = () => {
  modalCalificacionVisible.value = false
  reservaAcalificar.value = null
  calificacion.value = 5
  comentarioCalificacion.value = ''
}

const enviarCalificacion = async () => {
  if (!reservaAcalificar.value) return
  
  try {
    enviandoCalificacion.value = true
    
    // TODO: Implementar servicio de calificaciones
    console.log('Enviando calificación:', {
      reservaId: reservaAcalificar.value.id,
      calificacion: calificacion.value,
      comentario: comentarioCalificacion.value
    })
    
    // Simular envío exitoso
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    cerrarModalCalificacion()
    
    // Mostrar mensaje de éxito
    console.log('Calificación enviada exitosamente')
    
  } catch (error) {
    console.error('Error al enviar calificación:', error)
  } finally {
    enviandoCalificacion.value = false
  }
}

const formatearEstadoReserva = (estado: string) => {
  const estados: Record<string, string> = {
    'PENDIENTE': 'Pendiente',
    'CONFIRMADA': 'Confirmada',
    'APROBADA': 'Aprobada',
    'EN_CURSO': 'Activa',
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
