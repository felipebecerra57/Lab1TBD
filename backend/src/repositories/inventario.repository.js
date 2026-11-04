const pool = require('../config/db');

const columnas = `sede AS "idSede", idMedicamento AS "idMedicamento", cantidad`;
const columnasDetalle = `i.sede AS "idSede", s.nombre AS "nombreSede", i.idMedicamento AS "idMedicamento",
    m.nombre AS "nombreMedicamento", m.tipo AS "tipoMedicamento", i.cantidad`;

async function getInventarios(idSede = null, idMedicamento = null) {
    const { rows } = await pool.query(
        `select ${columnasDetalle}
         from Inventario i
                  join Medicamento m on i.idMedicamento = m.idMedicamento
                  join Sede s on i.sede = s.idSede
         where ($1::int is null or i.sede = $1)
           and ($2::int is null or i.idMedicamento = $2)
         order by s.nombre asc, m.nombre asc`,
        [idSede, idMedicamento]
    );
    return rows;
}

async function getInventarioPorId(sede, idMedicamento) {
    const { rows } = await pool.query(
        `select ${columnasDetalle}
         from Inventario i
         join Medicamento m on i.idMedicamento = m.idMedicamento
         join Sede s on i.sede = s.idSede
         where i.sede = $1
           and i.idMedicamento = $2`,
        [idSede, idMedicamento]
    );
    return rows[0] || null;
}

async function crearInventario(idSede, idMedicamento, cantidad) {
    const { rows } = await pool.query(
        `insert into Inventario (sede, idMedicamento, cantidad)
         values ($1, $2, $3)
             returning sede as "idSede", idMedicamento as "idMedicamento", cantidad`,
        [idSede ?? null, idMedicamento ?? null, cantidad ?? null]
    );
    return rows[0];
}

async function actualizarInventario(idSede, idMedicamento, cantidad) {
    const { rowCount } = await pool.query(
        `update Inventario
         set cantidad = coalesce($3, cantidad)
         where sede = $1
           and idMedicamento = $2`,
        [idSede, idMedicamento, cantidad ?? null]
    );
    return rowCount > 0;
}
async function eliminarInventario(idSede, idMedicamento) {
    const { rowCount } = await pool.query(
        `delete from Inventario
         where sede = $1
           and idMedicamento = $2`,
        [idSede, idMedicamento]
    );
    return rowCount > 0;
}

module.exports = {getInventarios, getInventarioPorId, crearInventario, actualizarInventario, eliminarInventario};