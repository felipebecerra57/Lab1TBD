const router = require('express').Router();
const controller = require('../controllers/atencion.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol(['VET', 'ADMIN']), controller.getAtenciones);
router.get('/:id', verificarToken, verificarRol(['VET', 'ADMIN']), controller.getAtencion);
router.post('/', verificarToken, verificarRol(['VET']), controller.registrarAtencion);   // tarea 3 (procedimiento)
router.put('/:id', verificarToken, verificarRol(['VET']), controller.actualizarAtencion);
router.patch('/:id/cerrar', verificarToken, verificarRol(['VET']), controller.cerrarAtencion);

module.exports = router;
