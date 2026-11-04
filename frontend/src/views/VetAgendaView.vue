<template>
  <div class="pagina">
    <header class="encabezado">
      <h1>Mi Agenda y Turnos</h1>
    </header>

    <section class="tarjeta">
      <header class="encabezado-calendario">
        <div>
          <h2>Mi Calendario Semanal de Turnos</h2>
          <span class="subtitulo-semana">{{ rangoSemanaTexto }}</span>
        </div>
        <div class="controles-semana">
          <button type="button" class="secundario" @click="cambiarSemana(-1)">◀ Semana anterior</button>
          <button type="button" class="secundario" @click="irAHoy">Hoy</button>
          <button type="button" class="secundario" @click="cambiarSemana(1)">Semana siguiente ▶</button>
        </div>
      </header>

      <p v-if="cargandoTurnos" class="ayuda">Cargando turnos...</p>

      <div v-else class="calendario-grid">
        <div
            v-for="dia in diasSemanaCalendario"
            :key="dia.numeroDia"
            class="dia-columna"
            :class="{ 'dia-hoy': dia.esHoy }"
        >
          <div class="dia-cabecera">
            <span class="nombre-dia">{{ dia.nombre }}</span>
            <span class="fecha-dia">{{ dia.fechaCorta }}</span>
          </div>

          <div class="dia-cuerpo">
            <!-- 1. Estado o Bloque de Turno Asignado -->
            <div v-if="dia.turnos.length === 0" class="sin-turnos">
              Día libre
            </div>
            <div
                v-for="t in dia.turnos"
                :key="t.idTurno ?? t.idturno"
                class="tarjeta-bloque-turno"
            >
              <div class="hora-badge">
                🕒 {{ formatearSoloHora(t.horaInicio ?? t.horainicio) }} - {{ formatearSoloHora(t.horaTermino ?? t.horatermino) }}
              </div>
              <span v-if="t.idSede ?? t.idsede" class="sede-badge">
                Sede {{ t.idSede ?? t.idsede }}
              </span>
            </div>

            <!-- 2. AQUÍ VA EL CÓDIGO: Lista de Citas con botón "Atender" -->
            <div v-if="dia.citas && dia.citas.length" class="seccion-citas">
              <span class="titulo-citas">
                📅 {{ dia.citas.length }} {{ dia.citas.length === 1 ? 'cita' : 'citas' }}
              </span>

              <div class="lista-citas-dia">
                <div v-for="c in dia.citas" :key="c.idCita" class="item-cita">
                  <div class="info-cita">
                    <span class="hora-cita">{{ formatearSoloHora(c.hora) }}</span>
                    <span class="mascota-cita">{{ c.nombreMascota || `Mascota #${c.idMascota}` }}</span>
                  </div>

                  <button
                      type="button"
                      class="btn-atender"
                      @click="iniciarAtencionDesdeCita(c)"
                      :disabled="c.estado === 'Atendida' || c.estado === 'Completada'"
                  >
                    {{ c.estado === 'Atendida' || c.estado === 'Completada' ? 'Atendida' : 'Atender' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();
const citasSemana = ref([]);
const turnos = ref([]);
const cargandoTurnos = ref(false);
const semanaOffset = ref(0);
const DIAS_NOMBRE = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function formatoFechaLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function iniciarAtencionDesdeCita(cita) {
  const idCita = cita.idCita ?? cita.idcita;
  router.push({
    path: '/vet/atencion', // Asegúrate de que coincida con tu ruta en router
    query: { idCita }
  });
}

const diasSemanaCalendario = computed(() => {
  const hoy = new Date();
  const diaSemanaActual = hoy.getDay() === 0 ? 7 : hoy.getDay();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (diaSemanaActual - 1) + (semanaOffset.value * 7));

  const hoyStr = formatoFechaLocal(hoy);

  return DIAS_NOMBRE.map((nombre, index) => {
    const fechaDia = new Date(lunes);
    fechaDia.setDate(lunes.getDate() + index);

    const numeroDia = index + 1;
    const fechaStr = formatoFechaLocal(fechaDia);
    const fechaCorta = fechaDia.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });

    const turnosDelDia = turnos.value.filter(t => {
      const d = t.diaSemana ?? t.diasemana;
      return Number(d) === numeroDia;
    });

    const citasDelDia = citasSemana.value.filter(c => {
      if (!c.fecha) return false;
      const f = c.fecha.includes('T') ? c.fecha.split('T')[0] : c.fecha.slice(0, 10);
      return f === fechaStr;
    });

    return {
      nombre,
      numeroDia,
      fechaStr,
      fechaCorta,
      turnos: turnosDelDia,
      citas: citasDelDia, // <-- IMPORTANTE: incluir esto
      totalCitas: citasDelDia.length,
      esHoy: fechaStr === hoyStr
    };
  });
});

const rangoSemanaTexto = computed(() => {
  const dias = diasSemanaCalendario.value;
  if (!dias.length) return '';
  return `Semana del ${dias[0].fechaCorta} al ${dias[6].fechaCorta}`;
});

function formatearSoloHora(hora) {
  if (!hora) return '';
  return hora.toString().slice(0, 5);
}

function obtenerIdVeterinarioToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return payload.idVeterinario || payload.id_veterinario || payload.id || payload.idUsuario || null;
  } catch (e) {
    console.error('Error decodificando token:', e);
    return null;
  }
}

async function cargarTurnos() {
  cargandoTurnos.value = true;
  try {
    const idVet = obtenerIdVeterinarioToken();
    const params = { _t: Date.now() };
    if (idVet && !isNaN(Number(idVet))) {
      params.idVeterinario = Number(idVet);
    }
    const { data } = await api.get('/turnos', {
      params,
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    turnos.value = Array.isArray(data) ? data : (data.turnos || data.data || []);
  } catch (e) {
    console.error('Error al cargar turnos:', e);
  } finally {
    cargandoTurnos.value = false;
  }
}

async function cargarCitasSemana() {
  const dias = diasSemanaCalendario.value;
  if (!dias.length) return;
  const idVet = obtenerIdVeterinarioToken();

  try {
    const params = { desde: dias[0].fechaStr, hasta: dias[6].fechaStr };
    if (idVet && !isNaN(Number(idVet))) {
      params.idVeterinario = Number(idVet);
    }
    const { data } = await api.get('/citas', { params });
    citasSemana.value = Array.isArray(data) ? data : (data.citas || data.data || []);
  } catch {
    citasSemana.value = [];
  }
}

function cambiarSemana(delta) {
  semanaOffset.value += delta;
  cargarCitasSemana();
}

function irAHoy() {
  semanaOffset.value = 0;
  cargarCitasSemana();
}

onMounted(async () => {
  await cargarTurnos();
  await cargarCitasSemana();
});
</script>

<style scoped>
.pagina { max-width: 960px; margin: 0 auto; padding: 20px; }
.encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.tarjeta { border: 1px solid #ccc; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
button { padding: 6px 14px; border: none; border-radius: 4px; background: #2c6e49; color: white; cursor: pointer; }
button.secundario { background: #e8e8e8; color: #222; }
.ayuda { color: #666; font-size: 13px; }
.encabezado-calendario { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.subtitulo-semana { color: #475569; font-size: 0.9rem; font-weight: 500; }
.controles-semana { display: flex; gap: 0.4rem; }
.calendario-grid { display: grid; grid-template-columns: repeat(7, minmax(110px, 1fr)); gap: 8px; overflow-x: auto; padding-bottom: 6px; }
.dia-columna { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; min-height: 140px; display: flex; flex-direction: column; }
.dia-columna.dia-hoy { border-color: #2c6e49; background: #f0fdf4; }
.dia-cabecera { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; background: #edf2f7; border-top-left-radius: 5px; border-top-right-radius: 5px; }
.dia-hoy .dia-cabecera { background: #2c6e49; color: white; }
.nombre-dia { display: block; font-weight: 700; font-size: 0.85rem; }
.fecha-dia { font-size: 0.75rem; color: inherit; opacity: 0.85; }
.dia-cuerpo { padding: 6px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.sin-turnos { color: #94a3b8; font-size: 0.75rem; text-align: center; margin-top: 15px; font-style: italic; }
.tarjeta-bloque-turno { background: #ffffff; border-left: 3px solid #2c6e49; border-radius: 4px; padding: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.hora-badge { font-size: 0.78rem; font-weight: 600; color: #1e293b; }
.sede-badge { display: inline-block; font-size: 0.7rem; color: #64748b; margin-top: 2px; }
.seccion-citas {margin-top: auto; display: flex; flex-direction: column; gap: 4px;}
.titulo-citas { font-size: 0.75rem; font-weight: 700; color: #0369a1; margin-bottom: 2px;}
.lista-citas-dia { display: flex; flex-direction: column; gap: 4px;}
.item-cita { background-color: #ffffff; border: 1px solid #bae6fd; border-radius: 4px; padding: 5px; display: flex; flex-direction: column; gap: 4px;}
.info-cita { display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;}
.hora-cita { font-weight: bold; color: #0284c7;}
.mascota-cita { color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75px;}
.btn-atender { padding: 3px 6px; font-size: 0.7rem; background-color: #2c6e49; color: white; border: none; border-radius: 3px; cursor: pointer; text-align: center; width: 100%;}
.btn-atender:disabled { background-color: #94a3b8; cursor: not-allowed;}
</style>