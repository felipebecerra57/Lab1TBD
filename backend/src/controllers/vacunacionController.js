const repo = require('../repositories/vacunacionRepository');
const mascotaRepo = require('../repositories/mascotasRepository');
const vacunaRepo = require('../repositories/vacunaRepository');
const sedeRepo = require('../repositories/sede.repository');
// REVISAR ESTO LUEGOOOO, confirmar ruta cuando exista ------------------------------------------------------------------------------------------- aquíiii-----
const veterinarioRepo = require('../repositories/usuario.repository.js');
const filtroTutor = require('../util/filtroTutor');
const { idValido } = require('../util/validar');


const modalidades = ['SEDE','DOMICILIO'];

async function aplicarPlan(req,res){
    try{
        const idMascota = req.params.id;
        const { idVacuna, idSede, fechaInicio, direccionDomicilio } = req.body;
        const modalidad = req.body.modalidad ?? 'SEDE';

        if (!idValido(idMascota) || !idValido(idVacuna) || !idValido(idSede))
            return res.status(400).json({ error: 'idMascota, idVacuna e idSede son obligatorios y deben ser válidos' });

        // revisar crud vet: esto asume que el idVet = idUsuario del token
        // vet -> Empleado -> usuario comparten id. El crud tiene que respetar esa regla
        const idVeterinario = req.usuario.rol === 'VET' ? req.usuario.idUsuario : req.body.idVeterinario;
        if(!idValido(idVeterinario))
            return res.status(400).json({ error: 'idVeterinario es obligatorio' });

        if(!modalidades.includes(modalidad))
            return res.status(400).json({ error: `modalidad debe ser: ${MODALIDADES.join(' o ')}` });
        if (modalidad === 'DOMICILIO' && !direccionDomicilio)
            return res.status(400).json({ error: 'Una cita a domicilio debe incluir dirección'});
        if (fechaInicio && isNaN(new Date(fechaInicio)))
            return res.status(404).json({ error: 'fechaInicio no es una fecha válida' });

        const mascota = await mascotaRepo.getMascota(idMascota, null);
        if(!mascota) return res.status(404).json({error: 'Mascota no encontrada'});

        const vacuna = await vacunaRepo.getVacuna(idVacuna);
        if(!vacuna) return res.status(404).json({ error: 'Vacuna no encontrada'});

        if (vacuna.totalDosis > 1 && !vacuna.intervaloDias)
            return res.status(404).json({ error: 'La vacuna requiere refuerzos pero no tiene intervaloDias configurado' });

        const sede = await sedeRepo.getSede(idSede);
        if(!sede) return res.status(404).json({ error: 'Sede no encontrada'});

        // REVISAR CRUD-VETERINARIO: confirmar que existe veterinarioRepo.getVeterinario(id), que devuelve
        // undefined si no existe, y los nombres de los campos que devuelve ------------------------------------------------------------------------------------------- aquíiii-----
        const veterinario = await veterinarioRepo.obtenerVeterinarioPorId(idVeterinario);
        if (!veterinario) return res.status(404).json({ error: 'Veterinario no encontrado' });

        await repo.aplicarPlan({ idMascota, idVacuna, idVeterinario, idSede, fechaInicio, modalidad, direccionDomicilio });
        res.status(201).json({
            mensaje: 'Plan de vacunación activado',
            citasRefuerzoAgendadas: vacuna.totalDosis - 1,
            vacunacion: await repo.listarPorMascota(idMascota, idVacuna)
        });
    } catch (e){
        console.error(e);
        if (e.code === '23505') return res.status(409).json({ error: 'La mascota ya tiene iniciado el plan de esta vacuna' });
        if (e.code === 'P0001') return res.status(400).json({ error: e.message }); // RAISE EXCEPTION del procedimiento
        res.status(500).json({ error: 'Error interno' });
    }
}

// historial de vacunación. El tutor solo ve sus mascotas
async function getPorMascota(req,res){
    try{
        if(!idValido(req.params.id)) return res.status(400).json({ error: 'ID no válido' });
        const mascota = await mascotaRepo.getMascota(req.params.id, filtroTutor(req));
        if(!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });
        res.json(await repo.listarPorMascota(req.params.id, null));
    } catch(e){
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

// Mascotas con vacunas vencidas o que vencen en los próximos 30 días
async function listarPendientes(req, res) {
    try {
        const dias = req.query.dias === undefined ? 30 : Number(req.query.dias);
        if (!Number.isInteger(dias) || dias < 0 || dias > 365)
            return res.status(400).json({ error: 'dias debe ser un entero entre 0 y 365' });

        // El tutor solo ve las suyas; VET y ADMIN ven todas
        res.json(await repo.listarPendientes(dias, filtroTutor(req)));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = { aplicarPlan, getPorMascota, listarPendientes};



















