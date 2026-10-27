const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Registro básico para un Tutor
const registerTutor = async (req, res) => {
    const { email, password, rut, telefono, nombre, apellido } = req.body;
    try {
        // 1. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Iniciar transacción manual
        await pool.query('BEGIN');

        // 3. Insertar en tabla padre (Usuario)
        const userResult = await pool.query(
            'INSERT INTO Usuario (email, passwordHash) VALUES ($1, $2) RETURNING idUsuario',
            [email, passwordHash]
        );
        const idUsuario = userResult.rows[0].idusuario;

        // 4. Insertar en tabla hija (Tutor)
        await pool.query(
            'INSERT INTO Tutor (idTutor, rut, telefono) VALUES ($1, $2, $3)',
            [idUsuario, rut, telefono]
        );

        await pool.query('COMMIT');
        res.status(201).json({ mensaje: 'Tutor registrado exitosamente', idUsuario });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

// Login general para cualquier tipo de usuario
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM Usuario WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user = userResult.rows[0];

        // 2. Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.passwordhash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 3. Determinar el rol buscando el ID en las tablas hijas
        let rol = 'TUTOR'; // Por defecto
        const adminCheck = await pool.query('SELECT 1 FROM Administrador WHERE idAdministrador = $1', [user.idusuario]);
        if (adminCheck.rows.length > 0) {
            rol = 'ADMIN';
        } else {
            const vetCheck = await pool.query('SELECT 1 FROM Veterinario WHERE idVeterinario = $1', [user.idusuario]);
            if (vetCheck.rows.length > 0) {
                rol = 'VET';
            }
        }

        // 4. Generar Token JWT
        const token = jwt.sign(
            { idUsuario: user.idusuario, rol: rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ mensaje: 'Login exitoso', token, rol });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión' });
    }
};

module.exports = { registerTutor, login };