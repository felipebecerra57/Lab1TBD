const router = require('express').Router();
const controller = require('../controllers/mascotaController');
const vac = require('../controllers/vacunacionController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', controller.getMascotasPorTutor);
router.get('/vacunas-pendientes', vac.listarPendientes);
router.post('/', verificarRol(['TUTOR', 'ADMIN']), controller.crear);
router.get('/:id', controller.getMascota);
router.put('/:id', verificarRol(['TUTOR', 'ADMIN']), controller.actualizar);
router.delete('/:id', verificarRol(['ADMIN']), controller.eliminar);
router.get('/:id/vacunaciones', vac.getPorMascota);
router.post('/:id/plan-vacunacion', verificarRol(['VET', 'ADMIN']), vac.aplicarPlan);

module.exports = router;