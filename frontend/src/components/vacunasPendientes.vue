<script setup>
defineProps({
  pendientes: { type: Array, required: true }
});

// Texto según los días que faltan (negativo = ya venció)
const detalle = (p) => {
  if (p.estado === 'VENCIDA') return `vencida hace ${Math.abs(p.diasRestantes)} día(s)`;
  return p.diasRestantes === 0 ? 'vence hoy' : `vence en ${p.diasRestantes} día(s)`;
};
</script>

<template>
  <!-- Si no hay pendientes, el panel no se muestra -->
  <section v-if="pendientes.length" class="panel">
    <h2>Vacunas pendientes</h2>
    <ul>
      <li v-for="p in pendientes" :key="`${p.idMascota}-${p.idVacuna}`">
        <span class="estado" :class="p.estado === 'VENCIDA' ? 'vencida' : 'por-vencer'">
          {{ p.estado === 'VENCIDA' ? 'Vencida' : 'Por vencer' }}
        </span>
        <strong>{{ p.mascota }}</strong>: {{ p.vacuna }}
        (dosis {{ p.ultimaDosis + 1 }} de {{ p.totalDosis }}) · {{ p.fechaProximaDosis }}
        <small>({{ detalle(p) }})</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.panel { border: 1px solid #e0b4b4; background: #fff6f6; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
ul { margin: 0; padding-left: 1.2rem; }
li { margin-bottom: 0.4rem; }
.estado { padding: 1px 8px; border-radius: 10px; font-size: 0.8rem; margin-right: 6px; }
.vencida { background: #fdd; color: #a00; }
.por-vencer { background: #fff0c8; color: #8a5a00; }
</style>