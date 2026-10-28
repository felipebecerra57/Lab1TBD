const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

// Rutas
const authRoutes = require('./routes/authRoutes');
const sedeRoutes = require('./routes/sede.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/sedes', sedeRoutes);

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