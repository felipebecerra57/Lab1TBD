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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

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