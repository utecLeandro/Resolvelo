<!-- App.vue actualizado para usar RouterView y una cabecera simple -->
<script setup lang="ts">
// Comentarios: App contenedor principal, muestra RouterView para renderizar páginas
</script>

<template>
  <!-- Dejamos que cada pantalla controle su propio layout/fondo.
       Esto permite degradados a pantalla completa en Login/Registro. -->
  <RouterView />
  
</template>

<style scoped>
/* Sin estilos globales de fondo ni max-width para permitir fondos 100% viewport */
</style>
