<template>
  <nav class="navbar" v-if="isLoggedIn">
    <div class="navbar-brand">
      <h2>🐾 Veterinaria TBD</h2>
    </div>
    
    <ul class="navbar-menu">
      <!-- Enlaces exclusivos para ADMINISTRADOR -->
      <template v-if="rol === 'ADMIN'">
        <li><router-link to="/admin/sedes">Sedes</router-link></li>
        <li><router-link to="/admin/inventario">Inventario</router-link></li>
        <li><router-link to="/admin/estadisticas">Estadísticas</router-link></li>
        <li><router-link to="/agenda">Agenda</router-link></li>
      </template>

      <!-- Enlaces exclusivos para VETERINARIO -->
      <template v-if="rol === 'VET'">
        <li><router-link to="/vet/atencion">Atención Clínica</router-link></li>
        <li><router-link to="/vet/vacunacion">Vacunación</router-link></li>
        <li><router-link to="/agenda">Agenda</router-link></li>
      </template>

      <!-- Enlaces exclusivos para TUTOR -->
      <template v-if="rol === 'TUTOR'">
        <li><router-link to="/tutor/mascotas">Mis Mascotas</router-link></li>
      </template>
    </ul>

    <div class="navbar-actions">
      <span class="user-badge">Rol: {{ rol }}</span>
      <button @click="cerrarSesion" class="btn-logout">Cerrar Sesión</button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Usamos ref para que sean reactivas
const isLoggedIn = ref(false);
const rol = ref('');

// Función para actualizar los valores desde localStorage
const actualizarEstado = () => {
  isLoggedIn.value = !!localStorage.getItem('token');
  // Usamos .toUpperCase() por si el rol se guardó en minúsculas en el login
  // y .trim() por si se guardó con espacios.
  const storedRol = localStorage.getItem('rol');
  rol.value = storedRol ? storedRol.replace(/['"]+/g, '').trim().toUpperCase() : ''; 
};

// Escuchamos cambios (útil si el login ocurre en otra ventana/pestaña, o puedes emitir un evento global)
onMounted(() => {
  actualizarEstado();
  // Listener opcional para capturar cambios en el Storage desde otra pestaña
  window.addEventListener('storage', actualizarEstado);
});

onUnmounted(() => {
  window.removeEventListener('storage', actualizarEstado);
});

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  localStorage.removeItem('usuarioId');
  actualizarEstado(); // Forzamos la actualización al cerrar sesión
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-brand h2 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.navbar-menu a {
  color: #ecf0f1;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.navbar-menu a:hover,
.navbar-menu a.router-link-exact-active {
  background-color: #34495e;
  color: #42b983;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-badge {
  background-color: #42b983;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-logout:hover {
  background-color: #c0392b;
}
</style>