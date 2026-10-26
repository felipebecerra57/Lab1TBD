const pool = require('../config/db');

const COLUMNAS = `idSede AS "idSede", nombre, calle, numero, comuna, telefono, idAdmin AS "idAdmin"`;

// listar sedes
async function getSedes() {
    const { rows } = await pool.query(`select ${COLUMNAS} from Sede order by idSede`);
    return rows;
}

// buscar por id
async function getSede(id) {
    const { rows } = await pool.query(`select ${COLUMNAS} from Sede where idSede = $1`, [id]);
    return rows[0];
}

// crear nueva sede
async function crearSede({ nombre, calle, numero, comuna, telefono, idAdmin }) {
    const { rows } = await pool.query(
        `insert into Sede (nombre, calle, numero, comuna, telefono, idAdmin)
         values ($1, $2, $3, $4, $5, $6)
             returning ${COLUMNAS}`,
        [nombre, calle, numero, comuna, telefono, idAdmin ?? null]
    );
    return rows[0];
}

async function actualizarSede(req, res) {
    try {
        const sede = await repo.actualizar(req.params.id, req.body);
        if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
        res.json(sede);
    } catch (e) {
        console.error(e);
        if (e.code === '23503') return res.status(400).json({ error: 'El administrador indicado no existe' });
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = { getSedes, getSede, crearSede, actualizarSede};