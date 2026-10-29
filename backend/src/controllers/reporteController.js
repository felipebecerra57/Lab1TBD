const repo = require('../repositories/reporteRepository');

async function getEstadisticas(req, res) {
    try {
            res.json(await repo.getEstadisticas());
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error interno' });
        }
    
}

module.exports = {getEstadisticas};