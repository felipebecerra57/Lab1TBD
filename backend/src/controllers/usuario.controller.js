const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const repo = require('../repositories/usuario.repository');

async function registrarVeterinario(req, res) {
    // Agregamos nombreEmp y apellidoEmp según tu tabla
    const { email, password, nombreEmp, apellidoEmp, rut, telefono, especialidad } = req.body;
    const client = await pool.connect();
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await client.query('BEGIN');
        
        // Cadena de 3 inserciones
        const idUsuario = await repo.insertarUsuarioBase(client, email, passwordHash);
        await repo.insertarEmpleado(client, idUsuario, nombreEmp, apellidoEmp, rut, telefono);
        await repo.insertarVeterinario(client, idUsuario, especialidad);
        
        await client.query('COMMIT');
        res.status(201).json({ mensaje: 'Veterinario registrado exitosamente', idUsuario });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar veterinario:', error);
        res.status(500).json({ error: 'Error interno al registrar veterinario' });
    } finally {
        client.release();
    }
}

async function registrarAdministrador(req, res) {
    const { email, password, nombreEmp, apellidoEmp, rut, telefono } = req.body;
    const client = await pool.connect();
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await client.query('BEGIN');
        
        // Cadena de 3 inserciones (sin especialidad)
        const idUsuario = await repo.insertarUsuarioBase(client, email, passwordHash);
        await repo.insertarEmpleado(client, idUsuario, nombreEmp, apellidoEmp, rut, telefono);
        await repo.insertarAdministrador(client, idUsuario);
        
        await client.query('COMMIT');
        res.status(201).json({ mensaje: 'Administrador registrado exitosamente', idUsuario });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar administrador:', error);
        res.status(500).json({ error: 'Error interno al registrar administrador' });
    } finally {
        client.release();
    }
}

module.exports = { registrarVeterinario, registrarAdministrador };