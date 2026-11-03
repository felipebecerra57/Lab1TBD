const medicamentoRepository = require('../repositories/medicamento.repository');

async function getMedicamentos(req, res) {
    try {
        const { nombre, tipo } = req.query;
        const medicamentos = await medicamentoRepository.getMedicamentos(
            nombre ? nombre : null,
            tipo ? tipo : null,
        );
        return res.status(200).json(medicamentos);
    } catch (error) {
        console.error('Error al obtener medicamentos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getMedicamentoPorId(req, res) {
    try {
        const { idMedicamento } = req.params;
        const id = Number(idMedicamento);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idMedicamento debe ser un número válido' });
        }

        const medicamento = await medicamentoRepository.getMedicamentoPorId(id);
        if (!medicamento) {
            return res.status(404).json({ error: 'Medicamento no encontrado' });
        }

        return res.status(200).json(medicamento);
    } catch (error) {
        console.error('Error al obtener medicamento por id:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}


async function crearMedicamento(req, res) {
    try {
        const {nombre, tipo} = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'El campo nombre es obligatorio',
            });
        }

        const idMedicamento = await medicamentoRepository.crearMedicamento(nombre, tipo);

        return res.status(201).json({ mensaje: 'Medicamento creado exitosamente', idMedicamento });
    } catch (error) {
        // 23505 = unique_violation en PostgreSQL
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un medicamento con ese nombre' });
        }
        console.error('Error al crear el medicamento:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear el medicamento' });
    }
}

async function actualizarMedicamento(req, res) {
    try {
        const { idMedicamento } = req.params;
        const id = Number(idMedicamento);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idMedicamento debe ser un número válido' });
        }
        const {nombre, tipo} = req.body;


        const actualizada = await medicamentoRepository.actualizarMedicamento(
            id,
            nombre,
            tipo
        );

        if (!actualizada) {
            return res.status(404).json({ error: 'Medicamento no encontrado' });
        }

        return res.status(200).json({ mensaje: 'Medicamento actualizado exitosamente' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe otro medicamento con ese nombre' });
        }
        console.error('Error al actualizar el medicamento:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el medicamento' });
    }
}

async function eliminarMedicamento(req, res) {
    try {
        const { idMedicamento } = req.params;
        const id = Number(idMedicamento);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'El idMedicamento debe ser un número válido' });
        }

        const medicamento = await medicamentoRepository.getMedicamentoPorId(id);

        if (!medicamento) {
            return res.status(404).json({ error: 'Medicamento no encontrada' });
        }

        await medicamentoRepository.eliminarMedicamento(id);

        return res.status(200).json({ mensaje: 'Medicamento eliminado de la base de datos exitosamente' });
    } catch (error) {
        // 23503 = foreign_key_violation en PostgreSQL
        if (error.code === '23503') {
            return res.status(409).json({
                error: 'No se puede eliminar el medicamento porque está vinculado a registros de inventario o prescripciones'
            });
        }
        console.error('Error al eliminar el medicamento:', error);
        return res.status(500).json({ error: 'Error interno del servidor al eliminar el medicamento' });
    }
}

module.exports = {getMedicamentos, getMedicamentoPorId, crearMedicamento, actualizarMedicamento, eliminarMedicamento};