<template>
  <div class="pagina">
    <header class="encabezado">
      <h1>Atención clínica</h1>
      <button class="secundario" @click="cerrarSesion">Cerrar sesión</button>
    </header>

    <!-- ===================== Registrar atención (tarea 3) ===================== -->
    <section class="tarjeta">
      <h2>Registrar nueva atención</h2>

      <form @submit.prevent="registrarAtencion">
        <div class="fila">
          <label>
            Mascota *
            <select v-model.number="form.idMascota" required>
              <option disabled value="">Seleccione una mascota</option>
              <option v-for="m in mascotas" :key="m.idMascota" :value="m.idMascota">
                {{ m.nombre }} ({{ m.especie }})
              </option>
            </select>
          </label>

          <label>
            Sede *
            <select v-model.number="form.idSede" required>
              <option disabled value="">Seleccione una sede</option>
              <option v-for="s in sedes" :key="s.idSede" :value="s.idSede">{{ s.nombre }}</option>
            </select>
          </label>

          <label>
            Peso (kg)
            <input type="number" step="0.01" min="0" v-model.number="form.peso" />
          </label>
        </div>

        <label>
          Motivo de consulta *
          <textarea v-model="form.motivoConsulta" rows="2" required></textarea>
        </label>

        <label>
          Tratamiento general
          <textarea v-model="form.tratamientoGeneral" rows="2"></textarea>
        </label>

        <h3>Diagnóstico</h3>
        <div class="fila">
          <label>
            Nombre
            <input type="text" maxlength="50" v-model="form.diagnostico.nombre" placeholder="Ej: Otitis" />
          </label>
          <label class="ancho">
            Detalle *
            <input type="text" v-model="form.diagnostico.detalle" required />
          </label>
        </div>

        <h3>Medicamentos recetados</h3>
        <p class="ayuda">Se descuentan del inventario de la sede. Si falta stock o la mascota es alérgica, no se guarda nada.</p>

        <table v-if="form.medicamentos.length" class="tabla">
          <thead>
          <tr>
            <th>Medicamento</th>
            <th>Cantidad *</th>
            <th>Dosis</th>
            <th>Duración (meses)</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(med, i) in form.medicamentos" :key="i">
            <td>
              <select v-if="medicamentos.length" v-model.number="med.idMedicamento" required>
                <option disabled value="">Seleccione</option>
                <option v-for="m in medicamentos" :key="m.idMedicamento" :value="m.idMedicamento">
                  {{ m.nombre }}
                </option>
              </select>
              <input v-else type="number" min="1" v-model.number="med.idMedicamento" placeholder="ID" required />
            </td>
            <td><input type="number" min="1" v-model.number="med.cantidad" required /></td>
            <td><input type="number" min="1" v-model.number="med.dosis" /></td>
            <td><input type="number" min="1" v-model.number="med.duracionMeses" /></td>
            <td><button type="button" class="secundario" @click="quitarMedicamento(i)">Quitar</button></td>
          </tr>
          </tbody>
        </table>

        <button type="button" class="secundario" @click="agregarMedicamento">+ Agregar medicamento</button>

        <div class="acciones">
          <button type="submit" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Registrar atención' }}
          </button>
        </div>
      </form>

      <p v-if="mensaje" class="exito">{{ mensaje }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <!-- ===================== Listado de atenciones ===================== -->
    <section class="tarjeta">
      <h2>Atenciones registradas</h2>
      <p v-if="!atenciones.length" class="ayuda">Todavía no hay atenciones.</p>

      <table v-else class="tabla">
        <thead>
        <tr>
          <th>N°</th>
          <th>Fecha</th>
          <th>Mascota</th>
          <th>Motivo</th>
          <th>Estado</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="a in atenciones" :key="a.idAtencion">
          <td>{{ a.idAtencion }}</td>
          <td>{{ formatearFecha(a.fecha) }}</td>
          <td>{{ nombreMascota(a.idMascota) }}</td>
          <td>{{ a.motivoConsulta }}</td>
          <td>
              <span :class="a.cerrada ? 'estado cerrada' : 'estado abierta'">
                {{ a.cerrada ? 'Cerrada' : 'Abierta' }}
              </span>
          </td>
          <td><button class="secundario" @click="verDetalle(a.idAtencion)">Ver</button></td>
        </tr>
        </tbody>
      </table>
    </section>

    <!-- ===================== Detalle de una atención ===================== -->
    <section v-if="detalle" class="tarjeta">
      <header class="encabezado">
        <h2>Atención N° {{ detalle.idAtencion }} — {{ nombreMascota(detalle.idMascota) }}</h2>
        <button class="secundario" @click="detalle = null">Cerrar detalle</button>
      </header>

      <p><strong>Motivo:</strong> {{ detalle.motivoConsulta }}</p>
      <p><strong>Peso:</strong> {{ detalle.peso ? `${detalle.peso} kg` : '—' }}</p>
      <p><strong>Tratamiento:</strong> {{ detalle.tratamientoGeneral || '—' }}</p>

      <div v-for="d in detalle.diagnosticos" :key="d.idDiagnostico" class="diagnostico">
        <template v-if="editando === d.idDiagnostico">
          <div class="fila">
            <label>Nombre <input type="text" maxlength="50" v-model="edicion.nombre" /></label>
            <label class="ancho">Detalle * <input type="text" v-model="edicion.detalle" /></label>
          </div>
          <button @click="guardarDiagnostico(d.idDiagnostico)">Guardar</button>
          <button class="secundario" @click="editando = null">Cancelar</button>
        </template>
        <template v-else>
          <p><strong>Diagnóstico:</strong> {{ d.nombre || 'Sin nombre' }} — {{ d.detalle }}</p>
          <button class="secundario" @click="editarDiagnostico(d)">Editar diagnóstico</button>
        </template>

        <ul v-if="d.recetas.length">
          <li v-for="r in d.recetas" :key="r.idMedicamento">
            {{ r.medicamento }}: {{ r.cantidad }} unidad(es){{ r.dosis ? `, dosis ${r.dosis}` : '' }}{{ r.duracionMeses ? `, ${r.duracionMeses} mes(es)` : '' }}
          </li>
        </ul>
        <p v-else class="ayuda">Sin medicamentos recetados.</p>
      </div>

      <p v-if="detalle.cerrada" class="ayuda">
        Esta atención está cerrada: cualquier cambio en sus diagnósticos queda registrado en la auditoría.
      </p>
      <button v-else @click="cerrarAtencion(detalle.idAtencion)">Cerrar atención</button>

      <p v-if="errorDetalle" class="error">{{ errorDetalle }}</p>
    </section>

    <!-- ===================== Mis Turnos Asignados ===================== -->
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

      <!-- Grilla de 7 columnas (Lunes a Domingo) -->
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
            <!-- Turno asignado para este día -->
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

            <!-- Conteo de citas agendadas -->
            <div v-if="dia.totalCitas > 0" class="badge-citas">
              📅 {{ dia.totalCitas }} {{ dia.totalCitas === 1 ? 'cita agendada' : 'citas agendadas' }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();

const mascotas = ref([]);
const sedes = ref([]);
const medicamentos = ref([]);
const atenciones = ref([]);

const guardando = ref(false);
const mensaje = ref('');
const error = ref('');

const detalle = ref(null);
const errorDetalle = ref('');
const editando = ref(null);
const edicion = reactive({ nombre: '', detalle: '' });

const citasSemana = ref([]);
const turnos = ref([]);
const cargandoTurnos = ref(false);
const semanaOffset = ref(0);
const DIAS_NOMBRE = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

// Convierte Date a 'YYYY-MM-DD' en hora local evitando desfases de toISOString
function formatoFechaLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const diasSemanaCalendario = computed(() => {
  const hoy = new Date();
  const diaSemanaActual = hoy.getDay() === 0 ? 7 : hoy.getDay(); // 1=Lunes, 7=Domingo

  // Calcular el lunes de la semana según el offset
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (diaSemanaActual - 1) + (semanaOffset.value * 7));

  const hoyStr = formatoFechaLocal(hoy);

  return DIAS_NOMBRE.map((nombre, index) => {
    const fechaDia = new Date(lunes);
    fechaDia.setDate(lunes.getDate() + index);

    const numeroDia = index + 1; // 1 = Lunes ... 7 = Domingo
    const fechaStr = formatoFechaLocal(fechaDia);
    const fechaCorta = fechaDia.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });

    // Filtrar turnos del día que coincidan con el día de la semana
    const turnosDelDia = turnos.value.filter(t => {
      const d = t.diaSemana ?? t.diasemana;
      return Number(d) === numeroDia;
    });

    // Contar citas cuya fecha coincida exactamente con la fecha local de esta columna
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

// Obtiene el idVeterinario del token priorizando las claves habituales
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

    // Solo mandamos el idVeterinario si es un valor numérico válido
    if (idVet && !isNaN(Number(idVet))) {
      params.idVeterinario = Number(idVet);
    }

    const { data } = await api.get('/turnos', {
      params,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
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
  const fechaInicio = dias[0].fechaStr;
  const fechaFin = dias[6].fechaStr;
  const idVet = obtenerIdVeterinarioToken();

  try {
    const params = { desde: fechaInicio, hasta: fechaFin };
    if (idVet && !isNaN(Number(idVet))) {
      params.idVeterinario = Number(idVet);
    }
    const { data } = await api.get('/citas', { params });
    citasSemana.value = Array.isArray(data) ? data : (data.citas || data.data || []);
  } catch (e) {
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

function formularioVacio() {
  return {
    idMascota: '',
    idSede: '',
    peso: null,
    motivoConsulta: '',
    tratamientoGeneral: '',
    diagnostico: { nombre: '', detalle: '' },
    medicamentos: []
  };
}
const form = reactive(formularioVacio());

function mensajeDeError(e) {
  if (e.response?.status === 401) {
    cerrarSesion();
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }
  return e.response?.data?.error || 'No se pudo conectar con el servidor.';
}

async function cargarDatos() {
  try {
    const [resMascotas, resSedes] = await Promise.all([api.get('/mascotas'), api.get('/sedes')]);
    mascotas.value = resMascotas.data;
    sedes.value = resSedes.data;
  } catch (e) {
    error.value = mensajeDeError(e);
  }

  try {
    medicamentos.value = (await api.get('/medicamentos')).data;
  } catch {
    medicamentos.value = [];
  }

  await cargarAtenciones();
  await cargarTurnos();
  await cargarCitasSemana();
}

async function cargarAtenciones() {
  try {
    atenciones.value = (await api.get('/atenciones')).data;
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

function agregarMedicamento() {
  form.medicamentos.push({ idMedicamento: '', cantidad: 1, dosis: null, duracionMeses: null });
}

function quitarMedicamento(i) {
  form.medicamentos.splice(i, 1);
}

async function registrarAtencion() {
  mensaje.value = '';
  error.value = '';
  guardando.value = true;
  try {
    const cuerpo = {
      idMascota: form.idMascota,
      idSede: form.idSede,
      peso: form.peso || null,
      motivoConsulta: form.motivoConsulta,
      tratamientoGeneral: form.tratamientoGeneral || null,
      diagnostico: {
        nombre: form.diagnostico.nombre || null,
        detalle: form.diagnostico.detalle
      },
      medicamentos: form.medicamentos.map(m => ({
        idMedicamento: m.idMedicamento,
        cantidad: m.cantidad,
        dosis: m.dosis || null,
        duracionMeses: m.duracionMeses || null
      }))
    };
    const { data } = await api.post('/atenciones', cuerpo);
    mensaje.value = `Atención N° ${data.idAtencion} registrada correctamente.`;
    Object.assign(form, formularioVacio());
    await cargarAtenciones();
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    guardando.value = false;
  }
}

async function verDetalle(id) {
  errorDetalle.value = '';
  editando.value = null;
  try {
    detalle.value = (await api.get(`/atenciones/${id}`)).data;
  } catch (e) {
    errorDetalle.value = mensajeDeError(e);
  }
}

async function cerrarAtencion(id) {
  errorDetalle.value = '';
  try {
    detalle.value = (await api.patch(`/atenciones/${id}/cerrar`)).data;
    await cargarAtenciones();
  } catch (e) {
    errorDetalle.value = mensajeDeError(e);
  }
}

function editarDiagnostico(d) {
  editando.value = d.idDiagnostico;
  edicion.nombre = d.nombre || '';
  edicion.detalle = d.detalle;
}

async function guardarDiagnostico(idDiagnostico) {
  errorDetalle.value = '';
  try {
    await api.put(`/diagnosticos/${idDiagnostico}`, {
      nombre: edicion.nombre || null,
      detalle: edicion.detalle
    });
    editando.value = null;
    await verDetalle(detalle.value.idAtencion);
  } catch (e) {
    errorDetalle.value = mensajeDeError(e);
  }
}

function nombreMascota(id) {
  return mascotas.value.find(m => m.idMascota === id)?.nombre ?? `Mascota ${id}`;
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
}

function cerrarSesion() {
  localStorage.removeItem('token');
  router.push('/login');
}

onMounted(cargarDatos);
</script>

<style scoped>
.pagina {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}
.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.tarjeta {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}
h2 { margin-top: 0; }
h3 { margin-bottom: 6px; }
label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 14px;
}
.fila {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.fila > label { flex: 1 1 180px; }
.fila > label.ancho { flex: 2 1 300px; }
input, select, textarea {
  padding: 6px 8px;
  border: 1px solid #aaa;
  border-radius: 4px;
  font: inherit;
}
button {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: #2c6e49;
  color: white;
  cursor: pointer;
  margin-right: 6px;
}
button:disabled { opacity: 0.6; cursor: default; }
button.secundario {
  background: #e8e8e8;
  color: #222;
}
.acciones { margin-top: 16px; }
.tabla {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 12px;
  font-size: 14px;
}
.tabla th, .tabla td {
  border-bottom: 1px solid #ddd;
  padding: 6px;
  text-align: left;
}
.tabla input, .tabla select { width: 100%; box-sizing: border-box; }
.ayuda { color: #666; font-size: 13px; }
.exito { color: #2c6e49; font-weight: bold; }
.error { color: #c0392b; font-weight: bold; }
.estado {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.estado.abierta { background: #e3f2e9; color: #2c6e49; }
.estado.cerrada { background: #eee; color: #555; }
.diagnostico {
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
}
.encabezado-calendario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.subtitulo-semana {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}
.controles-semana {
  display: flex;
  gap: 0.4rem;
}
.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(110px, 1fr));
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.dia-columna {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}
.dia-columna.dia-hoy {
  border-color: #2c6e49;
  background: #f0fdf4;
}
.dia-cabecera {
  padding: 6px 8px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
  background: #edf2f7;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.dia-hoy .dia-cabecera {
  background: #2c6e49;
  color: white;
}
.nombre-dia {
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
}
.fecha-dia {
  font-size: 0.75rem;
  color: inherit;
  opacity: 0.85;
}
.dia-cuerpo {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.sin-turnos {
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: center;
  margin-top: 15px;
  font-style: italic;
}
.tarjeta-bloque-turno {
  background: #ffffff;
  border-left: 3px solid #2c6e49;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.hora-badge {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e293b;
}
.sede-badge {
  display: inline-block;
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 2px;
}
.badge-citas {
  margin-top: auto;
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 4px 6px;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #bae6fd;
}
</style>