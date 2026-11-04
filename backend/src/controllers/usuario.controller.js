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

async function getTutores(req, res) {
    try {
        const tutores = await repo.obtenerTutores();
        res.json(tutores);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener tutores' });
    }
}

async function getPersonal(req, res) {
    try {
        const personal = await repo.obtenerPersonal();
        res.json(personal);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener personal' });
    }
}

async function getPersonalById(req, res) {
    try {
        const empleado = await repo.obtenerPersonalPorId(req.params.id);
        if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
        res.json(empleado);
    } catch (e) {
        res.status(500).json({ error: 'Error al buscar el empleado' });
    }
}

async function getVeterinarios(req, res) {
    try {
        const vets = await repo.obtenerVeterinarios();
        console.log('Veterinarios obtenidos de la BD:', vets);
        res.json(vets);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener veterinarios' });
    }
}

async function getVeterinarioById(req, res) {
    try {
        const vet = await repo.obtenerVeterinarioPorId(req.params.id);
        if (!vet) return res.status(404).json({ error: 'Veterinario no encontrado' });
        res.json(vet);
    } catch (e) {
        res.status(500).json({ error: 'Error al buscar el veterinario' });
    }
}

async function updateTutor(req, res) {
    const { rut, telefono } = req.body;
    try {
        const actualizado = await repo.actualizarTutor(req.params.id, rut, telefono);
        if (!actualizado) return res.status(404).json({ error: 'Tutor no encontrado' });
        res.json({ mensaje: 'Tutor actualizado exitosamente' });
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar tutor' });
    }
}

async function updateEmpleado(req, res) {
    const { nombreEmp, apellidoEmp, rut, telefono } = req.body;
    try {
        const actualizado = await repo.actualizarEmpleado(req.params.id, nombreEmp, apellidoEmp, rut, telefono);
        if (!actualizado) return res.status(404).json({ error: 'Empleado no encontrado' });
        res.json({ mensaje: 'Empleado actualizado exitosamente' });
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar empleado' });
    }
}

async function deleteUsuario(req, res) {
    try {
        const eliminado = await repo.eliminarUsuario(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (e) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
}

module.exports = { registrarVeterinario, registrarAdministrador, getTutores, getPersonal, getPersonalById, getVeterinarios, getVeterinarioById, updateTutor, updateEmpleado, deleteUsuario };