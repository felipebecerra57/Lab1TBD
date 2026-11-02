const pool = require('../config/db');

const COLUMNAS = `idPrincipioActivo AS "idPrincipioActivo", nombre`;

async function getPrincipios() {
    const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM PrincipioActivo ORDER BY nombre`);
    return rows;
}

async function getPrincipio(id) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNAS} FROM PrincipioActivo WHERE idPrincipioActivo = $1`,
        [id]
    );
    return rows[0];
}

async function crear({ nombre }) {
    const { rows } = await pool.query(
        `INSERT INTO PrincipioActivo (nombre) VALUES ($1) RETURNING ${COLUMNAS}`,
        [nombre]
    );
    return rows[0];
}

async function eliminar(id) {
    const { rowCount } = await pool.query(
        'DELETE FROM PrincipioActivo WHERE idPrincipioActivo = $1',
        [id]
    );
    return rowCount > 0;
}

module.exports = { getPrincipio, getPrincipios ,crear, eliminar };

