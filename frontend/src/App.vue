<template>
  <div id="app">
    <!-- Solo mostramos el Navbar si NO estamos en la ruta de login -->
    <Navbar v-if="route.name !== 'Login'" />
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();
</script>

<style>
/* Estilos globales básicos */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f7f6;
}

.main-content {
  padding: 20px;
}
</style>