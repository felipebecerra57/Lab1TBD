const pool = require('../config/db');

const columnas = `idMedicamento AS "idMedicamento", nombre, tipo`;

async function getMedicamentos(nombre = null, tipo = null){
    const {rows} = await pool.query(
        `select ${columnas}
        from Medicamento m
        where ($1::text is null or m.nombre ilike '%' || $1 || '%')
        and ($2::text is null or m.tipo = $2)
        order by m.nombre, m.tipo asc`,
        [nombre ?? null, tipo ?? null]
    );
    return rows;
}

async function getMedicamentoPorId(idMedicamento){
    const {rows} = await pool.query(
        `select ${columnas} 
        from Medicamento
        where idMedicamento = $1`,
        [idMedicamento]
    );
    return rows[0];
}


async function crearMedicamento(nombre, tipo) {
    const { rows } = await pool.query(
        `insert into Medicamento (nombre, tipo)
     values ($1, $2)
     returning idMedicamento as "idMedicamento"`,
        [nombre ?? null, tipo ?? null]
    );
    return rows[0]?.idMedicamento;
}

async function actualizarMedicamento(idMedicamento, nombre, tipo) {
    const { rowCount } = await pool.query(
        `update Medicamento
         set nombre = coalesce($1, nombre),
             tipo = coalesce($2, tipo)
         where idMedicamento = $3`,
        [
            nombre ?? null,
            tipo ?? null,
            idMedicamento
        ]
    );
    return rowCount > 0;
}
async function eliminarMedicamento(idMedicamento){
    const {rowCount} = await pool.query(
        `delete from Medicamento where idMedicamento = $1`,
        [idMedicamento]
    );
    return rowCount >0;
}

async function getPrincipiosActivosDeMedicamento(idMedicamento) {
    const { rows } = await pool.query(
        `select pa.idPrincipioActivo AS "idPrincipioActivo", pa.nombre
         from MedCompone mc
         join PrincipioActivo pa on mc.idPrincipioActivo = pa.idPrincipioActivo
         where mc.idMedicamento = $1
         order by pa.nombre asc`,
    [idMedicamento]
);
    return rows;
}

async function agregarPrincipioActivoAMedicamento(idMedicamento, idPrincipioActivo) {
    const { rows } = await pool.query(
        `insert into MedCompone (idMedicamento, idPrincipioActivo)
         values ($1, $2)
         returning idMedicamento as "idMedicamento", idPrincipioActivo as "idPrincipioActivo"`,
    [idMedicamento, idPrincipioActivo]
);
    return rows[0];
}

async function quitarPrincipioActivoDeMedicamento(idMedicamento, idPrincipioActivo) {
    const { rowCount } = await pool.query(
        `delete from MedCompone
         where idMedicamento = $1
           and idPrincipioActivo = $2`,
    [idMedicamento, idPrincipioActivo]
);
    return rowCount > 0;
}
module.exports = {getMedicamentos, getMedicamentoPorId, crearMedicamento, actualizarMedicamento, eliminarMedicamento,
    getPrincipiosActivosDeMedicamento, agregarPrincipioActivoAMedicamento, quitarPrincipioActivoDeMedicamento};
