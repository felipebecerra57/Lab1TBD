const repo = require('../repositories/alergiaRepository');
const mascotaRepo = require('../repositories/mascotasRepository');
const filtroTutor = require('../util/filtroTutor');
const { idValido } = require('../util/validar');


const SEVERIDADES = ['LEVE', 'MODERADA', 'GRAVE'];

async function listar(req, res) {
    try {
        res.json(await repo.getAlergias(filtroTutor(req)));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function listarPorMascota(req, res) {
    try {
        if (!idValido(req.params.idMascota)) return res.status(400).json({ error: 'ID inválido' });

        // Primero se comprueba que la mascota exista y sea del tutor; si no, 404
        const mascota = await mascotaRepo.getMascota(req.params.idMascota, filtroTutor(req));
        if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });

        res.json(await repo.getPorMascota(req.params.idMascota));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function crear(req, res) {
    try {
        const { idMascota, idPrincipioActivo, severidad } = req.body;
        if (!idValido(idMascota) || !idValido(idPrincipioActivo))
            return res.status(400).json({ error: 'idMascota e idPrincipioActivo son obligatorios' });
        if (severidad && !SEVERIDADES.includes(severidad))
            return res.status(400).json({ error: `severidad debe ser una de: ${SEVERIDADES.join(', ')}` });

        await repo.crear({ idMascota, idPrincipioActivo, severidad });
        res.status(201).json(await repo.obtener(idMascota, idPrincipioActivo));
    } catch (e) {
        console.error(e);
        if (e.code === '23505') return res.status(409).json({ error: 'La mascota ya tiene registrada esta alergia' });
        if (e.code === '23503') return res.status(400).json({ error: 'La mascota o el principio activo no existe' });
        res.status(500).json({ error: 'Error interno' });
    }
}

async function actualizar(req, res) {
    try {
        const { idMascota, idPrincipio } = req.params;
        if (!idValido(idMascota) || !idValido(idPrincipio)) return res.status(400).json({ error: 'ID inválido' });
        if (!SEVERIDADES.includes(req.body.severidad))
            return res.status(400).json({ error: `severidad debe ser una de: ${SEVERIDADES.join(', ')}` });

        const ok = await repo.actualizar(idMascota, idPrincipio, req.body);
        if (!ok) return res.status(404).json({ error: 'Alergia no encontrada' });
        res.json(await repo.obtener(idMascota, idPrincipio));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function eliminar(req, res) {
    try {
        const { idMascota, idPrincipio } = req.params;
        if (!idValido(idMascota) || !idValido(idPrincipio)) return res.status(400).json({ error: 'ID inválido' });

        const ok = await repo.eliminar(idMascota, idPrincipio);
        if (!ok) return res.status(404).json({ error: 'Alergia no encontrada' });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = { listar, listarPorMascota, crear, actualizar, eliminar };
