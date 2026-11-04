const pool = require('../config/db');

async function aplicarPlan({ idMascota, idVacuna, idVeterinario, idSede, fechaInicio, modalidad, direccionDomicilio }){
    await pool.query(
        `CALL prc_aplicar_plan_vacunacion(
       $1::int, $2::int, $3::int, $4::int,
       COALESCE($5::timestamp, LOCALTIMESTAMP),
       $6::varchar, $7::varchar)`,
        [idMascota, idVacuna, idVeterinario, idSede, fechaInicio ?? null, modalidad, direccionDomicilio ?? null]
    );
}

async function listarPorMascota(idMascota, idVacuna){
    const {rows} = await pool.query(
        ` SELECT v.idVacuna AS "idVacuna", v.nombreV AS "vacuna",
            vc.numeroDosis AS "numeroDosis", vc.fechaAplicacion::text AS "fechaAplicacion",
            vc.fechaProximaDosis::text AS "fechaProximaDosis" 
        from Vacunacion vc join Vacuna v on vc.idVacuna = v.idVacuna
        where vc.idMascota = $1 and ($2::int is null or vc.idVacuna = $2)
        order by v.nombreV, vc.numeroDosis`,
        [ idMascota, idVacuna ?? null]
    );
    return rows;
}

// listar vacunas vencidad o por vencer
async function listarPendientes(dias, idTutor) {
    const { rows } = await pool.query(
        `WITH ultima_dosis AS (
       SELECT DISTINCT ON (vc.idMascota, vc.idVacuna)
              vc.idMascota, vc.idVacuna, vc.numeroDosis,
              vc.fechaAplicacion, vc.fechaProximaDosis
       FROM Vacunacion vc
       WHERE vc.fechaAplicacion IS NOT NULL
       ORDER BY vc.idMascota, vc.idVacuna, vc.numeroDosis DESC
     )
     SELECT m.idMascota AS "idMascota", m.nombre AS "mascota", es.tipo AS "especie",
            m.idTutor AS "idTutor", u.email AS "emailTutor", t.telefono AS "telefonoTutor",
            v.idVacuna AS "idVacuna", v.nombreV AS "vacuna",
            ud.numeroDosis AS "ultimaDosis", v.totalDosis AS "totalDosis",
            ud.fechaAplicacion::text AS "fechaUltimaDosis",
            ud.fechaProximaDosis::text AS "fechaProximaDosis",
            (ud.fechaProximaDosis - CURRENT_DATE) AS "diasRestantes",
            CASE WHEN ud.fechaProximaDosis < CURRENT_DATE
                 THEN 'VENCIDA' ELSE 'POR_VENCER' END AS "estado"
     FROM ultima_dosis ud
     JOIN Mascota m  ON m.idMascota = ud.idMascota
     JOIN Especie es ON es.idEspecie = m.idEspecie
     JOIN Tutor t    ON t.idTutor = m.idTutor
     JOIN Usuario u  ON u.idUsuario = t.idTutor
     JOIN Vacuna v   ON v.idVacuna = ud.idVacuna
     WHERE ud.fechaProximaDosis IS NOT NULL
       AND ud.fechaProximaDosis <= CURRENT_DATE + $1::int
       AND ($2::int IS NULL OR m.idTutor = $2)
     ORDER BY ud.fechaProximaDosis, m.nombre`,
        [dias, idTutor]
    );
    return rows;
}

module.exports = { aplicarPlan, listarPorMascota, listarPendientes};
