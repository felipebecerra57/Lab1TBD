const repo = require('../repositories/atencion.repository');

// Traduce los errores de la base de datos a respuestas claras
function manejarError(e, res) {
    console.error(e);
    // errores lanzados por el procedimiento o el trigger (RAISE EXCEPTION): stock, alergias, etc.
    if (e.code === 'P0001') return res.status(400).json({ error: e.message });
    if (e.code === '23502') return res.status(400).json({ error: 'La mascota no tiene ficha clínica o faltan datos obligatorios' });
    if (e.code === '23503') return res.status(400).json({ error: 'La mascota, cita o medicamento indicado no existe' });
    if (e.code === '23514') return res.status(400).json({ error: 'Las cantidades deben ser mayores que 0' });
    res.status(500).json({ error: 'Error interno' });
}

async function getAtenciones(req, res) {
    try {
        res.json(await repo.getAtenciones(req.query.idMascota));
    } catch (e) {
        manejarError(e, res);
    }
}

async function getAtencion(req, res) {
    try {
        const atencion = await repo.getAtencion(req.params.id);
        if (!atencion) return res.status(404).json({ error: 'Atención no encontrada' });
        res.json(atencion);
    } catch (e) {
        manejarError(e, res);
    }
}

async function registrarAtencion(req, res) {
    const { idMascota, idSede, idCita, motivoConsulta, diagnostico } = req.body;
    if (!idMascota || !motivoConsulta || !diagnostico || !diagnostico.detalle) {
        return res.status(400).json({ error: 'idMascota, motivoConsulta y diagnostico.detalle son obligatorios' });
    }
    if (!idSede && !idCita) {
        return res.status(400).json({ error: 'Debe indicar idSede o idCita' });
    }
    try {
        const idVet = req.usuario.idVeterinario || req.usuario.idUsuario || req.usuario.id;

        // Normalizamos los datos antes de enviarlos al repository
        const datos = {
            ...req.body,
            idMascota: Number(idMascota),
            idSede: idSede ? Number(idSede) : null,
            idCita: idCita ? Number(idCita) : null, // Convierte "" o falsy a null, o a Number si viene valor
            peso: req.body.peso ? Number(req.body.peso) : null
        };
        // el veterinario es el usuario logueado
        const idAtencion = await repo.registrarAtencion(datos, Number(idVet));
        res.status(201).json(await repo.getAtencion(idAtencion));
    } catch (e) {
        manejarError(e, res);
    }
}

async function actualizarAtencion(req, res) {
    if (!req.body.motivoConsulta) {
        return res.status(400).json({ error: 'motivoConsulta es obligatorio' });
    }
    try {
        const actualizada = await repo.actualizarAtencion(req.params.id, req.body);
        if (!actualizada) return res.status(404).json({ error: 'Atención no encontrada o ya cerrada' });
        res.json(await repo.getAtencion(req.params.id));
    } catch (e) {
        manejarError(e, res);
    }
}

async function cerrarAtencion(req, res) {
    try {
        const cerrada = await repo.cerrarAtencion(req.params.id);
        if (!cerrada) return res.status(404).json({ error: 'Atención no encontrada' });
        res.json(await repo.getAtencion(req.params.id));
    } catch (e) {
        manejarError(e, res);
    }
}

module.exports = { getAtenciones, getAtencion, registrarAtencion, actualizarAtencion, cerrarAtencion };
