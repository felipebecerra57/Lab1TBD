const repo = require('../repositories/principioActRepository');
const {idValido} = require('../util/validar');

async function listar(req, res) {
    try {
        res.json(await repo.getPrincipios());
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function obtener(req, res) {
    try {
        if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
        const principio = await repo.getPrincipio(req.params.id);
        if (!principio) return res.status(404).json({ error: 'Principio activo no encontrado' });
        res.json(principio);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}
// Devuelve el nombre limpio (sin espacios sobrantes) o null si no es válido
function nombreLimpio(body) {
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
    return nombre === '' ? null : nombre;
}

async function crear(req, res) {
    try {
        const nombre = nombreLimpio(req.body);
        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
        res.status(201).json(await repo.crear({ nombre }));
    } catch (e) {
        console.error(e);
        if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un principio activo con ese nombre' });
        res.status(500).json({ error: 'Error interno' });
    }
}

async function eliminar(req, res) {
    try {
        if (!idValido(req.params.id)) return res.status(400).json({ error: 'ID inválido' });
        const ok = await repo.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Principio activo no encontrado' });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        // 23503: lo usa algún medicamento o alguna alergia registrada
        if (e.code === '23503') return res.status(409).json({ error: 'No se puede eliminar: está asociado a medicamentos o alergias' });
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = { listar, obtener, crear, eliminar };

