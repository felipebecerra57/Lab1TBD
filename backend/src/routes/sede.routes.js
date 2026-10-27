const router = require('express').Router();
const controller = require('../controllers/sede.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ver las sedes requiere estar logueado (cualquier rol)
router.get('/', verificarToken, controller.getSedes);
router.get('/:id', verificarToken, controller.getSedeById);

// Crear y editar requiere ser específicamente Administrador
router.post('/', verificarToken, verificarRol(['ADMIN']), controller.crearSede);
router.put('/:id', verificarToken, verificarRol(['ADMIN']), controller.actualizarSede);

module.exports = router;