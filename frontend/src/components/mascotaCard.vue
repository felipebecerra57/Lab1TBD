<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  mascota: { type: Object, required: true }, citas: { type: Array, default: () => []}
});

const router = useRouter();
const verFicha = ref(false);

const edad = computed(() =>
    props.mascota.anioNacimiento
        ? new Date().getFullYear() - props.mascota.anioNacimiento
        : null
);

const proximaCita = computed(() => {
  const idM = props.mascota.idMascota ?? props.mascota.idmascota;
  const hoyStr = new Date().toISOString().split('T')[0];

  const citasMascota = props.citas.filter(c => {
    const idCitaMascota = c.idMascota ?? c.idmascota;
    const fecha = c.fecha ? c.fecha.split('T')[0] : '';
    const estado = (c.estado || '').toLowerCase();

    return (
        Number(idCitaMascota) === Number(idM) &&
        fecha >= hoyStr &&
        estado !== 'cancelada' &&
        estado !== 'atendida'
    );
  });

  // Ordena cronológicamente y obtiene la más cercana
  return citasMascota.sort((a, b) => {
    const fechaA = `${a.fecha?.split('T')[0]}T${a.hora || '00:00'}`;
    const fechaB = `${b.fecha?.split('T')[0]}T${b.hora || '00:00'}`;
    return new Date(fechaA) - new Date(fechaB);
  })[0] || null;
});

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T00:00:00`);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function agendarParaEstaMascota() {
  const id = props.mascota.idMascota ?? props.mascota.idmascota;
  router.push({
    path: '/agenda',
    query: { idMascota: id, nombreMascota: props.mascota.nombre }
  });
}

</script>

<template>
  <article class="card">
    <header>
      <h2>{{ mascota.nombre }}</h2>
      <span class="especie">{{ mascota.especie }} <span v-if="mascota.pendientes?.length" class="aviso">Vacuna pendiente</span></span>
    </header>

    <ul>
      <li v-if="edad !== null">Edad aprox.: {{ edad }} años</li>
      <li v-if="mascota.peso">Peso: {{ mascota.peso }} kg</li>
    </ul>
    <div v-if="proximaCita" class="alerta-proxima-cita">
      <div class="titulo-cita">
        📅 <strong>Próxima cita:</strong> {{ formatearFecha(proximaCita.fecha) }} - {{ proximaCita.hora?.slice(0, 5) }}
      </div>
      <span class="detalle-sub-cita">
        Motivo: {{ proximaCita.motivo || 'Consulta general' }}
      </span>
    </div>
    <div v-else class="sin-citas-texto">
      Sin citas agendadas
    </div>

    <div class="acciones-card">
      <button type="button" @click="verFicha = !verFicha">
        {{ verFicha ? 'Ocultar ficha clínica' : 'Ver ficha clínica' }}
      </button>

      <button type="button" class="btn-agendar" @click="agendarParaEstaMascota">
        📅 Agendar cita
      </button>
    </div>

    <div v-if="verFicha" class="ficha">
      <template v-if="mascota.ficha">
        <h3>Ficha clínica N° {{ mascota.ficha.idFicha }}</h3>
        <p><strong>Creada:</strong> {{ mascota.ficha.fechaCreacion?.slice(0, 10) }}</p>
        <p><strong>Esterilizado:</strong> {{ mascota.ficha.esterilizado ? 'Sí' : 'No' }}</p>
        <p>
          <strong>Observaciones:</strong>
          {{ mascota.ficha.observacionesGenerales || 'Sin observaciones' }}
        </p>
      </template>
      <p v-else>Esta mascota aún no tiene ficha clínica.</p>
    </div>
  </article>
</template>

<style scoped>
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: #fff; }
header { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0; font-size: 1.2rem; }
.especie { background: #e8f4ea; color: #69ccd1; padding: 2px 10px; border-radius: 12px; font-size: 0.85rem; }
.aviso { background: #fff0c8; color: #8a5a00; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; }
ul { padding-left: 1.2rem; }
button { cursor: pointer; padding: 6px 12px; }
.ficha { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed #ccc; }
.btn-agendar {
  margin-top: 10px;
  background-color: #2c6e49;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
}
.btn-agendar:hover {
  background-color: #225638;
}
.alerta-proxima-cita {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 8px 10px;
  margin: 10px 0;
  font-size: 0.82rem;
  color: #166534;
}

.titulo-cita {
  display: block;
  margin-bottom: 2px;
}

.detalle-sub-cita {
  display: block;
  font-size: 0.75rem;
  color: #4b5563;
}

.sin-citas-texto {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 10px 0;
  font-style: italic;
}
</style>