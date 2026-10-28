const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Registro básico para un Tutor
const registerTutor = async (req, res) => {
    const { email, password, rut, telefono, nombre, apellido } = req.body;
    
    // 1. Obtener un cliente exclusivo del pool para la transacción
    const client = await pool.connect();
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Iniciar la transacción sobre este cliente específico
        await client.query('BEGIN');

        const userResult = await client.query(
            'INSERT INTO Usuario (email, passwordHash) VALUES ($1, $2) RETURNING idUsuario',
            [email, passwordHash]
        );
        const idUsuario = userResult.rows[0].idusuario;

        await client.query(
            'INSERT INTO Tutor (idTutor, rut, telefono) VALUES ($1, $2, $3)',
            [idUsuario, rut, telefono]
        );

        // 3. Confirmar los cambios
        await client.query('COMMIT');
        res.status(201).json({ mensaje: 'Tutor registrado exitosamente', idUsuario });

    } catch (error) {
        // Si algo falla, revertir usando el mismo cliente
        await client.query('ROLLBACK');
        console.error('Error en la transacción de registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    } finally {
        // 4. CRÍTICO: Devolver el cliente al pool para que no se agoten las conexiones
        client.release();
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