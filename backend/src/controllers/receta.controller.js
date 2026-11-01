const repo = require('../repositories/receta.repository');

// Traduce los errores de la base de datos a respuestas claras
function manejarError(e, res) {
    console.error(e);
    if (e.code === 'P0001') return res.status(400).json({ error: e.message }); // trigger de alergias
    if (e.code === '23505') return res.status(409).json({ error: 'Ese medicamento ya está recetado en este diagnóstico' });
    if (e.code === '23503') return res.status(400).json({ error: 'El diagnóstico o el medicamento no existe' });
    if (e.code === '23514') return res.status(400).json({ error: 'La cantidad debe ser mayor que 0' });
    res.status(500).json({ error: 'Error interno' });
}

async function getRecetas(req, res) {
    try {
        res.json(await repo.getRecetas(req.query.idDiagnostico));
    } catch (e) {
        manejarError(e, res);
    }
}

async function getReceta(req, res) {
    try {
        const receta = await repo.getReceta(req.params.idDiagnostico, req.params.idMedicamento);
        if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
        res.json(receta);
    } catch (e) {
        manejarError(e, res);
    }
}

async function crearReceta(req, res) {
    const { idDiagnostico, idMedicamento, cantidad } = req.body;
    if (!idDiagnostico || !idMedicamento || !cantidad) {
        return res.status(400).json({ error: 'idDiagnostico, idMedicamento y cantidad son obligatorios' });
    }
    try {
        res.status(201).json(await repo.crearReceta(req.body));
    } catch (e) {
        manejarError(e, res);
    }
}

async function actualizarReceta(req, res) {
    if (!req.body.cantidad) {
        return res.status(400).json({ error: 'cantidad es obligatoria' });
    }
    try {
        const receta = await repo.actualizarReceta(req.params.idDiagnostico, req.params.idMedicamento, req.body);
        if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });
        res.json(receta);
    } catch (e) {
        manejarError(e, res);
    }
}

async function eliminarReceta(req, res) {
    try {
        const eliminada = await repo.eliminarReceta(req.params.idDiagnostico, req.params.idMedicamento);
        if (!eliminada) return res.status(404).json({ error: 'Receta no encontrada' });
        res.status(204).send();
    } catch (e) {
        manejarError(e, res);
    }
}

module.exports = { getRecetas, getReceta, crearReceta, actualizarReceta, eliminarReceta };
