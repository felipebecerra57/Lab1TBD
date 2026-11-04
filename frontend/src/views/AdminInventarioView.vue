<!-- views/AdminInventarioView.vue -->
<template>
  <div class="admin-inventario">
    <h2>Gestión de Inventario por Sede</h2>
    
    <div class="filters">
      <label>Seleccionar Sede:</label>
      <select v-model="sedeSeleccionada" @change="cargarInventario">
        <option disabled value="">Seleccione una sede</option>
        <option v-for="sede in sedes" :key="sede.idSede" :value="sede.idSede">
          {{ sede.nombre }}
        </option>
      </select>
    </div>

    <!-- Mensaje de carga -->
    <p v-if="loading">Cargando inventario...</p>

    <table v-if="inventario.length > 0 && !loading">
      <thead>
        <tr>
          <th>ID Medicamento</th>
          <th>Nombre / Detalle</th>
          <th>Stock Actual</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventario" :key="item.idMedicamento">
          <td>{{ item.idMedicamento }}</td>
          <td>{{ item.nombreMedicamento || 'Medicamento ' + item.idMedicamento }}</td>
          <td>
            <input type="number" v-model.number="item.nuevaCantidad" min="0">
          </td>
          <td>
            <button @click="actualizarStock(item)" class="btn-guardar">Guardar Stock</button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <p v-else-if="sedeSeleccionada && !loading">No hay inventario registrado para esta sede.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api'; // Ajusta la ruta a tu config de Axios

const sedes = ref([]);
const sedeSeleccionada = ref('');
const inventario = ref([]);
const loading = ref(false);

onMounted(async () => {
  try {
    // Asumiendo que tienes un endpoint /sedes para listar las sedes
    const { data } = await api.get('/sedes');
    sedes.value = data;
  } catch (error) {
    console.error('Error al cargar sedes:', error);
  }
});

const cargarInventario = async () => {
  if (!sedeSeleccionada.value) return;
  loading.value = true;
  try {
    // Según tu controller: getInventarios maneja query params ?idSede=X
    const { data } = await api.get(`/inventario?idSede=${sedeSeleccionada.value}`);
    // Mapeamos para inicializar el input de nuevaCantidad con la cantidad actual
    inventario.value = data.map(i => ({ 
      ...i, 
      nuevaCantidad: i.cantidad 
    }));
  } catch (error) {
    console.error('Error al cargar el inventario:', error);
    alert('Hubo un error al obtener el inventario.');
  } finally {
    loading.value = false;
  }
};

const actualizarStock = async (item) => {
  if (item.nuevaCantidad === null || item.nuevaCantidad < 0) {
    return alert('La cantidad no puede ser negativa');
  }

  try {
    // Según tu controller: actualizarInventario espera PUT a /:idSede/:idMedicamento
    // y recibe { cantidad } en el body
    await api.put(`/inventario/${sedeSeleccionada.value}/${item.idMedicamento}`, {
      cantidad: item.nuevaCantidad
    });
    alert('Inventario actualizado exitosamente');
    await cargarInventario(); // Refrescar la tabla
  } catch (error) {
    console.error('Error al actualizar:', error);
    // Manejo del error 23514 desde tu controlador
    if (error.response && error.response.status === 400) {
       alert(error.response.data.error || 'Error al actualizar el stock');
    } else {
       alert('Ocurrió un error inesperado al actualizar el inventario.');
    }
  }
};
</script>

<style scoped>
.admin-inventario {
  padding: 20px;
}
.filters {
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
.btn-guardar {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}
.btn-guardar:hover {
  background-color: #3aa876;
}
</style>