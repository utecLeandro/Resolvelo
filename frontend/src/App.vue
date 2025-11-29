<!-- App.vue - Layout principal con navegación condicional -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavegacionPrincipal from './components/NavegacionPrincipal.vue'
import PiePagina from './components/PiePagina.vue'
import { useAuth } from './composables/useAuth'

// Composables
const route = useRoute()
const { usuarioAutenticado, nombreCompleto, verificarAutenticacion, datosUsuario } = useAuth()

// Rutas que no deben mostrar navegación y pie de página
// Mostramos la navegación también en /login y /registro para mantener estilos consistentes con el catálogo
const rutasSinLayout = ['/verificacion-pendiente']

// Computed para determinar si mostrar el layout completo
const mostrarLayoutCompleto = computed(() => {
  return !rutasSinLayout.includes(route.path)
})

// Verificar estado de autenticación al montar
onMounted(() => {
  verificarAutenticacion()
})

// Función para actualizar el estado de autenticación (puede ser llamada desde otros componentes)
const actualizarEstadoAutenticacion = () => {
  verificarAutenticacion()
}

// Exponer la función globalmente para que otros componentes puedan usarla
;(window as any).actualizarEstadoAutenticacion = actualizarEstadoAutenticacion
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navegación principal (solo en páginas que la necesiten) -->
    <NavegacionPrincipal 
      v-if="mostrarLayoutCompleto"
      :usuario-autenticado="usuarioAutenticado"
      :nombre-usuario="nombreCompleto"
      :avatar-url="datosUsuario?.avatarUrl || ''"
    />
    
    <!-- Contenido principal -->
    <main 
      class="flex-grow"
      :class="{ 'bg-gray-50': mostrarLayoutCompleto }"
    >
      <RouterView />
    </main>
    
    <!-- Pie de página (solo en páginas que lo necesiten) -->
    <PiePagina v-if="mostrarLayoutCompleto" />
  </div>
</template>

<style scoped>
/* Estilos globales mínimos para el layout */
</style>

<!-- Estilos globales no scoped para cursores en elementos clicables -->
<style>
/* Cursor de mano en elementos clicables al pasar por encima */
a[href]:hover,
button:not(:disabled):hover,
[role="button"]:not([aria-disabled="true"]):hover,
.clickable:hover,
.link:hover {
  cursor: pointer;
}

/* Mantener el cursor de no permitido si el botón está deshabilitado */
button:disabled,
[aria-disabled="true"] {
  cursor: not-allowed;
}
</style>
