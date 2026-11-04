<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  mascota: {tipe: Object, required: true}
});

const verFicha = ref(false);

const edad = computed(() =>
    props.mascota.anioNacimiento
        ? new Date().getFullYear() - props.mascota.anioNacimiento
        : null
);

</script>

<template>
  <article class="card">
    <header>
      <h2>{{ mascota.nombre }}</h2>
      <span class="especie">{{ mascota.especie }}</span>
    </header>

    <ul>
      <li v-if="edad !== null">Edad aprox.: {{ edad }} años</li>
      <li v-if="mascota.peso">Peso: {{ mascota.peso }} kg</li>
    </ul>

    <button @click="verFicha = !verFicha">
      {{ verFicha ? 'Ocultar ficha clínica' : 'Ver ficha clínica' }}
    </button>

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
ul { padding-left: 1.2rem; }
button { cursor: pointer; padding: 6px 12px; }
.ficha { margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed #ccc; }
</style>