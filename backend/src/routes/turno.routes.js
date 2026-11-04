const router = require('express').Router();
const turnoController = require('../controllers/turno.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', verificarRol(['VET', 'ADMIN']), turnoController.getTurnos);
router.get('/:idTurno', verificarRol(['VET', 'ADMIN']), turnoController.getTurnoPorId);
router.get('/libres', verificarRol(['TUTOR', 'VET', 'ADMIN']), turnoController.getBloquesLibres);
router.post('/', verificarRol(['VET', 'ADMIN']), turnoController.crearTurno);
router.put('/:idTurno', verificarRol(['VET', 'ADMIN']), turnoController.actualizarTurno);
router.delete('/:idTurno', verificarRol(['ADMIN']), turnoController.eliminarTurno);

module.exports = router;