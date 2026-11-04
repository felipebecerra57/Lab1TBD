const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
require('./jobs/refrescarEstadisticas');

// Rutas
const authRoutes = require('./routes/authRoutes');
const sedeRoutes = require('./routes/sede.routes');
const citaRoutes = require('./routes/citaMedica.routes');
const turnoRoutes = require('./routes/turno.routes');
const medicamentoRoutes = require('./routes/medicamento.routes');
const reporteRoutes = require('./routes/reporteRoutes');
const inventarioRoutes = require('./routes/inventario.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/sedes', sedeRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/inventarios', inventarioRoutes);
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/diagnosticos', require('./routes/diagnostico.routes'));
app.use('/api/recetas', require('./routes/receta.routes'));
app.use('/api/atenciones', require('./routes/atencion.routes'));
app.use('/api/mascotas', require('./routes/mascotaRoutes'));
app.use('/api/fichas', require('./routes/fichaClinicaRoutes'));
app.use('/api/especies', require('./routes/especieRoutes'));
app.use('/api/vacunas', require('./routes/vacunaRoutes'));
app.use('/api/principios-activos', require('./routes/principioActRoutes'));
app.use('/api/alergias', require('./routes/alergiaRoutes'));


// Endpoint de prueba de conexión
app.get('/api/ping', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ mensaje: 'Conexión exitosa a PostgreSQL', fecha_db: result.rows[0].now });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fallo al conectar a la base de datos' });
    }
});

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Servidor de Veterinaria corriendo en http://localhost:${PORT}`);
});
