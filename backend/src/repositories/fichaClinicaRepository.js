const pool = require('../config/db');

const columnas = `f.idFicha AS "idFicha", f.idMascota AS "idMascota", m.nombre AS "mascota",
  f.fechaCreacion AS "fechaCreacion", f.esterilizado, f.observacionesGenerales AS "observacionesGenerales"`;

async function getFichasPorTutor(idTutor){
    const {rows} = await pool.query(
        `select ${columnas} from FichaClinica f
        join Mascota m on f.idMascota = m.idMascota
        where ($1::int is null or m.idTutor = $1)
        order by f.idFicha`,
        [idTutor]
    );
    return rows;
}

async function getFichaPorMascota(idMascota, idTutor){
    const {rows} = await pool.query(
        `select ${columnas} from FichaClinica f
        join Mascota m on m.idMascota = f.idMascota
        where f.idMascota = $1 and (m.idTutor = $2 or $2::int is null)`,
        [idMascota, idTutor]
    );
    return rows;
}

async function getPorId(idFicha, idTutor) {
    const { rows } = await pool.query(
        `SELECT ${COLUMNAS}
     FROM FichaClinica f JOIN Mascota m ON m.idMascota = f.idMascota
     WHERE f.idFicha = $1 AND ($2::int IS NULL OR m.idTutor = $2)`,
        [idFicha, idTutor]
    );
    return rows[0];
}

async function crearFichaClinica({ idMascota, esterilizado, observacionesGenerales }){
    const {rows} = await pool.query(
        `insert into FichaClinica (idMascota, esterilizado, observacionesGenerales)
        values ($1, coalesce($2,false), $3)
        returning idFicha as "idFicha"`,
    );
    return rows[0].idFicha;
}

async function actualizarFichaClinica(idFicha, {esterilizado, observacionesGenerales}){
    const {rowCount} = await pool.query(
        `update FichaClinica
        set estirilizado = coalesce($1, estirilizado), observacionesGenerales = $2
        where idFicha = $3`,
        [esterilizado, observacionesGenerales ?? null, idFicha]
    );
    return rowCount > 0;
}

async function eliminarFichaClinica(idFicha){
    const {rowCount} = await pool.query(
        `delete from FichaClinica where idFicha $1`, [idFicha]);
        return rowCount >0;
}

module.exports = (getFichaPorMascota, getFichasPorTutor, getPorId, crearFichaClinica, actualizarFichaClinica, eliminarFichaClinica)







