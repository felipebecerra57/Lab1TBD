<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMisMascotas, getMisFichas } from '../services/mascotasService';
import MascotaCard from '../components/MascotaCard.vue';
import MascotaForm from '../components/MascotaForm.vue';

const mascotas = ref([]);
const fichas = ref([]);
const cargando = ref(true);
const error = ref('');
const mostrarForm = ref(false);

const mascotasConFicha = computed(() =>
    mascotas.value.map(m => ({
      ...m,
      ficha: fichas.value.find(f => f.idMascota === m.idMascota) ?? null
    }))
);

async function cargar() {
  error.value = '';
  try {
    const [m, f] = await Promise.all([getMisMascotas(), getMisFichas()]);
    mascotas.value = m;
    fichas.value = f;
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
</script>

<template>
  <section class="mis-mascotas">
    <div class="encabezado">
      <h1>Mis mascotas</h1>
      <button v-if="!mostrarForm" @click="mostrarForm = true">+ Registrar mascota</button>
    </div>

    <MascotaForm v-if="mostrarForm" @creada="alCrear" @cancelar="mostrarForm = false" />

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
</style>