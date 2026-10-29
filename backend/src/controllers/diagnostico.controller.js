const repo = require('../repositories/diagnostico.repository');

async function getDiagnosticos(req, res) {
    try {
        res.json(await repo.getDiagnosticos(req.query.idAtencion));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function getDiagnosticoById(req, res) {
    try {
        const diagnostico = await repo.getDiagnostico(req.params.id);
        if (!diagnostico) return res.status(404).json({ error: 'Diagnóstico no encontrado' });
        res.json(diagnostico);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function crearDiagnostico(req, res) {
    const { idAtencion, detalle } = req.body;
    if (!idAtencion || !detalle) {
        return res.status(400).json({ error: 'idAtencion y detalle son obligatorios' });
    }
    try {
        const diagnostico = await repo.crearDiagnostico(req.body);
        res.status(201).json(diagnostico);
    } catch (e) {
        console.error(e);
        if (e.code === '23503') return res.status(400).json({ error: 'La atención indicada no existe' });
        res.status(500).json({ error: 'Error interno' });
    }
}

async function actualizarDiagnostico(req, res) {
    if (!req.body.detalle) {
        return res.status(400).json({ error: 'detalle es obligatorio' });
    }
    try {
        const diagnostico = await repo.actualizarDiagnostico(req.params.id, req.body, req.usuario.idUsuario);
        if (!diagnostico) return res.status(404).json({ error: 'Diagnóstico no encontrado' });
        res.json(diagnostico);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function eliminarDiagnostico(req, res) {
    try {
        const eliminado = await repo.eliminarDiagnostico(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Diagnóstico no encontrado' });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        if (e.code === '23503') {
            return res.status(409).json({ error: 'No se puede eliminar: el diagnóstico tiene recetas o auditorías asociadas' });
        }
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = { getDiagnosticos, getDiagnosticoById, crearDiagnostico, actualizarDiagnostico, eliminarDiagnostico };
