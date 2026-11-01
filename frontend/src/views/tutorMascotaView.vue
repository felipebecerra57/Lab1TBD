<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMisMascotas, getMisFichas } from '../services/mascotasService';
import MascotaCard from '../components/MascotaCard.vue';

const mascotas = ref([]);
const fichas = ref([]);
const cargando = ref(true);
const error = ref('');

// Pega a cada mascota su ficha
const mascotasConFicha = computed(() =>
    mascotas.value.map(m => ({
      ...m,
      ficha: fichas.value.find(f => f.idMascota === m.idMascota) ?? null
    }))
);

// Se ejecuta una vez, cuando la vista aparece en pantalla
onMounted(async () => {
  try {
    // Las dos peticiones se hacen en paralelo
    const [m, f] = await Promise.all([getMisMascotas(), getMisFichas()]);
    mascotas.value = m;
    fichas.value = f;
  } catch (e) {
    error.value = e.response?.data?.error ?? 'No se pudieron cargar tus mascotas';
  } finally {
    cargando.value = false; // pase lo que pase, deja de mostrar "Cargando"
  }
});
</script>

<template>
  <section class="mis-mascotas">
    <h1>Mis mascotas</h1>

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
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.error { color: #b00020; }
</style>