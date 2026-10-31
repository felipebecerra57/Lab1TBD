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

async function getCitaPorId(idCita){
    const {rows} = await pool.query(
        `select ${columnas} 
        from CitaMedica
        where idCita = $1`,
        [idCita]
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

async function actualizarCita(idCita, fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin) {
    const { rowCount } = await pool.query(
    `update CitaMedica
         set fecha = coalesce($1, fecha),
             idVeterinario = coalesce($2, idVeterinario),
             idMascota = coalesce($3, idMascota),
             idSede = coalesce($4, idSede),
             estado = coalesce($5, estado),
             modalidad = coalesce($6, modalidad),
             direccionDomicilio = coalesce($7, direccionDomicilio),
             duracionMin = coalesce($8, duracionMin)
         where idCita = $9`,
    [
        fecha ?? null,
    idVeterinario ?? null,
    idMascota ?? null,
    idSede ?? null,
    estado ?? null,
    modalidad ?? null,
    direccionDomicilio ?? null,
    duracionMin ?? null,
    idCita
]
);
    return rowCount > 0;
}
async function eliminarCita(idCita){
    const {rowCount} = await pool.query(
        `delete from CitaMedica where idCita = $1`,
        [idCita]
    );
    return rowCount >0;
}
module.exports = {getCitas, getCitasPorMascota, getCitaPorId, crearCita, actualizarCita, eliminarCita};