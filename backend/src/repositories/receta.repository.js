const pool = require('../config/db');

const COLUMNAS = `r.idDiagnostico AS "idDiagnostico", r.idMedicamento AS "idMedicamento",
                  m.nombre AS "medicamento", r.cantidad, r.dosis, r.duracionMeses AS "duracionMeses"`;

// listar recetas (opcionalmente filtradas por diagnóstico)
async function getRecetas(idDiagnostico) {
    const { rows } = await pool.query(
        `select ${COLUMNAS}
         from Receta r join Medicamento m on m.idMedicamento = r.idMedicamento
         where ($1::int is null or r.idDiagnostico = $1)
         order by r.idDiagnostico, r.idMedicamento`,
        [idDiagnostico ?? null]
    );
    return rows;
}

// buscar una receta (llave compuesta: diagnóstico + medicamento)
async function getReceta(idDiagnostico, idMedicamento) {
    const { rows } = await pool.query(
        `select ${COLUMNAS}
         from Receta r join Medicamento m on m.idMedicamento = r.idMedicamento
         where r.idDiagnostico = $1 and r.idMedicamento = $2`,
        [idDiagnostico, idMedicamento]
    );
    return rows[0];
}

// crear receta (el trigger de alergias la rechaza si la mascota es alérgica)
async function crearReceta({ idDiagnostico, idMedicamento, cantidad, dosis, duracionMeses }) {
    await pool.query(
        `insert into Receta (idDiagnostico, idMedicamento, cantidad, dosis, duracionMeses)
         values ($1, $2, $3, $4, $5)`,
        [idDiagnostico, idMedicamento, cantidad, dosis ?? null, duracionMeses ?? null]
    );
    return getReceta(idDiagnostico, idMedicamento);
}

// actualizar cantidad, dosis y duración
async function actualizarReceta(idDiagnostico, idMedicamento, { cantidad, dosis, duracionMeses }) {
    const { rowCount } = await pool.query(
        `update Receta
         set cantidad = $1, dosis = $2, duracionMeses = $3
         where idDiagnostico = $4 and idMedicamento = $5`,
        [cantidad, dosis ?? null, duracionMeses ?? null, idDiagnostico, idMedicamento]
    );
    if (rowCount === 0) return undefined;
    return getReceta(idDiagnostico, idMedicamento);
}

// eliminar receta
async function eliminarReceta(idDiagnostico, idMedicamento) {
    const { rowCount } = await pool.query(
        `delete from Receta where idDiagnostico = $1 and idMedicamento = $2`,
        [idDiagnostico, idMedicamento]
    );
    return rowCount > 0;
}

module.exports = { getRecetas, getReceta, crearReceta, actualizarReceta, eliminarReceta };
