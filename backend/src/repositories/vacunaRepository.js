const pool = require('../config/db');

const columnas = `idVacuna AS "idVacuna", nombreV AS "nombreV", totalDosis AS "totalDosis", intervaloDias AS "intervaloDias"`;

async function getVacunas(){
    const { rows } = await pool.query(`SELECT ${columnas} FROM Vacuna ORDER BY idVacuna`);
    return rows;
}

async function getVacuna(id){
    const { rows } = await pool.query(`select ${columnas} from Vacuna where idVacuna = $1`, [id]);
    return rows[0];
}

async function crear({nombreV, totalDosis, intervaloDias}){
    const {rows} = await pool.query(`
    insert into Vacuna (nombreV, totalDosis, intervaloDias)
    values ($1, $2, $3)
    returning ${columnas}`, [nombreV, totalDosis, intervaloDias]);
    return rows[0];
}

async function eliminar(id) {
    const { rowCount } = await pool.query('DELETE FROM Vacuna WHERE idVacuna = $1', [id]);
    return rowCount > 0;
}

module.exports = {getVacuna, getVacunas, crear, eliminar};