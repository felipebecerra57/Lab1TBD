<template>
  <div class="admin-container">
    <h2>Gestión de Sedes</h2>
    
    <!-- Formulario de Creación / Edición -->
    <div class="card">
      <h3>{{ editandoId ? 'Editar Sede' : 'Registrar Nueva Sede' }}</h3>
      <form @submit.prevent="guardarSede" class="form-sede">
        <div class="input-group">
          <label>Nombre:</label>
          <input type="text" v-model="formulario.nombre" required placeholder="Ej: Clínica Central" />
        </div>
        <div class="input-group">
          <label>Calle:</label>
          <input type="text" v-model="formulario.calle" required placeholder="Ej: Av. Providencia" />
        </div>
        <div class="input-group">
          <label>Número:</label>
          <input type="number" v-model="formulario.numero" required placeholder="Ej: 123" />
        </div>
        <div class="input-group">
          <label>Comuna:</label>
          <input type="text" v-model="formulario.comuna" required placeholder="Ej: Providencia" />
        </div>
        <div class="input-group">
          <label>Teléfono:</label>
          <input type="text" v-model="formulario.telefono" required placeholder="Ej: +56912345678" />
        </div>
        
        <div class="botones-form">
          <button type="submit" class="btn-guardar">{{ editandoId ? 'Actualizar' : 'Guardar' }}</button>
          <button type="button" class="btn-cancelar" v-if="editandoId" @click="cancelarEdicion">Cancelar</button>
        </div>
      </form>
      <p v-if="mensaje" :class="{'error': esError, 'exito': !esError}">{{ mensaje }}</p>
    </div>

    <!-- Tabla de Sedes -->
    <table class="tabla-sedes">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Comuna</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sede in sedes" :key="sede.idSede">
          <td>{{ sede.idSede }}</td>
          <td>{{ sede.nombre }}</td>
          <td>{{ sede.calle }} {{ sede.numero }}</td>
          <td>{{ sede.comuna }}</td>
          <td>{{ sede.telefono }}</td>
          <td>
            <button @click="prepararEdicion(sede)" class="btn-editar">Editar</button>
            <button @click="eliminarSede(sede.idSede)" class="btn-eliminar">Eliminar</button>
          </td>
        </tr>
        <tr v-if="sedes.length === 0">
          <td colspan="6" style="text-align: center;">No hay sedes registradas.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const sedes = ref([]);
// Actualizamos las llaves para que coincidan con PostgreSQL
const formulario = ref({ nombre: '', calle: '', numero: '', comuna: '', telefono: '' });
const editandoId = ref(null);
const mensaje = ref('');
const esError = ref(false);

const cargarSedes = async () => {
  try {
    const respuesta = await api.get('/sedes');
    sedes.value = respuesta.data;
  } catch (error) {
    console.error('Error al cargar sedes:', error);
  }
};

const guardarSede = async () => {
  try {
    mensaje.value = '';
    // Aseguramos que el número se envíe como entero
    const payload = { ...formulario.value, numero: parseInt(formulario.value.numero, 10) };
    
    if (editandoId.value) {
      await api.put(`/sedes/${editandoId.value}`, payload);
      mostrarMensaje('Sede actualizada correctamente', false);
    } else {
      await api.post('/sedes', payload);
      mostrarMensaje('Sede creada correctamente', false);
    }
    cancelarEdicion();
    await cargarSedes();
  } catch (error) {
    mostrarMensaje(error.response?.data?.error || 'Error al guardar la sede', true);
  }
};

const eliminarSede = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta sede?')) return;
  
  try {
    await api.delete(`/sedes/${id}`);
    mostrarMensaje('Sede eliminada', false);
    await cargarSedes();
  } catch (error) {
    mostrarMensaje(error.response?.data?.error || 'Error al eliminar la sede', true);
  }
};

const prepararEdicion = (sede) => {
  formulario.value = {
    nombre: sede.nombre || '',
    calle: sede.calle || '',
    numero: sede.numero || '',
    comuna: sede.comuna || '',
    telefono: sede.telefono || ''
  };
  editandoId.value = sede.idSede;
};

const cancelarEdicion = () => {
  formulario.value = { nombre: '', calle: '', numero: '', comuna: '', telefono: '' };
  editandoId.value = null;
};

const mostrarMensaje = (texto, errorStatus) => {
  mensaje.value = texto;
  esError.value = errorStatus;
  setTimeout(() => mensaje.value = '', 3000);
};

onMounted(() => {
  cargarSedes();
});
</script>

<style scoped>
.admin-container { max-width: 900px; margin: 0 auto; padding: 20px; }
.card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px; background-color: #f9f9f9; }
.form-sede { display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; }
.input-group { display: flex; flex-direction: column; min-width: 150px; flex: 1; }
.input-group input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.botones-form { display: flex; gap: 10px; margin-top: 10px; }
.botones-form button { padding: 9px 15px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; }
.btn-guardar { background-color: #4CAF50; color: white; }
.btn-cancelar { background-color: #9e9e9e; color: white; }
.btn-editar { background-color: #2196F3; color: white; margin-right: 5px; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;}
.btn-eliminar { background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;}
.tabla-sedes { width: 100%; border-collapse: collapse; margin-top: 10px; }
.tabla-sedes th, .tabla-sedes td { border: 1px solid #ddd; padding: 10px; text-align: left; }
.tabla-sedes th { background-color: #f2f2f2; }
.exito { color: green; margin-top: 10px; font-weight: bold; }
.error { color: red; margin-top: 10px; font-weight: bold; }
</style>