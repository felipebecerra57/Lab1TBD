<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getEspecies, crearMascota } from '../services/mascotasService';

// Eventos que este componente le puede avisar a su padre
const emit = defineEmits(['creada', 'cancelar']);

const especies = ref([]);
const enviando = ref(false);
const error = ref('');
const anioActual = new Date().getFullYear();

const form = reactive({ nombre: '', idEspecie: '', anioNacimiento: '', peso: '' });

onMounted(async () => {
  try {
    especies.value = await getEspecies();
  } catch (e) {
    error.value = 'No se pudieron cargar las especies';
  }
});

async function guardar() {
  error.value = '';
  enviando.value = true;
  try {
    await crearMascota({
      nombre: form.nombre.trim(),
      idEspecie: form.idEspecie,
      // un campo vacío se envía como null (es opcional)
      anioNacimiento: form.anioNacimiento || null,
      peso: form.peso || null
    });
    emit('creada');
  } catch (e) {
    error.value = e.response?.data?.error ?? 'No se pudo registrar la mascota';
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <form class="form" @submit.prevent="guardar">
    <h2>Registrar mascota</h2>

    <label>
      Nombre *
      <input v-model="form.nombre" required maxlength="100" />
    </label>

    <label>
      Especie *
      <select v-model.number="form.idEspecie" required>
        <option disabled value="">Selecciona una especie</option>
        <option v-for="e in especies" :key="e.idEspecie" :value="e.idEspecie">
          {{ e.tipo }}
        </option>
      </select>
    </label>

    <label>
      Año de nacimiento
      <input v-model.number="form.anioNacimiento" type="number" min="1990" :max="anioActual" />
    </label>

    <label>
      Peso (kg)
      <input v-model.number="form.peso" type="number" step="0.01" min="0.01" max="999.99" />
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="acciones">
      <button type="submit" :disabled="enviando">
        {{ enviando ? 'Guardando...' : 'Guardar' }}
      </button>
      <button type="button" @click="emit('cancelar')">Cancelar</button>
    </div>
  </form>
</template>

<style scoped>
.form { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; background: #fafafa; max-width: 420px; }
label { display: block; margin-bottom: 0.8rem; font-size: 0.9rem; }
input, select { display: block; width: 100%; padding: 6px; margin-top: 4px; box-sizing: border-box; }
.acciones { display: flex; gap: 0.5rem; }
.error { color: #b00020; }
</style>