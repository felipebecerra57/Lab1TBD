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

// Interceptor de respuesta: si el backend dice 401 (token vencido o inválido), cerrar sesión.
// Se excluye el login, donde un 401 solo significa "credenciales incorrectas".
api.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
        const esLogin = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !esLogin) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;