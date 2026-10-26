const repo = require('../repositories/sede.repository');

async function getSedes(req, res) {
    try {
        res.json(await repo.getSedes());
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function getSedeById(req, res) {
    try {
        const sede = await repo.getSede(req.params.id);
        if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
        res.json(sede);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function crearSede(req, res) {
    try {
        const sede = await repo.crearSede(req.body);
        res.status(201).json(sede);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function actualizarSede(id, { nombre, calle, numero, comuna, telefono, idAdmin }) {
    const { rows } = await pool.query(
        `UPDATE Sede
     SET nombre = $1, calle = $2, numero = $3, comuna = $4, telefono = $5, idAdmin = $6
     WHERE idSede = $7
     RETURNING ${COLUMNAS}`,
        [nombre, calle, numero, comuna, telefono, idAdmin ?? null, id]
    );
    return rows[0];
}
module.exports = { getSedes, getSedeById, crearSede, actualizarSede};