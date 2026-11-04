import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import AgendaView from '../views/AgendaView.vue';
import VetAgendaView from '../views/VetAgendaView.vue';
import { jwtDecode } from 'jwt-decode';

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
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
        path: '/admin/estadisticas',
        name: 'AdminEstadisticas',
        component: () => import('../views/AdminEstadisticasView.vue'),
        meta: {requiresAuth: true, rol: 'ADMIN'}
    },
    {
        path: '/tutor/mascotas',
        name: 'TutorMascotas',
        component: () => import('../views/tutorMascotaView.vue'),
        meta: { requiresAuth: true, rol: 'TUTOR' }
    },
    {
        // Pantalla del veterinario: registrar y revisar atenciones clínicas
        path: '/vet/atencion',
        name: 'VetAtencion',
        component: () => import('../views/VetAtencionView.vue'),
        meta: { requiresAuth: true, rol: 'VET' }
    },
    {
        path: '/vet/agenda',
        name: 'vet-agenda',
        component: VetAgendaView
    },
    {
        path: '/agenda',
        name: 'Agenda',
        component: AgendaView
    },
    {
        path: '/admin/inventario',
        name: 'AdminInventario',
        component: () => import('../views/AdminInventarioView.vue'),
        meta: { requiresAuth: true, rol: 'ADMIN' }
    },
    {
        path: '/vet/vacunacion',
        name: 'PlanVacunacion',
        component: () => import('../views/PlanVacunacionView.vue'),
        // Aquí puedes usar un array si necesitas múltiples roles, 
        // o adaptarlo a la lógica actual de tu meta.rol
        meta: { requiresAuth: true, rol: ['VET', 'ADMIN'] } // O ADMIN dependiendo de cómo configures tu beforeEach
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
    const rol = localStorage.getItem('rol');

    // 1. Validar si requiere autenticación
    if (to.meta.requiresAuth && !token) {
        return next('/login');
    }

    // 2. Validar roles si la ruta lo exige
    if (to.meta.rol) {
        // Convertimos a arreglo por si alguna ruta antigua solo tiene un string (ej. rol: 'ADMIN')
        const rolesPermitidos = Array.isArray(to.meta.rol) ? to.meta.rol : [to.meta.rol];
        
        if (!rolesPermitidos.includes(rol)) {
            // Si no tiene el rol permitido, lo redirigimos a su vista principal
            if (rol === 'TUTOR') return next('/tutor/mascotas');
            if (rol === 'VET') return next('/vet/atencion');
            if (rol === 'ADMIN') return next('/admin/sedes');
            return next('/'); 
        }
    }

    next();
});

export default router;