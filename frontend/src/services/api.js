import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // La URL base de tu backend
});

// Interceptor: Se ejecuta antes de que cualquier petición salga del navegador
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Inyecta el candado
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;