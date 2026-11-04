<!-- views/PlanVacunacionView.vue -->
<template>
  <div class="vacunacion-form">
    <h2>Registrar y Aplicar Plan de Vacunación</h2>
    
    <form @submit.prevent="aplicarPlan" class="form-container">
      
      <div class="form-group">
        <label>ID Mascota:</label>
        <input type="number" v-model="form.idMascota" required placeholder="Ej: 1">
      </div>

      <div class="form-group">
        <label>Seleccionar Vacuna:</label>
        <select v-model="form.idVacuna" required>
          <option disabled value="">Seleccione una vacuna</option>
          <!-- Usamos idVacuna según lo que devuelva tu tabla de vacunas -->
          <option v-for="vacuna in vacunas" :key="vacuna.idVacuna" :value="vacuna.idVacuna">
            {{ vacuna.nombreV }} (Dosis: {{ vacuna.totalDosis }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Sede de Atención:</label>
        <select v-model="form.idSede" required>
          <option disabled value="">Seleccione una sede</option>
          <option v-for="sede in sedes" :key="sede.idSede" :value="sede.idSede">
            {{ sede.nombre }}
          </option>
        </select>
      </div>

      <!-- El controlador asume que el VET logueado es el que atiende. Si un ADMIN lo llena, puede necesitar esto -->
      <div class="form-group" v-if="rolUsuario === 'ADMIN'">
        <label>ID Veterinario:</label>
        <input type="number" v-model="form.idVeterinario" required placeholder="ID del veterinario a cargo">
      </div>

      <div class="form-group">
        <label>Fecha de Aplicación (1ra Dosis):</label>
        <input type="date" v-model="form.fechaInicio" required>
      </div>

      <div class="form-group">
         <label>Modalidad:</label>
         <select v-model="form.modalidad">
            <option value="SEDE">En Sede</option>
            <option value="DOMICILIO">A Domicilio</option>
         </select>
      </div>

      <div class="form-group" v-if="form.modalidad === 'DOMICILIO'">
         <label>Dirección (Domicilio):</label>
         <input type="text" v-model="form.direccionDomicilio" required placeholder="Ej: Av. Principal 123">
      </div>

      <button type="submit" class="btn-submit" :disabled="loading">
        {{ loading ? 'Generando Plan...' : 'Aplicar Plan y Agendar Refuerzos' }}
      </button>
    </form>
    
    <p v-if="mensaje" class="mensaje-exito">{{ mensaje }}</p>
    <p v-if="errorMsg" class="mensaje-error">{{ errorMsg }}</p>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';

const vacunas = ref([]);
const sedes = ref([]);
const loading = ref(false);
const mensaje = ref('');
const errorMsg = ref('');
const rolUsuario = ref(localStorage.getItem('rol'));

// Nombres exactos como los espera tu vacunacionController.js y citaMedicaController
const form = reactive({
  idMascota: '',
  idVacuna: '',
  idSede: '',
  idVeterinario: rolUsuario.value === 'VET' ? localStorage.getItem('usuarioId') : '',
  fechaInicio: new Date().toISOString().split('T')[0],
  modalidad: 'SEDE',
  direccionDomicilio: ''
});

onMounted(async () => {
  try {
    const resVacunas = await api.get('/vacunas'); // Asumiendo que esta es tu ruta
    vacunas.value = resVacunas.data;

    const resSedes = await api.get('/sedes'); // Asumiendo que esta es tu ruta
    sedes.value = resSedes.data;
  } catch (error) {
    console.error('Error cargando datos base:', error);
  }
});

const aplicarPlan = async () => {
  loading.value = true;
  mensaje.value = '';
  errorMsg.value = '';

  try {
    // La ruta asume algo como POST /api/mascotas/:id/plan-vacunacion (ajusta si es diferente)
    const payload = {
      idVacuna: form.idVacuna,
      idSede: form.idSede,
      fechaInicio: form.fechaInicio,
      modalidad: form.modalidad,
      idVeterinario: form.idVeterinario
    };

    if (form.modalidad === 'DOMICILIO') {
      payload.direccionDomicilio = form.direccionDomicilio;
    }

    // Asegúrate de que la ruta coincida con tu backend
    const { data } = await api.post(`/vacunacion/${form.idMascota}`, payload);
    
    mensaje.value = `${data.mensaje}. Citas de refuerzo agendadas: ${data.citasRefuerzoAgendadas}`;
    
    // Limpiar formulario básico
    form.idMascota = '';
    form.idVacuna = '';
  } catch (error) {
    console.error('Error al aplicar plan:', error);
    if (error.response && error.response.data && error.response.data.error) {
        errorMsg.value = error.response.data.error;
    } else {
        errorMsg.value = 'Ocurrió un error inesperado al aplicar el plan.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.vacunacion-form {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}
.form-group input, .form-group select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-submit {
  background-color: #42b983;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}
.btn-submit:disabled {
  background-color: #a0d8c0;
  cursor: not-allowed;
}
.mensaje-exito {
  color: green;
  font-weight: bold;
  margin-top: 15px;
}
.mensaje-error {
  color: red;
  font-weight: bold;
  margin-top: 15px;
}
</style>