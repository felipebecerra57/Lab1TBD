<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useRouter } from 'vue-router';
import { getMisMascotas, getMisFichas, getVacunasPendientes } from '../services/mascotasService';
import MascotaCard from '../components/mascotaCard.vue';
import MascotaForm from '../components/mascotaFrom.vue';

const router = useRouter();

const mascotas = ref([]);
const fichas = ref([]);
const cargando = ref(true);
const error = ref('');
const mostrarForm = ref(false);
const pendientes = ref([]);


const mascotasConFicha = computed(() =>
    mascotas.value.map(m => ({
      ...m,
      ficha: fichas.value.find(f => f.idMascota === m.idMascota) ?? null,
      pendientes: pendientes.value.filter(p => p.idMascota === m.idMascota)
    }))
);

async function cargar() {
  error.value = '';
  try {
    const [m, f, p] = await Promise.all([
      getMisMascotas(),
      getMisFichas(),
      // Si esta consulta falla, la lista de mascotas igual se muestra
      getVacunasPendientes().catch(() => [])
    ]);
    mascotas.value = m;
    fichas.value = f;
    pendientes.value = p;
  } catch (e) {
    error.value = e.response?.data?.error ?? 'No se pudieron cargar tus mascotas';
  } finally {
    cargando.value = false;
  }
}

onMounted(cargar);

// se ejecuta cuando el formulario avisa "creada": cierra el form y recarga la lista
async function alCrear() {
  mostrarForm.value = false;
  await cargar();
}

function cerrarSesion() {
  localStorage.removeItem('token');
  router.push('/login');
}
</script>

<template>
  <section class="mis-mascotas">
    <div class="encabezado">
      <h1>Mis mascotas</h1>
      <div class="acciones-encabezado">
        <button class="btn-agenda" @click="router.push('/agenda')">
          📅 Ver disponibilidad / Agenda
        </button>
        <button v-if="!mostrarForm" @click="mostrarForm = true">
          + Registrar mascota
        </button>
        <button class="btn-salir" @click="cerrarSesion">
          Cerrar sesión
        </button>
      </div>
    </div>

    <MascotaForm v-if="mostrarForm" @creada="alCrear" @cancelar="mostrarForm = false" />

    <VacunasPendientes :pendientes="pendientes" />

    <p v-if="cargando">Cargando...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="mascotasConFicha.length === 0">Aún no tienes mascotas registradas.</p>

    <div v-else class="grid">
      <MascotaCard
          v-for="m in mascotasConFicha"
          :key="m.idMascota"
          :mascota="m"
      />
    </div>
  </section>
</template>

<style scoped>
.mis-mascotas { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
.encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.error { color: #b00020; }
button {
  padding: 8px 14px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-weight: 500;
}

.btn-agenda {
  background-color: #2c6e49;
  color: white;
  border: none;
}

.btn-agenda:hover {
  background-color: #225638;
}

.btn-salir {
  background-color: #f1f5f9;
  color: #475569;
}
</style>