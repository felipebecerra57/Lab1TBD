import api from './api.js';

export const getMisMascotas = () => api.get('/mascotas').then(r => r.data);
export const getMisFichas = () => api.get('/fichas').then(r => r.data);