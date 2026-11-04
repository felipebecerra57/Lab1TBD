import api from './api.js';

export const getMisMascotas = () => api.get('/mascotas').then(r => r.data);
export const getMisFichas = () => api.get('/fichas').then(r => r.data);
export const getEspecies = () => api.get('/especies').then(r => r.data);
export const crearMascota = (datos) => api.post('/mascotas', datos).then(r => r.data);