const pool = require('../config/db');

const COLUMNAS = `especie, sede, diagnostico, cantidad_atenciones::int AS cantidad_atenciones`;

async function getEstadisticas() {
    const { rows } = await pool.query(
        `select ${COLUMNAS} from mv_estadisticas_atencion
        order by cantidad_atenciones DESC`);
    return rows;
    
}


module.exports = {getEstadisticas};