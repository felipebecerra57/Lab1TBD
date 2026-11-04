const cron = require('node-cron');
const pool = require('../config/db');

//actualiza la vista de estadisticas todos los dias a las 3:00 am

cron.schedule('0 3 * * *', async () => { //minuto 0, hora 3 todos los dias
    try {
        await pool.query('SELECT fn_refrescar_estadisticas()');
        console.log(`[cron] Estadísticas refrescadas: ${new Date().toLocaleString('es-CL')}`);
    } catch (error) {
        console.error('[cron] Error al refrescar estadísticas:', error);
    }
},{
    timezone: 'America/Santiago'
});