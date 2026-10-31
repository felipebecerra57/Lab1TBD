const router = require('express').Router();
const citaMedicaController = require('../controllers/citaMedica.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/mascota/:idMascota', verificarRol(['TUTOR', 'VET', 'ADMIN']), citaMedicaController.getCitasPorMascota);
router.get('/', verificarRol(['VET', 'ADMIN']), citaMedicaController.getCitas());
router.post('/', verificarRol(['TUTOR', 'ADMIN']), citaMedicaControllercontroller.crearCita);

module.exports = router;