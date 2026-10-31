const citaMedicaRepository = require('../repositories/citaMedica.repository');

async function getCitas(req, res) {
    try {
        const { idVeterinario, idSede } = req.query;
        const citas = await citaRepo.getCitas(
            idVeterinario ? Number(idVeterinario) : null,
            idSede ? Number(idSede) : null
        );
        return res.status(200).json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getCitasPorMascota(req, res) {
    try {
        const { idMascota } = req.params;

        if (!idMascota) {
            return res.status(400).json({ error: 'El id de la mascota es requerido' });
        }

        const citas = await citaMedicaRepository.getCitasPorMascota(idMascota);
        return res.status(200).json(citas);
    } catch (error) {
        console.error('Error al obtener citas por mascota:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function crearCita(req, res) {
    try {
        const {fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin} = req.body;

        if (!fecha || !idVeterinario || !idMascota || !idSede) {
            return res.status(400).json({
                error: 'Los campos fecha, idVeterinario, idMascota e idSede son obligatorios',
            });
        }

        if (modalidad === 'DOMICILIO' && !direccionDomicilio) {
            return res.status(400).json({
                error: 'Para la modalidad DOMICILIO es obligatorio indicar direccionDomicilio',
            });
        }

        const idCita = await citaRepo.crearCita(fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin);

        return res.status(201).json({ mensaje: 'Cita creada exitosamente', idCita });
    } catch (error) {
        console.error('Error al crear la cita:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear la cita' });
    }
}

module.exports = {getCitas, getCitasPorMascota, crearCita};