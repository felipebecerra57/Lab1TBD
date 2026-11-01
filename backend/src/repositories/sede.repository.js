const pool = require('../config/db');

const COLUMNAS = `idSede AS "idSede", nombre, calle, numero, comuna, telefono, idAdmin AS "idAdmin"`;

// listar sedes
async function getSedes() {
    const { rows } = await pool.query(`select ${COLUMNAS} from Sede order by idSede`);
    return rows;
}

// buscar por id
async function getSede(id) {
    const { rows } = await pool.query(`select ${COLUMNAS} from Sede where idSede = $1`, [id]);
    return rows[0];
}

// crear nueva sede
async function crearSede({ nombre, calle, numero, comuna, telefono, idAdmin }) {
    const { rows } = await pool.query(
        `insert into Sede (nombre, calle, numero, comuna, telefono, idAdmin)
         values ($1, $2, $3, $4, $5, $6)
             returning ${COLUMNAS}`,
        [nombre, calle, numero, comuna, telefono, idAdmin ?? null]
    );
    return rows[0];
}

async function actualizarSede(id, { nombre, calle, numero, comuna, telefono, idAdmin }) {
    const { rows } = await pool.query(
        `UPDATE Sede
         SET nombre = $1, calle = $2, numero = $3, comuna = $4, telefono = $5, idAdmin = $6
         WHERE idSede = $7
         RETURNING ${COLUMNAS}`,
        [nombre, calle, numero, comuna, telefono, idAdmin ?? null, id]
    );
    return rows[0];
}

// Eliminar sede por ID
async function eliminarSede(id) {
    const { rowCount } = await pool.query('DELETE FROM Sede WHERE idSede = $1', [id]);
    return rowCount > 0; // Retorna true si se eliminó, false si no existía
}

module.exports = { getSedes, getSede, crearSede, actualizarSede, eliminarSede};