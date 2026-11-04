<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>🐾 Veterinaria TBD</h2>
        <p>Ingreso al Sistema</p>
      </div>
      
      <form @submit.prevent="manejarLogin" class="login-form">
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="ejemplo@veterinaria.cl" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="••••••••" 
            required 
          />
        </div>
        
        <button type="submit" class="btn-login">Iniciar Sesión</button>
      </form>
      
      <p v-if="errorMensaje" class="error-message">{{ errorMensaje }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api'; // Verifica que esta ruta sea correcta en tu proyecto

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
    
    // Guardar el rol y el ID en el localStorage
    localStorage.setItem('rol', payload.rol);
    if (payload.idUsuario || payload.id) {
       localStorage.setItem('usuarioId', payload.idUsuario || payload.id); 
    }
    
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
/* Contenedor que ocupa toda la pantalla para centrar la tarjeta */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* Tarjeta principal del formulario */
.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

/* Encabezado del login */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.login-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.login-header p {
  margin: 0.5rem 0 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

/* Estructura del formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* Campos de texto */
.form-group input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15);
}

/* Botón principal (mismo verde que el Navbar) */
.btn-login {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.btn-login:hover {
  background-color: #3aa876;
}

/* Mensaje de error */
.error-message {
  color: #e74c3c;
  background-color: #fdeaea;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
  margin-top: 1.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  border: 1px solid #fad2d2;
}
</style>