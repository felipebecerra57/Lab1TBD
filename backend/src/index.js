const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Permite al backend leer JSON en los requests
app.use('/api/auth', authRoutes);


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
app.use('/api/sedes', require('./routes/sede.routes'));
app.use('/api/mascotas', require('./routes/mascotaRoutes'));
app.use('/api/fichas', require('./routes/fichaClinicaRoutes'));

app.listen(PORT, () => {
    console.log(`Servidor de Veterinaria corriendo en http://localhost:${PORT}`);
});