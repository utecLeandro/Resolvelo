<template>
  <div
    class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-6 overflow-x-hidden"
  >
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Administración</h1>
        <p class="text-sm text-gray-600">
          Desde estas secciones puedes revisar el estado de usuarios y moderar
          publicaciones.
        </p>
      </div>
    </div>

    <!-- Accesos del panel -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Usuarios -->
      <RouterLink
        to="/admin/usuarios"
        class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div class="flex items-start">
          <div
            class="w-10 h-10 mr-4 rounded-full bg-blue-600/90 text-white grid place-items-center"
          >
            <!-- Ícono de usuario solo con contorno y cabeza conectada al cuerpo -->
            <svg
              class="w-6 h-6 block transform -translate-y-[1px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <!-- Cabeza -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <!-- Conexión cuello: une el borde inferior de la cabeza con el cuerpo -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 11v3"
              />
              <!-- Cuerpo -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">
                Gestión de Usuarios
              </h2>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              Listar, verificar y cambiar estado de usuarios
            </p>
            <div class="mt-4">
              <span
                class="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white group-hover:bg-blue-700"
                >Ingresar</span
              >
            </div>
          </div>
        </div>
      </RouterLink>

      <!-- Publicaciones -->
      <RouterLink
        to="/admin/publicaciones"
        class="group bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div class="flex items-start">
          <div
            class="w-10 h-10 mr-4 rounded-full bg-indigo-600/90 text-white flex items-center justify-center"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 8h8M8 12h8M8 16h8"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">
                Gestión de Publicaciones
              </h2>
            </div>
            <p class="text-sm text-gray-600 mt-1">
              Listado y moderación de publicaciones
            </p>
            <div class="mt-4">
              <span
                class="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md bg-indigo-600 text-white group-hover:bg-indigo-700"
                >Ingresar</span
              >
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
/* Sin reglas adicionales por ahora: se hereda estilo del layout general */
</style>
