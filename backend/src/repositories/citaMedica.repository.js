const pool = require('../config/db');

const columnas = `idCita AS "idCita", fecha, idVeterinario AS "idVeterinario", idMascota AS "idMascota", idSede AS "idSede", 
    estado, modalidad, direccionDomicilio AS "direccionDomicilio", duracionMin AS "duracionMin"`;

async function getCitas(idVeterinario = null, idSede = null){
    const {rows} = await pool.query(
        `select ${columnas}
        from CitaMedica c
        where ($1::int is null or c.idVeterinario = $1)
        and ($2::int is null or c.idSede = $2)
        order by c.fecha desc`,
        [idVeterinario, idSede]
    );
    return rows;
}
async function getCitasPorMascota(idMascota){
    const {rows} = await pool.query(
        `select ${columnas} 
        from CitaMedica
        where idMascota = $1
        order by fecha desc`,
        [idMascota]
    );
    return rows;
}

async function crearCita(fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin) {
    const { rows } = await pool.query(
    `insert into CitaMedica (fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin)
     values ($1, $2, $3, $4, coalesce($5, 'PROGRAMADA'), coalesce($6, 'SEDE'), $7, coalesce($8, 30))
     returning idCita as "idCita"`,
    [fecha, idVeterinario, idMascota, idSede, estado ?? null, modalidad ?? null, direccionDomicilio ?? null, duracionMin ?? null,]
    );
    return rows[0]?.idCita;
}
module.exports = {getCitas, getCitasPorMascota, crearCita};