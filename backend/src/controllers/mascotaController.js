const repo = require ('../repositories/mascotasRepository');
const filtroTutor = require ('../util/filtroTutor');

async function getMascotasPorTutor(req, res){
    try {
        res.jon(await repo.getMascotasPorTutor(filtroTutor(req)));
    } catch(e){
        console.error(e);
        res.status(500).json({ error: 'upsi dupsi'});
    }
}
async function getMascota(req, res){
    try{
        const mascota = await repo.getMascota(req.param.id, filtroTutor(req));
        if(!mascota) return res.status(404).json({ error: 'Mascota no encontrada!'});
        res.json(mascota);
    } catch(e){
        console.error(e);
        res.status(500).json({ error: 'Error interno upsi dupsi'})
    }
}
async function crear(req, res){
    try {
        const {nombre, idEspecie, anioNacimiento, peso} = req.body;
        if (!nombre || !idEspecie) return res.status(400).json({error: 'Nombre e idEspecie son OBLIGATORIOS!'})

        // Un tutor siempre crea mascotas a su nombre sino solo el admin indica el dueño en el body
        const idTutor = req.usuario.rol === 'TUTOR' ? req.usuario.idUsuario : req.body.idTutor;
        if (!idTutor) return res.status(400).json({error: 'idTutor es sumamente obligatorio!'})

        const id = await repo.crear({nombre, idTutor, idEspecie, anioNacimiento, peso});
        res.status(201).json(await repo.getMascota(id, null));
    } catch(e){
        console.error(e);
        if (e.code === '23503') return res.status(400).json({ error: 'El Tutor o la especie no existe'});
        res.status(500).json({ error: 'Error internooo'});
    }
}
async function actualizar(req, res){
    try{
        const { nombre, idEspecie} = req.body;
        if (!nombre || !idEspecie) return res.status(400).json({error: 'Nombre e idEspecie son OBLIGATORIOS!'})

        const ok = await repo.actualizarMascota(req.param.id, req.body, filtroTutor(req));
        if(!ok) return res.status(400).json({ error: 'Mascota no encontrada!'});
        res.json(await repo.getMascota(req.param.id, null));
    } catch (e){
        console.error(e);
        if(e.code === '23503') return res.status(400).json({ error: 'El Tutor o la especie no existe'});
        res.status(500).json({ error: 'Error internooo'});
    }
}
async function eliminar(req, res) {
    try {
        const ok = await repo.eliminar(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Mascota no encontrada' });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        if (e.code === '23503') return res.status(409).json({ error: 'No se puede eliminar: tiene atenciones clínicas asociadas' });
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = (getMascota, getMascotasPorTutor, crear, actualizar, eliminar);