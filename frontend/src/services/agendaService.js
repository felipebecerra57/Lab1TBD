import api from './api.js';

/**
 * Obtiene la lista de veterinarios registrados.
 */
export const getVeterinarios = () => {
    return api.get('/usuarios/veterinarios').then(r => r.data);
};

/**
 * Consulta los bloques horarios libres
 * @param {number|string} idVeterinario
 * @param {string} fecha Formato YYYY-MM-DD
 */
export const getBloquesLibres = (idVeterinario, fecha) => {
    return api.get('/turnos/libres', {
        params: { idVeterinario, fecha }
    }).then(r => r.data);
};

/**
 * (Opcional) Registra una nueva cita si se selecciona un bloque.
 */
export const agendarCita = (datosCita) => {
    return api.post('/citas', datosCita).then(r => r.data);
};