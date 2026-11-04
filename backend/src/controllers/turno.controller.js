const turnoRepository = require('../repositories/turno.repository');

async function getTurnos(req, res) {
    try {

        const { idVeterinario, idSede, diaSemana } = req.query;
        const turnos = await turnoRepository.getTurnos(
            idVeterinario ? Number(idVeterinario) : null,
            idSede ? Number(idSede) : null,
            diaSemana ? Number(diaSemana) : null
        );
        return res.status(200).json(turnos);
    } catch (error) {
        console.error('Error al obtener turnos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getTurnoPorId(req, res) {
    try {
        const { idTurno } = req.params;

        if (!idTurno) {
            return res.status(400).json({ error: 'El id del turno es requerido' });
        }

        const turno = await turnoRepository.getTurnoPorId(idTurno);
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        return res.status(200).json(turno);
    } catch (error) {
        console.error('Error al obtener turno por id:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getBloquesLibres(req, res) {
    try {
        const { idVeterinario, fecha } = req.query;

        if (!idVeterinario || !fecha) {
            return res.status(400).json({
                error: 'idVeterinario y fecha son requeridos como parámetros de consulta'
            });
        }

        const idVet = Number(idVeterinario);
        if (isNaN(idVet)) {
            return res.status(400).json({ error: 'idVeterinario debe ser un número válido' });
        }

        const bloques = await turnoRepository.getBloquesLibres(idVet, fecha);
        return res.status(200).json(bloques);
    } catch (error) {
        console.error('Error al obtener bloques libres:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function crearTurno(req, res) {
    try {
        const {idVeterinario, idSede, diaSemana, horaInicio, horaTermino} = req.body;

        if (!idVeterinario || !idSede || !diaSemana || !horaInicio || !horaTermino) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios',
            });
        }
        if (horaTermino <= horaInicio) {
            return res.status(400).json({
                error: 'La hora de término debe ser posterior a la hora de inicio',
            });
        }

        const idTurno = await turnoRepository.crearTurno(idVeterinario, idSede, diaSemana, horaInicio, horaTermino);

        return res.status(201).json({ mensaje: 'Turno creado exitosamente', idTurno });
    } catch (error) {
        console.error('Error al crear el turno:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear el turno' });
    }
}

async function actualizarTurno(req, res) {
    try {
        const { idTurno } = req.params;
        const id = Number(idTurno);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idTurno debe ser un número válido' });
        }
        const {idVeterinario, idSede, diaSemana, horaInicio, horaTermino} = req.body;

        if (horaInicio && horaTermino && horaTermino <= horaInicio) {
            return res.status(400).json({
                error: 'La hora de término debe ser posterior a la hora de inicio',
            });
        }

        const actualizada = await turnoRepository.actualizarTurno(
            id,
            idVeterinario,
            idSede,
            diaSemana,
            horaInicio,
            horaTermino
        );

        if (!actualizada) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        return res.status(200).json({ mensaje: 'Turno actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el turno:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el turno' });
    }
}

async function eliminarTurno(req, res) {
    try {
        const { idTurno } = req.params;
        const id = Number(idTurno);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idTurno debe ser un número válido' });
        }

        const turno = await turnoRepository.getTurnoPorId(id);

        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrada' });
        }


        await turnoRepository.eliminarTurno(id);

        return res.status(200).json({ mensaje: 'Turno eliminado de la base de datos exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el turno:', error);
        return res.status(500).json({ error: 'Error interno del servidor al eliminar el turno' });
    }
}

module.exports = {getTurnos, getTurnoPorId, getBloquesLibres, crearTurno, actualizarTurno, eliminarTurno};