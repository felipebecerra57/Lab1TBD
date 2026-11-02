<template>
  <div class="login-container">
    <h2>Sistema Veterinario</h2>
    <form @submit.prevent="manejarLogin">
      <div>
        <label>Correo Electrónico:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Iniciar Sesión</button>
    </form>
    <p v-if="errorMensaje" style="color: red;">{{ errorMensaje }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const email = ref('');
const password = ref('');
const errorMensaje = ref('');
const router = useRouter();

const manejarLogin = async () => {
  try {
    // 1. Pegarle al endpoint que construiste en el backend
    const respuesta = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    // 2. Extraer y guardar el token
    const token = respuesta.data.token;
    localStorage.setItem('token', token);

    // 3. Decodificar el token para saber quién entró
    const payload = jwtDecode(token);
    
    // 4. Redirigir según el rol
    if (payload.rol === 'ADMIN') {
      router.push('/admin/sedes');
    } else if (payload.rol === 'VET') {
      router.push('/vet/atencion');
    } else if (payload.rol === 'TUTOR') {
      router.push('/tutor/mascotas');
    } else {
      router.push('/');
    }

  } catch (error) {
    errorMensaje.value = 'Credenciales inválidas o error en el servidor.';
    console.error(error);
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>