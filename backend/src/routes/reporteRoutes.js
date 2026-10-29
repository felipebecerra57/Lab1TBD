const router = require('express').Router();
const controller = require('../controllers/reporteController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');


// requiere ser específicamente Administrador
router.get('/estadisticas', verificarToken, verificarRol(['ADMIN']), controller.getEstadisticas);

module.exports = router;