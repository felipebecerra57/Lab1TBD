<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import VacunasPendientes from '../components/vacunasPendientes.vue';

import { useRouter } from 'vue-router';
import { getMisMascotas, getMisFichas, getVacunasPendientes } from '../services/mascotasService';
import MascotaCard from '../components/mascotaCard.vue';
import MascotaForm from '../components/mascotaFrom.vue';

const router = useRouter();


const mascotas = ref([]);
const fichas = ref([]);
const citas = ref([]);
const cargando = ref(true);
const error = ref('');
const mostrarForm = ref(false);
const pendientes = ref([]);


const mascotasConFicha = computed(() =>
    mascotas.value.map(m => ({
      ...m,
      ficha: fichas.value.find(f => f.idMascota === m.idMascota) ?? null,
      pendientes: pendientes.value.filter(p => p.idMascota === m.idMascota),
      proximaCita: proximaCitaDeMascota(m.idMascota ?? m.idmascota)
    }))
);

async function cargarCitasTutor(listaMascotas) {
  if (!listaMascotas || !listaMascotas.length) {
    citas.value = [];
    return;
  }
  try {
    const promesas = listaMascotas.map(async (m) => {
      const id = m.idMascota ?? m.idmascota;
      try {
        // Verifica si tu ruta base en api.js ya incluye '/citas' o si es '/citas/mascota/${id}'
        const { data } = await api.get(`/citas/mascota/${id}`);
        console.log(`Citas recibidas para mascota ${id}:`, data);
        return Array.isArray(data) ? data : (data.citas || data.data || []);
      } catch (err) {
        console.error(`Error al cargar citas de mascota ${id}:`, err);
        return [];
      }
    });

    const resultados = await Promise.all(promesas);
    citas.value = resultados.flat();
    console.log('Todas las citas unificadas:', citas.value);
  } catch (err) {
    console.error('Error general cargando citas:', err);
    citas.value = [];
  }
}

async function cargar() {
  cargando.value = true;
  error.value = '';
  try {
    const [m, f, p] = await Promise.all([
      getMisMascotas(),
      getMisFichas(),
      getVacunasPendientes().catch(() => [])
    ]);
    mascotas.value = m;
    fichas.value = f;
    pendientes.value = p;

    // Ejecutar después de tener la lista de mascotas 'm':
    await cargarCitasTutor(m);

  } catch (e) {
    error.value = e.response?.data?.error ?? 'No se pudieron cargar tus mascotas';
  } finally {
    cargando.value = false;
  }
}
function proximaCitaDeMascota(idMascota) {
  if (!idMascota || !citas.value.length) return null;

  // Fecha local YYYY-MM-DD
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  const hoyStr = `${y}-${m}-${d}`;

  const citasMascota = citas.value.filter(c => {
    const idM = c.idMascota ?? c.idmascota;
    const fecha = c.fecha ? (c.fecha.includes('T') ? c.fecha.split('T')[0] : c.fecha.slice(0, 10)) : '';
    const estado = (c.estado || '').toLowerCase();

    return (
        Number(idM) === Number(idMascota) &&
        fecha >= hoyStr &&
        estado !== 'cancelada' &&
        estado !== 'atendida' &&
        estado !== 'completada'
    );
  });

  if (!citasMascota.length) return null;

  // Ordenar cronológicamente para obtener la más cercana
  return citasMascota.sort((a, b) => {
    const fechaA = (a.fecha?.includes('T') ? a.fecha.split('T')[0] : a.fecha?.slice(0, 10)) || '';
    const horaA = a.hora ? a.hora.slice(0, 5) : '00:00';

    const fechaB = (b.fecha?.includes('T') ? b.fecha.split('T')[0] : b.fecha?.slice(0, 10)) || '';
    const horaB = b.hora ? b.hora.slice(0, 5) : '00:00';

    return new Date(`${fechaA}T${horaA}`) - new Date(`${fechaB}T${horaB}`);
  })[0];
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
          :citas="citas"
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