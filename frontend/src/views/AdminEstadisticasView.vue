<template>
<div class="admin-containes">
    <div class="encabezado">
        <h2>Estadísticas de Atención</h2>
        <button class="btn-cerrar" @click="cerrarSesion">Cerrar sesión</button>
    </div>
    <p class="subtitulo">Atenciones de los ultimos 12 meses por especie, sede y diagnóstico.</p>
    
    <p v-if="cargando">Cargando estadísticas...</p>

    <p v-else-if="error" class="error">{{error}}</p>

    <template v-else>
        <div class="card filtros">
          <div class="input-group">
            <label for="filtro-sede">Sede:</label>
            <select id="filtro-sede" v-model="sedeSeleccionada">
              <option value="">Todas</option>
              <option v-for="sede in sedes" :key="sede" :value="sede">{{sede}}</option>
            </select>
           </div>
           <p class="total">Total de atenciones: <strong>{{totalAtenciones}}</strong></p>
        </div>    
        
 <!--tabla de estadisticas-->
        <div class="tabla-scroll">
            <table class="tabla-estadisticas">
                <thead>
                    <tr>
                        <th>Especie</th>
                        <th>Sede</th>
                        <th>Diagnóstico</th>
                        <th class="numero">Atenciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(fila, i) in filasFiltradas" :key="i">
                        <td>{{fila.especie}}</td>
                        <td>{{fila.sede}}</td>  
                        <td>{{fila.diagnostico}}</td>
                        <td class="numero">{{fila.cantidad_atenciones}}</td>
                    </tr>
                    <tr v-if="filasFiltradas.lenght === 0">
                        <td colspan="4" style="text-align: center;">No hay atenciones registradas en este periodo.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import api from '../services/api';

const router = useRouter();

//estados en la pantalla
const estadisticas = ref([]);
const cargando = ref(true);
const error = ref('');
const sedeSeleccionada = ref('');

//sedes sin repetir
const sedes = computed(() => [...new Set(estadisticas.value.map(fila => fila.sede))].sort()
);

const filasFiltradas = computed(() => 
sedeSeleccionada.value == ''
? estadisticas.value
: estadisticas.value.filter(fila => fila.sede === sedeSeleccionada.value)
);

const totalAtenciones = computed(() => filasFiltradas.value.reduce((suma, fila) => suma + fila.cantidad_atenciones, 0)
);

const cargarEstadisticas = async () => {
    try {
        const respuesta = await api.get('/reportes/estadisticas');
        estadisticas.value = respuesta.data;
    } catch (e) {
        const status = e.response?.status;
        if (status === 401){
            //token vencido
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }
        error.value = status === 403
        ? 'No tienes permisos para ver esta página, solo los administradores pueden acceder.'
        : 'No se pudieron cargar las estadísticas, intenta de nuevo más tarde.';
    } finally {
        cargando.value = false;
    }
};

const cerrarSesion = () => {
    localStorage.removeItem('token');
    router.push('/login');
};

onMounted(() => {
    cargarEstadisticas();
});

</script>
<style scoped>
.admin-container {max-width: 900px; margin: 0 auto; padding: 20px;}
.encabezado { display: flex; justify-content: space-between; align-items: center; gap: 10px;}
.subtitulo {color: #555; margin-top: 0;}
.card {border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px; background-color: #f9f9f9;}
.filtros {display:flex; gap: 15px; align-items: flex-end; justify-content: space-between; flex-wrap: wrap;}
.input-group { display: flex; flex-direction: column; min-width: 150px; } 
.input-group select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; } 
.total { margin: 0; } 
.btn-cerrar { background-color: #9e9e9e; color: white; border: none; padding: 9px 15px; border-radius: 4px; font-weight: bold; cursor: pointer; } 
.tabla-scroll { overflow-x: auto;} 
.tabla-estadisticas { width: 100%; border-collapse: collapse; margin-top: 10px; } 
.tabla-estadisticas th, .tabla-estadisticas td { border: 1px solid #ddd; padding: 10px; text-align: left; } 
.tabla-estadisticas th {background-color: #f2f2f2; } 
.tabla-estadisticas .numero {text-align: right; } 
.error { color: red; margin-top: 10px; font-weight: bold; }
</style>