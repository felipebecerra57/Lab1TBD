const router = require('express').Router();
const medicamentoController = require('../controllers/medicamento.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', verificarRol(['VET', 'ADMIN']), medicamentoController.getMedicamentos);
router.get('/:idMedicamento', verificarRol(['VET', 'ADMIN']), medicamentoController.getMedicamentoPorId);
router.post('/', verificarRol(['ADMIN']), medicamentoController.crearMedicamento);
router.put('/:idMedicamento', verificarRol(['ADMIN']), medicamentoController.actualizarMedicamento);
router.delete('/:idMedicamento', verificarRol(['ADMIN']), medicamentoController.eliminarMedicamento);
router.get('/:idMedicamento/principios-activos', verificarRol(['VET', 'ADMIN']), medicamentoController.getPrincipiosActivos);
router.post('/:idMedicamento/principios-activos', verificarRol(['ADMIN']), medicamentoController.agregarPrincipioActivo);
router.delete('/:idMedicamento/principios-activos/:idPrincipioActivo', verificarRol(['ADMIN']), medicamentoController.quitarPrincipioActivo);

module.exports = router;