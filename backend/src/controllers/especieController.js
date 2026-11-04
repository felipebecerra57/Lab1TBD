const repo = require('../repositories/especieRepository');

async function obtenerTodas(req, res){
    try{
        res.json(await repo.getEspecies());
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno'});
    }
}

async function obtener(req, res){
    try{
        const especie = await repo.getEspecie(req.params.id);
        if (!especie) return res.status(404).json( {error: 'Especie no encontrada'});
        res.json(especie)
    } catch (e){
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function crear(req, res){
    try {
        const especie = await repo.crearEspecie(req.body);
        res.status(201).json(especie);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function eliminar(req,res){
    try {
        const ok = await repo.eliminarEspecie(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Especie no encontrada' });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        if (e.code === '23503') return res.status(409).json({ error: 'No se puede eliminar: tiene atenciones mascotas asociadas' });
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = {obtenerTodas, obtener, crear, eliminar};