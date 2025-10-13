<!-- App.vue actualizado para usar RouterView y una cabecera simple -->
<script setup lang="ts">
// Comentarios: App contenedor principal, muestra RouterView para renderizar páginas
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="px-4 py-3 border-b bg-white">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">ReSolVelo</h1>
        <nav class="space-x-4 text-sm">
          <router-link to="/login" class="text-gray-700 hover:text-indigo-600">Login</router-link>
          <router-link to="/registro" class="text-gray-700 hover:text-indigo-600">Registro</router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-5xl mx-auto p-4">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* App actúa como layout básico */
</style>
