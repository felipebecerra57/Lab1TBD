const router = require('express').Router();
const c = require('../controllers/especieController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', c.obtenerTodas);        // cualquier usuario autenticado (el tutor la necesita para registrar su mascota)
router.get('/:id', c.obtener);
router.post('/', verificarRol(['ADMIN']), c.crear);
router.delete('/:id', verificarRol(['ADMIN']), c.eliminar);

module.exports = router;