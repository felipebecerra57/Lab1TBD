const inventarioRepository = require('../repositories/inventario.repository');

async function getInventarios(req, res) {
    try {
        const { idSede, idMedicamento } = req.query;
        const inventarios = await inventarioRepository.getInventarios(
            idSede ? Number(idSede) : null,
            idMedicamento ? Number(idMedicamento) : null
        );
        return res.status(200).json(inventarios);
    } catch (error) {
        console.error('Error al obtener los inventarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function getInventarioPorId(req, res) {
    try {
        const { idSede, idMedicamento } = req.params;
        const sede = Number(idSede);
        const medicamento = Number(idMedicamento);

        if (isNaN(sede) || isNaN(medicamento)) {
            return res.status(400).json({ error: 'idSede e idMedicamento deben ser números válidos' });
        }

        const inventario = await inventarioRepository.getInventarioPorId(sede, medicamento);
        if (!inventario) {
            return res.status(404).json({ error: 'Registro de inventario no encontrado' });
        }

        return res.status(200).json(inventario);
    } catch (error) {
        console.error('Error al obtener inventario por id:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function crearInventario(req, res) {
    try {
        const { idSede, idMedicamento, cantidad } = req.body;

        if (idSede === undefined || idMedicamento === undefined || cantidad === undefined) {
            return res.status(400).json({
                error: 'Los campos idSede, idMedicamento y cantidad son obligatorios',
            });
        }

        const sede = Number(idSede);
        const med = Number(idMedicamento);
        const cant = Number(cantidad);

        if (isNaN(sede) || isNaN(med) || isNaN(cant) || cant < 0) {
            return res.status(400).json({
                error: 'Los IDs deben ser números y la cantidad debe ser un entero mayor o igual a 0',
            });
        }

        const nuevoInventario = await inventarioRepository.crearInventario(sede, med, cant);

        return res.status(201).json({ mensaje: 'Inventario registrado exitosamente', inventario: nuevoInventario });
    } catch (error) {
        // 23505 = registro duplicado de (sede, idMedicamento)
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Este medicamento ya se encuentra registrado en la sede seleccionada' });
        }
        // 23503 = la sede o el medicamento no existen en la base de datos
        if (error.code === '23503') {
            return res.status(404).json({ error: 'La sede o el medicamento especificado no existen' });
        }
        console.error('Error al crear el inventario:', error);
        return res.status(500).json({ error: 'Error interno del servidor al crear el inventario' });
    }
}

async function actualizarInventario(req, res) {
    try {
        const { idSede, idMedicamento } = req.params;
        const sede = Number(idSede);
        const medicamento = Number(idMedicamento);

        if (isNaN(sede) || isNaN(medicamento)) {
            return res.status(400).json({ error: 'idSede e idMedicamento deben ser números válidos' });
        }

        const { cantidad } = req.body;

        if (cantidad === undefined || isNaN(Number(cantidad)) || Number(cantidad) < 0) {
            return res.status(400).json({ error: 'La cantidad debe ser un número entero mayor o igual a 0' });
        }

        const actualizada = await inventarioRepository.actualizarInventario(
            sede,
            medicamento,
            Number(cantidad)
        );

        if (!actualizada) {
            return res.status(404).json({ error: 'Registro de inventario no encontrado' });
        }

        return res.status(200).json({ mensaje: 'Inventario actualizado exitosamente' });
    } catch (error) {
        if (error.code === '23514') {
            return res.status(400).json({ error: 'La cantidad no puede ser negativa' });
        }
        console.error('Error al actualizar el inventario:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el inventario' });
    }
}

async function eliminarInventario(req, res) {
    try {
        const { idSede, idMedicamento } = req.params;
        const sede = Number(idSede);
        const medicamento = Number(idMedicamento);

        if (isNaN(sede) || isNaN(medicamento)) {
            return res.status(400).json({ error: 'idSede e idMedicamento deben ser números válidos' });
        }

        const eliminado = await inventarioRepository.eliminarInventario(sede, medicamento);

        if (!eliminado) {
            return res.status(404).json({ error: 'Registro de inventario no encontrado' });
        }

        return res.status(200).json({ mensaje: 'Inventario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el inventario:', error);
        return res.status(500).json({ error: 'Error interno del servidor al eliminar el inventario' });
    }
}

module.exports = {getInventarios, getInventarioPorId, crearInventario, actualizarInventario, eliminarInventario};