const pool = require('../config/db');

const COLUMNAS = `idDiagnostico AS "idDiagnostico", idAtencion AS "idAtencion", nombre, detalle`;

// listar diagnósticos (opcionalmente filtrados por atención)
async function getDiagnosticos(idAtencion) {
    if (idAtencion) {
        const { rows } = await pool.query(
            `select ${COLUMNAS} from Diagnostico where idAtencion = $1 order by idDiagnostico`,
            [idAtencion]
        );
        return rows;
    }
    const { rows } = await pool.query(`select ${COLUMNAS} from Diagnostico order by idDiagnostico`);
    return rows;
}

// buscar por id
async function getDiagnostico(id) {
    const { rows } = await pool.query(`select ${COLUMNAS} from Diagnostico where idDiagnostico = $1`, [id]);
    return rows[0];
}

// crear diagnóstico
async function crearDiagnostico({ idAtencion, nombre, detalle }) {
    const { rows } = await pool.query(
        `insert into Diagnostico (idAtencion, nombre, detalle)
         values ($1, $2, $3)
         returning ${COLUMNAS}`,
        [idAtencion, nombre, detalle]
    );
    return rows[0];
}

// actualizar diagnóstico (tarea 6: guarda quién hizo el cambio para el trigger de auditoría)
async function actualizarDiagnostico(id, { nombre, detalle }, idUsuario) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // le dice al trigger qué usuario está haciendo el cambio (solo dura esta transacción)
        await client.query(`select set_config('app.id_usuario', $1, true)`, [String(idUsuario)]);
        const { rows } = await client.query(
            `update Diagnostico
             set nombre = $1, detalle = $2
             where idDiagnostico = $3
             returning ${COLUMNAS}`,
            [nombre, detalle, id]
        );
        await client.query('COMMIT');
        return rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// eliminar diagnóstico
async function eliminarDiagnostico(id) {
    const { rowCount } = await pool.query(`delete from Diagnostico where idDiagnostico = $1`, [id]);
    return rowCount > 0;
}

module.exports = { getDiagnosticos, getDiagnostico, crearDiagnostico, actualizarDiagnostico, eliminarDiagnostico };
