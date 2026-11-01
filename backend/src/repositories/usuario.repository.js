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

module.exports = { 
    insertarUsuarioBase, 
    insertarEmpleado, 
    insertarVeterinario, 
    insertarAdministrador 
};