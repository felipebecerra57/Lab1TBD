<template>
  <div class="agenda-container">
    <header class="encabezado">
      <h1>Agenda Veterinaria</h1>
      <button class="btn-secundario" @click="volver">Volver</button>
    </header>

    <!-- Aviso si viene desde una mascota -->
    <div v-if="$route.query.idMascota" class="aviso-mascota">
      🐾 Agendando cita médica para:
      <strong>{{ $route.query.nombreMascota || `Mascota #${$route.query.idMascota}` }}</strong>
    </div>

    <!-- Formulario de búsqueda (solo debe aparecer una vez) -->
    <section class="card filtro-card">
      <h2>Consultar disponibilidad</h2>
      <form @submit.prevent="consultarDisponibilidad" class="form-filtro">
        <div class="campo">
          <label for="veterinario">Veterinario *</label>
          <select id="veterinario" v-model="idVeterinario" required>
            <option disabled value="">Seleccione un profesional</option>
            <option
                v-for="vet in veterinariosFiltrados"
                :key="obtenerId(vet)"
                :value="obtenerId(vet)"
            >
              {{ obtenerTextoVet(vet) }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label for="fecha">Fecha *</label>
          <input
              id="fecha"
              type="date"
              v-model="fecha"
              :min="fechaMinima"
              required
          />
        </div>

        <div class="acciones">
          <button type="submit" class="btn-primario" :disabled="cargando">
            {{ cargando ? 'Consultando...' : 'Buscar bloques libres' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Estado de carga y mensajes -->
    <p v-if="cargando" class="mensaje ayuda">Consultando disponibilidad en la base de datos...</p>
    <p v-if="error" class="mensaje error">{{ error }}</p>

    <!-- ÚNICA sección de resultados -->
    <section v-if="consultado && !cargando" class="card resultados-card">
      <h3>Bloques disponibles para el {{ formatearFechaVisual(fecha) }}</h3>

      <div v-if="bloques.length === 0" class="mensaje ayuda">
        No hay turnos configurados ni bloques libres disponibles para esta fecha con el profesional seleccionado.
      </div>

      <div v-else class="grid-bloques">
        <div
            v-for="(bloque, index) in bloques"
            :key="index"
            class="bloque-item"
        >
          <div class="bloque-hora">
            <span class="icono-reloj">🕒</span>
            <strong>{{ formatearHora(bloque.horaInicio || bloque.inicio || bloque) }}</strong>
            <span v-if="bloque.horaTermino || bloque.fin">
              - {{ formatearHora(bloque.horaTermino || bloque.fin) }}
            </span>
          </div>

          <button
              type="button"
              class="btn-reservar"
              :disabled="agendando"
              @click="confirmarYAgendar(bloque)"
          >
            {{ agendando ? 'Reservando...' : 'Reservar cita' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVeterinarios, getBloquesLibres } from '../services/agendaService';
import { jwtDecode } from 'jwt-decode';
import { agendarCita } from '../services/agendaService';

const veterinarios = ref([]);
const idVeterinario = ref('');
const fecha = ref('');
const bloques = ref([]);

const cargando = ref(false);
const consultado = ref(false);
const error = ref('');

const fechaMinima = new Date().toISOString().split('T')[0];

const route = useRoute();
const router = useRouter();

const agendando = ref(false);

function volver() {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const payload = jwtDecode(token);
    if (payload.rol === 'ADMIN') {
      router.push('/admin/sedes');
    } else if (payload.rol === 'VET') {
      router.push('/vet/atencion');
    } else if (payload.rol === 'TUTOR') {
      router.push('/tutor/mascotas');
    } else {
      router.push('/login');
    }
  } catch {
    router.push('/admin/sedes');
  }
}

const veterinariosFiltrados = computed(() => {
  const idSedeUrl = route.query.sede;
  if (!idSedeUrl) {
    return veterinarios.value; // Si no hay sede en la URL, muestra todos
  }
  return veterinarios.value.filter(v => {
    const sedeVet = v.idsede ?? v.idSede;
    return String(sedeVet) === String(idSedeUrl);
  });
});

onMounted(async () => {
  try {
    const data = await getVeterinarios();
    veterinarios.value = Array.isArray(data) ? data : (data.vets || data.data || []);
  } catch (err) {
    error.value = 'No se pudo cargar la lista de veterinarios.';
    console.error('Error al cargar veterinarios:', err);
  }
});

function obtenerId(vet) {
  return vet.idveterinario ?? vet.idVeterinario ?? vet.idusuario ?? vet.idUsuario ?? '';
}

function obtenerTextoVet(vet) {
  const nombre = vet.nombreemp || vet.nombreEmp || '';
  const apellido = vet.apellidoemp || vet.apellidoEmp || '';
  const especialidad = vet.especialidad ? ` (${vet.especialidad})` : '';

  if (nombre || apellido) {
    return `${nombre} ${apellido}${especialidad}`.trim();
  }
  return `Veterinario N° ${obtenerId(vet)}${especialidad}`;
}

async function consultarDisponibilidad() {
  if (!idVeterinario.value || !fecha.value) return;

  error.value = '';
  cargando.value = true;
  consultado.value = false;
  bloques.value = [];

  try {
    const data = await getBloquesLibres(idVeterinario.value, fecha.value);
    bloques.value = Array.isArray(data) ? data : (data.bloques || []);
    consultado.value = true;
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al obtener los bloques disponibles.';
    console.error(err);
  } finally {
    cargando.value = false;
  }
}

function formatearHora(valor) {
  if (!valor) return '';
  if (typeof valor === 'string' && valor.includes('T')) {
    return new Date(valor).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
  if (typeof valor === 'string') {
    return valor.slice(0, 5);
  }
  return valor;
}

function formatearFechaVisual(f) {
  if (!f) return '';
  const [year, month, day] = f.split('-');
  return `${day}/${month}/${year}`;
}

async function confirmarYAgendar(bloque) {
  const idMascota = route.query.idMascota;
  if (!idMascota) {
    alert('Para reservar, selecciona primero una mascota desde tu perfil ("Mis Mascotas").');
    router.push('/tutor/mascotas');
    return;
  }

  // 1. Obtener la sede del veterinario seleccionado o de la URL
  const vetSeleccionado = veterinarios.value.find(
      v => String(obtenerId(v)) === String(idVeterinario.value)
  );

  const idSede = route.query.sede || vetSeleccionado?.idsede || vetSeleccionado?.idSede;

  if (!idSede) {
    alert('No se pudo determinar la sede del veterinario para agendar la cita.');
    return;
  }

  const hora = formatearHora(bloque.horaInicio || bloque.inicio || bloque);
  const confirmar = confirm(`¿Deseas confirmar la cita para el ${formatearFechaVisual(fecha.value)} a las ${hora}?`);
  if (!confirmar) return;

  agendando.value = true;
  error.value = '';

  try {
    // 2. Construir timestamp exacto (YYYY-MM-DD HH:mm:ss)
    const fechaHora = `${fecha.value} ${hora}:00`;

    // 3. Enviar los 4 campos requeridos por el backend
    await agendarCita({
      fecha: fechaHora,
      idVeterinario: Number(idVeterinario.value),
      idMascota: Number(idMascota),
      idSede: Number(idSede)
    });

    alert('¡Cita agendada exitosamente!');
    router.push('/tutor/mascotas');
  } catch (err) {
    console.error('Error al agendar cita:', err);
    error.value = err.response?.data?.error || 'No se pudo reservar la cita.';
  } finally {
    agendando.value = false;
  }
}
</script>

<style scoped>
.agenda-container {
  max-width: 850px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.encabezado h1 {
  margin: 0;
  font-size: 1.6rem;
  color: #2c3e50;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card h2, .card h3 {
  margin-top: 0;
  color: #334155;
  font-size: 1.2rem;
}

.form-filtro {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 200px;
}

.campo label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.campo input, .campo select {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
  width: 100%;
}

.acciones {
  display: flex;
  align-items: flex-end;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primario {
  background-color: #2c6e49;
  color: white;
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secundario {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.grid-bloques {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.bloque-item {
  border: 1px solid #bbf7d0;
  background-color: #f0fdf4;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bloque-hora {
  font-size: 1rem;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 4px;
}

.etiqueta-libre {
  font-size: 0.75rem;
  background: #dcfce7;
  color: #15803d;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.mensaje {
  margin: 1rem 0;
  font-size: 0.95rem;
}

.ayuda {
  color: #64748b;
}

.error {
  color: #b91c1c;
  font-weight: bold;
}

.aviso-mascota {
  background-color: #e0f2fe;
  border-left: 4px solid #0284c7;
  color: #0369a1;
  padding: 10px 14px;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.bloque-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.bloque-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #86efac;
}

.btn-reservar {
  margin-top: 6px;
  background-color: #166534;
  color: white;
  border: none;
  padding: 4px 10px;
  font-size: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>