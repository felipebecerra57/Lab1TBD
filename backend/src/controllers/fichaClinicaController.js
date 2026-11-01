const repo = require('../repositories/fichaClinicaRepository');
const filtroTutor = require('../util/filtroTutor');

async function getFichas(req, res){
    try{
        res.json(await repo.getFichasPorTutor(filtroTutor(req)));
    }catch (e){
        console.error(e);
        res.status(500).json({ error: 'Error interno'});
    }
}

async function obtener(req, res) {
    try {
        const ficha = await repo.getPorId(req.params.id, filtroTutor(req));
        if (!ficha) return res.status(404).json({ error: 'Ficha no encontrada' });
        res.json(ficha);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function getFicha(req, res){
    try{
        const ficha = await repo.getFichaPorMascota(req.params.idMascota, filtroTutor(req));
        if(!ficha) return res.status(404).json({ error: 'Ficha no encontrada'});
        res.status(ficha);
    }catch (e){
        console.error(e);
        res.status(500).json({ error: 'Error interno'});
    }
}

async function crear(req, res){
    try{
        if (!req.body.idMascota) return res.status(404).json({ error: 'idMascota es obligatorio'});
        const id = await repo.crearFichaClinica(req.body);
        res.status(201).json( await repo.getFichaPorMascota(id, null));
    } catch (e){
        console.error(e);
        if (e.code === '23505') return res.status(409).json({ error: 'La mascota ya tiene ficha clínica' });
        if (e.code === '23503') return res.status(400).json({ error: 'La mascota no existe' });
        res.status(500).json({ error: 'Error interno'});
    }
}

async function actualizar(req, res){
    try{
        const ok = await repo.actualizarFichaClinica(req.params.id, req.body);
        if(!ok) return res.status(404).json({ error: 'Ficha no encontrada'});
        res.json( await repo.getPorId(req.params.id, null));
    }catch (e){
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function eliminar(req, res) {
    try {
        const ok = await repo.eliminarFichaClinica(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Ficha no encontrada' });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        if (e.code === '23503') return res.status(409).json({ error: 'No se puede eliminar: tiene atenciones clínicas asociadas' });
        res.status(500).json({ error: 'Error interno' });
    }
}


module.exports = (getFicha, getFichas, crear, actualizar, eliminar, obtener);














