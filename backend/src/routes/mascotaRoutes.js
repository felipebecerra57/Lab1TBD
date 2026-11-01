const router = require('express').Router();
const controller = require('../controllers/mascotaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', controller.getMascotasPorTutor);
router.get('/:id', controller.getMascota);
router.post('/', verificarRol(['TUTOR', 'ADMIN']), controller.crear);
router.put('/:id', verificarRol(['TUTOR', 'ADMIN']), controller.actualizar);
router.delete('/:id', verificarRol(['ADMIN']), controller.eliminar);

module.exports = router;