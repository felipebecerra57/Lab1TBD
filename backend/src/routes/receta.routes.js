const router = require('express').Router();
const controller = require('../controllers/receta.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, verificarRol(['VET', 'ADMIN']), controller.getRecetas);
router.get('/:idDiagnostico/:idMedicamento', verificarToken, verificarRol(['VET', 'ADMIN']), controller.getReceta);
router.post('/', verificarToken, verificarRol(['VET']), controller.crearReceta);
router.put('/:idDiagnostico/:idMedicamento', verificarToken, verificarRol(['VET']), controller.actualizarReceta);
router.delete('/:idDiagnostico/:idMedicamento', verificarToken, verificarRol(['VET', 'ADMIN']), controller.eliminarReceta);

module.exports = router;
