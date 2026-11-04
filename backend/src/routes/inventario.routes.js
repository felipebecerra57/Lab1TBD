const router = require('express').Router();
const inventarioController = require('../controllers/inventario.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', verificarRol(['VET', 'ADMIN']), inventarioController.getInventarios);
router.post('/', verificarRol(['ADMIN']), inventarioController.crearInventario);
router.get('/:idSede/:idMedicamento', verificarRol(['VET', 'ADMIN']), inventarioController.getInventarioPorId);
router.put('/:idSede/:idMedicamento', verificarRol(['ADMIN']), inventarioController.actualizarInventario);
router.delete('/:idSede/:idMedicamento', verificarRol(['ADMIN']), inventarioController.eliminarInventario);

module.exports = router;