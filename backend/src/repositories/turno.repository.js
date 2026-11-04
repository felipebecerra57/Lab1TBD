const pool = require('../config/db');

const columnas = `idTurno AS "idTurno", idVeterinario AS "idVeterinario", idSede AS "idSede", 
    diaSemana AS "diaSemana", horaInicio AS "horaInicio", horaTermino AS "horaTermino"`;

async function getTurnos(idVeterinario = null, idSede = null, diaSemana = null){
    const {rows} = await pool.query(
        `select ${columnas}
        from Turno t
        where ($1::int is null or t.idVeterinario = $1)
          and ($2::int is null or t.idSede = $2)
          and ($3::int is null or t.diaSemana = $3)
         order by t.diaSemana, t.horaInicio asc`,
        [idVeterinario, idSede, diaSemana]
    );
    return rows;
}

async function getTurnoPorId(idTurno){
    const {rows} = await pool.query(
        `select ${columnas} 
        from Turno
        where idTurno = $1`,
        [idTurno]
    );
    return rows[0] || null;
}

async function getBloquesLibres(idVeterinario, fecha) {
    const { rows } = await pool.query(
        `with turno_dia as (
            select horaInicio, horaTermino
            from Turno
            where idVeterinario = $1
              and diaSemana = extract(isodow from $2::date)
        ),
        bloques as (
            select slot as "horaInicio",
                   slot + interval '30 minutes' as "horaTermino"
            from turno_dia,
                 generate_series(
                     $2::date + horaInicio,
                     $2::date + horaTermino - interval '30 minutes',
                     interval '30 minutes'
                 ) as slot
        )
        select to_char("horaInicio", 'HH24:MI') as "horaInicio",
               to_char("horaTermino", 'HH24:MI') as "horaTermino"
        from bloques b
        where not exists (
            select 1
            from CitaMedica c
            where c.idVeterinario = $1
              and c.estado = 'PROGRAMADA'
              and c.fecha = b."horaInicio"
        )
        order by b."horaInicio" asc`,
        [idVeterinario, fecha]
    );
    return rows;
}

async function crearTurno(idVeterinario, idSede, diaSemana, horaInicio, horaTermino) {
    const { rows } = await pool.query(
        `insert into Turno (idVeterinario, idSede, diaSemana, horaInicio, horaTermino)
     values ($1, $2, $3, $4, $5)
     returning idTurno as "idTurno"`,
        [idVeterinario ?? null,
            idSede ?? null,
            diaSemana ?? null,
            horaInicio ?? null,
            horaTermino?? null
        ]
    );
    return rows[0]?.idTurno;
}

async function actualizarTurno(idTurno, idVeterinario, idSede, diaSemana, horaInicio, horaTermino) {
    const { rowCount } = await pool.query(
        `update Turno
         set idVeterinario = coalesce($1, idVeterinario),
             idSede = coalesce($2, idSede),
             diaSemana = coalesce($3, diaSemana),
             horaInicio = coalesce($4, horaInico),
             horaTermino = coalesce($5, horaTermino)
         where idTurno = $6`,
        [
            idVeterinario ?? null,
            idSede ?? null,
            diaSemana ?? null,
            horaInicio ?? null,
            horaTermino ?? null,
            idTurno
        ]
    );
    return rowCount > 0;
}
async function eliminarTurno(idTurno){
    const {rowCount} = await pool.query(
        `delete from Turno where idTurno = $1`,
        [idTurno]
    );
    return rowCount >0;
}
module.exports = {getTurnos, getTurnoPorId, getBloquesLibres, crearTurno, actualizarTurno, eliminarTurno};