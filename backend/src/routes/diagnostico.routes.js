const router = require('express').Router();
const controller = require('../controllers/diagnostico.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol(['VET', 'ADMIN']), controller.getDiagnosticos);
router.get('/:id', verificarToken, verificarRol(['VET', 'ADMIN']), controller.getDiagnosticoById);
router.post('/', verificarToken, verificarRol(['VET']), controller.crearDiagnostico);
router.put('/:id', verificarToken, verificarRol(['VET']), controller.actualizarDiagnostico);
router.delete('/:id', verificarToken, verificarRol(['ADMIN']), controller.eliminarDiagnostico);

module.exports = router;
