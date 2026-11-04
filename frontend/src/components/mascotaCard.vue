<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  mascota: {tipe: Object, required: true}
});

const router = useRouter();
const verFicha = ref(false);

const edad = computed(() =>
    props.mascota.anioNacimiento
        ? new Date().getFullYear() - props.mascota.anioNacimiento
        : null
);
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
</style>