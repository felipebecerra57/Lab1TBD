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
        const { idMascota } = req.param;

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

        const idCita = await citaMedicaRepository.crearCita(fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin);

        return res.status(201).json({ mensaje: 'Cita creada exitosamente', idCita });
    } catch (error) {
        console.error('Error al crear la cita:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear la cita' });
    }
}

async function actualizarCita(req, res) {
    try {
        const { idCita } = req.params;
        const id = Number(idCita);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idCita debe ser un número válido' });
        }
        const {fecha, idVeterinario, idMascota, idSede, estado, modalidad, direccionDomicilio, duracionMin} = req.body;

        const actualizada = await citaMedicaRepository.actualizarCita(
            Number(idCita),
            fecha,
            idVeterinario,
            idMascota,
            idSede,
            estado, // agregar logica de notificacion por cancelacion de cita
            modalidad,
            direccionDomicilio,
            duracionMin
        );

        if (!actualizada) {
            return res.status(404).json({ error: 'Cita médica no encontrada' });
        }

        return res.status(200).json({ mensaje: 'Cita actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la cita:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar la cita' });
    }
}

async function eliminarCita(req, res) {
    try {
        const { idCita } = req.params;
        const id = Number(idCita);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idCita debe ser un número válido' });
        }

        const cita = await citaMedicaRepository.getCitaPorId(id);

        if (!cita) {
            return res.status(404).json({ error: 'Cita médica no encontrada' });
        }

        if (cita.estado === 'PROGRAMADA') {
            return res.status(400).json({
                error: 'No se puede eliminar una cita en estado PROGRAMADA. Debe cancelarla primero.'
        });
        }

        await citaMedicaRepository.eliminarCita(id);

        return res.status(200).json({ mensaje: 'Cita eliminada de la base de datos exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la cita:', error);
        return res.status(500).json({ error: 'Error interno del servidor al eliminar la cita' });
    }
}

module.exports = {getCitas, getCitasPorMascota, crearCita, actualizarCita, eliminarCita};