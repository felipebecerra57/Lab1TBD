import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        // Ruta de prueba para cuando termine el login
        path: '/admin/sedes',
        name: 'AdminSedes',
        component: () => import('../views/AdminSedesView.vue'), // La crearemos en el próximo paso
        meta: { requiresAuth: true, rol: 'ADMIN' }
    },
    {
        path: '/tutor/mascotas',
        name: 'TutorMascotas',
        component: () => import('../views/tutorMascotaView.vue'),
        meta: { requiresAuth: true, rol: 'TUTOR' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Devuelve los datos del token si es válido y no ha vencido; si no, null
function leerSesion() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = jwtDecode(token);
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return null;
        }
        return payload; // { idUsuario, rol, exp, ... }
    } catch {
        localStorage.removeItem('token');
        return null;
    }
}

// Guardián de Navegación (Protege las rutas en el frontend)
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    // Si la ruta requiere autenticación y no hay token, lo echamos al login
    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;