const pool = require('../config/db');

const COLUMNAS = `ac.idAtencion AS "idAtencion", ac.idFicha AS "idFicha", fc.idMascota AS "idMascota",
                  ac.idVeterinario AS "idVeterinario", ac.idCita AS "idCita", ac.cerrada, ac.fecha,
                  ac.motivoConsulta AS "motivoConsulta", ac.peso, ac.tratamientoGeneral AS "tratamientoGeneral"`;

const FROM = `from AtencionClinica ac join FichaClinica fc on fc.idFicha = ac.idFicha`;

// listar atenciones (opcionalmente de una mascota)
async function getAtenciones(idMascota) {
    const { rows } = await pool.query(
        `select ${COLUMNAS} ${FROM}
         where ($1::int is null or fc.idMascota = $1)
         order by ac.fecha desc`,
        [idMascota ?? null]
    );
    return rows;
}

// buscar una atención con sus diagnósticos y recetas
async function getAtencion(id) {
    const { rows } = await pool.query(`select ${COLUMNAS} ${FROM} where ac.idAtencion = $1`, [id]);
    const atencion = rows[0];
    if (!atencion) return undefined;

    const diagnosticos = await pool.query(
        `select idDiagnostico AS "idDiagnostico", nombre, detalle
         from Diagnostico where idAtencion = $1 order by idDiagnostico`,
        [id]
    );
    const recetas = await pool.query(
        `select r.idDiagnostico AS "idDiagnostico", r.idMedicamento AS "idMedicamento", m.nombre AS "medicamento",
                r.cantidad, r.dosis, r.duracionMeses AS "duracionMeses"
         from Receta r
         join Diagnostico d on d.idDiagnostico = r.idDiagnostico
         join Medicamento m on m.idMedicamento = r.idMedicamento
         where d.idAtencion = $1`,
        [id]
    );
    atencion.diagnosticos = diagnosticos.rows.map(d => ({
        ...d,
        recetas: recetas.rows.filter(r => r.idDiagnostico === d.idDiagnostico)
    }));
    return atencion;
}

// Tarea 3: registra la atención completa llamando al procedimiento almacenado
// (crea atención + diagnóstico + recetas y descuenta el inventario, todo o nada)
async function registrarAtencion(datos, idVeterinario) {
    const meds = datos.medicamentos || [];
    const client = await pool.connect();
    try {
        await client.query(
            `call prd_registrar_atencion($1, $2, $3, $4, $5, $6, $7, $8, $9,
                                         $10::int[], $11::int[], $12::smallint[], $13::smallint[])`,
            [
                datos.idMascota,
                idVeterinario,
                datos.idSede ?? null,
                datos.idCita ?? null,
                datos.motivoConsulta,
                datos.peso ?? null,
                datos.tratamientoGeneral ?? null,
                datos.diagnostico.nombre ?? null,
                datos.diagnostico.detalle,
                meds.map(m => m.idMedicamento),
                meds.map(m => m.cantidad),
                meds.map(m => m.dosis ?? null),
                meds.map(m => m.duracionMeses ?? null)
            ]
        );
        // id de la atención recién creada en esta misma conexión
        const { rows } = await client.query(
            `select currval(pg_get_serial_sequence('atencionclinica', 'idatencion')) AS id`
        );
        return Number(rows[0].id);
    } finally {
        client.release();
    }
}

// editar datos generales (solo si la atención no está cerrada)
async function actualizarAtencion(id, { motivoConsulta, peso, tratamientoGeneral }) {
    const { rows } = await pool.query(
        `update AtencionClinica
         set motivoConsulta = $1, peso = $2, tratamientoGeneral = $3
         where idAtencion = $4 and cerrada = false
         returning idAtencion`,
        [motivoConsulta, peso ?? null, tratamientoGeneral ?? null, id]
    );
    return rows[0];
}

// cerrar la atención (desde aquí los cambios a sus diagnósticos quedan auditados)
async function cerrarAtencion(id) {
    const { rows } = await pool.query(
        `update AtencionClinica set cerrada = true where idAtencion = $1 returning idAtencion`,
        [id]
    );
    return rows[0];
}

module.exports = { getAtenciones, getAtencion, registrarAtencion, actualizarAtencion, cerrarAtencion };
