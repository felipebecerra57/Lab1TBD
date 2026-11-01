const pool = require('../config/db');

const columnas = `ma.idMascota AS "idMascota", m.nombre AS "mascota",
  ma.idPrincipioActivo AS "idPrincipioActivo", pa.nombre AS "principioActivo",
  ma.severidad, ma.fechaDeteccion AS "fechaDeteccion"`;

const desde = `FROM MascotaAlergia ma
  JOIN Mascota m ON m.idMascota = ma.idMascota
  JOIN PrincipioActivo pa ON pa.idPrincipioActivo = ma.idPrincipioActivo`;

// si idTutor == null -> todas; sino solo las mascotas del tutor
async function getAlergias(idTutor){
    const {rows} = await pool.query(`
    select ${columnas} ${desde}
    where ($1::int IS NULL OR m.idTutor = $1)
     ORDER BY ma.idMascota, pa.nombre `, [idTutor]);
    return rows;
}

async function getPorMascota(idMascota) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNAS} ${DESDE}
     WHERE ma.idMascota = $1
     ORDER BY pa.nombre`,
        [idMascota]
    );
    return rows;
}

async function obtener(idMascota, idPrincipio) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNAS} ${DESDE}
     WHERE ma.idMascota = $1 AND ma.idPrincipioActivo = $2`,
        [idMascota, idPrincipio]
    );
    return rows[0];
}

async function crear({ idMascota, idPrincipioActivo, severidad }) {
    await pool.query(
        `INSERT INTO MascotaAlergia (idMascota, idPrincipioActivo, severidad)
     VALUES ($1, $2, $3)`,
        [idMascota, idPrincipioActivo, severidad ?? null]
    );
}

async function actualizar(idMascota, idPrincipio, { severidad }) {
    const { rowCount } = await pool.query(
        `UPDATE MascotaAlergia SET severidad = $1
     WHERE idMascota = $2 AND idPrincipioActivo = $3`,
        [severidad, idMascota, idPrincipio]
    );
    return rowCount > 0;
}

async function eliminar(idMascota, idPrincipio) {
    const { rowCount } = await pool.query(
        'DELETE FROM MascotaAlergia WHERE idMascota = $1 AND idPrincipioActivo = $2',
        [idMascota, idPrincipio]
    );
    return rowCount > 0;
}

module.exports = { getAlergias, getPorMascota, obtener, crear, actualizar, eliminar };