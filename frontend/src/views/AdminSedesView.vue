<template>
  <div style="padding: 20px;">
    <h1>Administración de Sedes</h1>
    <p>¡Bienvenido Administrador! Lograste pasar la aduana del Login.</p>
    <button @click="cerrarSesion">Cerrar Sesión</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const cerrarSesion = () => {
  localStorage.removeItem('token'); // Borramos el candado
  router.push('/login'); // Lo devolvemos al inicio
};
</script>