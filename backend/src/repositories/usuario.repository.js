const pool = require('../config/db');

// 1. Insertar en la tabla abuela (Usuario)
async function insertarUsuarioBase(client, email, passwordHash) {
    const { rows } = await client.query(
        'INSERT INTO Usuario (email, passwordHash) VALUES ($1, $2) RETURNING idUsuario',
        [email, passwordHash]
    );
    return rows[0].idusuario;
}

// 2. Insertar en la tabla padre (Empleado)
async function insertarEmpleado(client, idUsuario, nombreEmp, apellidoEmp, rut, telefono) {
    await client.query(
        'INSERT INTO Empleado (idEmpleado, nombreEmp, apellidoEmp, rut, telefono) VALUES ($1, $2, $3, $4, $5)',
        [idUsuario, nombreEmp, apellidoEmp, rut, telefono]
    );
}

// 3a. Insertar en la tabla hija (Veterinario)
async function insertarVeterinario(client, idUsuario, especialidad) {
    await client.query(
        'INSERT INTO Veterinario (idVeterinario, especialidad) VALUES ($1, $2)',
        [idUsuario, especialidad]
    );
}

// 3b. Insertar en la tabla hija (Administrador)
async function insertarAdministrador(client, idUsuario) {
    await client.query(
        'INSERT INTO Administrador (idAdministrador) VALUES ($1)',
        [idUsuario]
    );
}

// GET: Obtener listas
async function obtenerTutores() {
    const { rows } = await pool.query(`
        SELECT u.idUsuario, u.email, t.rut, t.telefono 
        FROM Usuario u 
        JOIN Tutor t ON u.idUsuario = t.idTutor
    `);
    return rows;
}

async function obtenerPersonal() {
    const { rows } = await pool.query(`
        SELECT u.idUsuario, u.email, e.nombreEmp, e.apellidoEmp, e.rut, e.telefono 
        FROM Usuario u 
        JOIN Empleado e ON u.idUsuario = e.idEmpleado
    `);
    return rows;
}

async function obtenerPersonalPorId(id) {
    const { rows } = await pool.query(`
        SELECT u.idUsuario, u.email, e.nombreEmp, e.apellidoEmp, e.rut, e.telefono 
        FROM Usuario u 
        JOIN Empleado e ON u.idUsuario = e.idEmpleado
        WHERE u.idUsuario = $1
    `, [id]);
    return rows[0];
}

async function obtenerVeterinarios() {
    const { rows } = await pool.query(`
        SELECT u.idUsuario, u.email, e.nombreEmp, e.apellidoEmp, e.rut, e.telefono, e.idSede, v.especialidad 
        FROM Usuario u 
        JOIN Empleado e ON u.idUsuario = e.idEmpleado
        JOIN Veterinario v ON e.idEmpleado = v.idVeterinario
    `);
    return rows;
}

async function obtenerVeterinarioPorId(id) {
    const { rows } = await pool.query(`
        SELECT u.idUsuario, u.email, e.nombreEmp, e.apellidoEmp, e.rut, e.telefono, v.especialidad 
        FROM Usuario u 
        JOIN Empleado e ON u.idUsuario = e.idEmpleado
        JOIN Veterinario v ON e.idEmpleado = v.idVeterinario
        WHERE u.idUsuario = $1
    `, [id]);
    return rows[0];
}

// PUT: Actualizar datos específicos
async function actualizarTutor(id, rut, telefono) {
    const { rowCount } = await pool.query(
        'UPDATE Tutor SET rut = $1, telefono = $2 WHERE idTutor = $3',
        [rut, telefono, id]
    );
    return rowCount > 0;
}

async function actualizarEmpleado(id, nombre, apellido, rut, telefono) {
    const { rowCount } = await pool.query(
        'UPDATE Empleado SET nombreEmp = $1, apellidoEmp = $2, rut = $3, telefono = $4 WHERE idEmpleado = $5',
        [nombre, apellido, rut, telefono, id]
    );
    return rowCount > 0;
}

// DELETE: Elimina el usuario base (PostgreSQL hará el CASCADE a las demás tablas)
async function eliminarUsuario(id) {
    const { rowCount } = await pool.query('DELETE FROM Usuario WHERE idUsuario = $1', [id]);
    return rowCount > 0;
}

module.exports = { 
    insertarUsuarioBase, 
    insertarEmpleado, 
    insertarVeterinario, 
    insertarAdministrador,
    obtenerTutores,
    obtenerPersonal,
    obtenerPersonalPorId,
    obtenerVeterinarios,
    obtenerVeterinarioPorId,
    actualizarTutor,
    actualizarEmpleado,
    eliminarUsuario
};