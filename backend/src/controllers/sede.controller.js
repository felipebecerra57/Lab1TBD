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

async function actualizarSede(req, res) {
    try {
        const sede = await repo.actualizarSede(req.params.id, req.body);
        if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
        res.json(sede);
    } catch (e) {
        console.error(e);
        if (e.code === '23503') return res.status(400).json({ error: 'El administrador indicado no existe' });
        res.status(500).json({ error: 'Error interno' });
    }
}
module.exports = { getSedes, getSedeById, crearSede, actualizarSede};