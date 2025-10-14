<!-- App.vue - Layout principal con navegación condicional -->
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavegacionPrincipal from './components/NavegacionPrincipal.vue'
import PiePagina from './components/PiePagina.vue'

// Composables
const route = useRoute()

// Estado reactivo para autenticación
const usuarioAutenticado = ref(false)
const nombreUsuario = ref('')

// Rutas que no deben mostrar navegación y pie de página
const rutasSinLayout = ['/login', '/registro', '/verificacion-pendiente']

// Computed para determinar si mostrar el layout completo
const mostrarLayoutCompleto = computed(() => {
  return !rutasSinLayout.includes(route.path)
})

// Verificar estado de autenticación al montar
onMounted(() => {
  verificarAutenticacion()
})

// Función para verificar si el usuario está autenticado
const verificarAutenticacion = () => {
  const token = localStorage.getItem('token')
  if (token) {
    // Aquí podrías verificar el token con el backend
    usuarioAutenticado.value = true
    // Obtener información del usuario del token o localStorage
    const userData = localStorage.getItem('userData')
    if (userData) {
      const user = JSON.parse(userData)
      nombreUsuario.value = `${user.nombre} ${user.apellido}`
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navegación principal (solo en páginas que la necesiten) -->
    <NavegacionPrincipal 
      v-if="mostrarLayoutCompleto"
      :usuario-autenticado="usuarioAutenticado"
      :nombre-usuario="nombreUsuario"
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
