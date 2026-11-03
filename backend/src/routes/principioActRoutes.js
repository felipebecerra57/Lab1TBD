const router = require('express').Router();
const c = require('../controllers/principioActController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', verificarRol(['VET', 'ADMIN']), c.crear);
router.delete('/:id', verificarRol(['ADMIN']), c.eliminar);

module.exports = router;