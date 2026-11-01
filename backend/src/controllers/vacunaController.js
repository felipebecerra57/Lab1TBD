const repo = require('../repositories/vacunaRepository');
const {idValido} = require('../util/validar');

function validarBody({ nombreV, totalDosis, intervaloDias }) {
    if (!nombreV) return 'nombreV es obligatorio';
    if (!Number.isInteger(totalDosis) || totalDosis < 1) return 'totalDosis debe ser un entero mayor o igual a 1';
    // El procedimiento de vacunación necesita el intervalo para agendar los refuerzos
    if (totalDosis > 1 && (!Number.isInteger(intervaloDias) || intervaloDias < 1))
        return 'Una vacuna con refuerzos requiere intervaloDias (entero mayor a 0)';
    return null;
}

async function getVacunas(req, res){
    try{
        res.json(await repo.getVacunas());
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function getVacuna(req, res){
    try{
        if(!idValido(req.params.id)) return res.status(400).json( error = 'ID no válido');
        const vacuna = await repo.getVacuna(req.params.id);
        if(!vacuna) return res.status(400).json(error = 'Vacuna no encontrada');
        res.json(vacuna)
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function crear(req, res) {
    try {
        const error = validarBody(req.body);
        if (error) return res.status(400).json({ error });
        res.status(201).json(await repo.crear(req.body));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

async function eliminar(req, res){
    try{
        if(!idValido(req.params.id)) return res.status(400).json( error = 'ID no válido');
        const vacuna = await repo.getVacuna(req.params.id);
        if(!vacuna) return res.status(400).json(error = 'Vacuna no encontrada');
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno' });
    }
}

module.exports = { getVacuna, getVacunas, eliminar, crear}