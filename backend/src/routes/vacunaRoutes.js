const router = require('express').Router();
const c = require('../controllers/vacunaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', c.getVacunas);
router.get('/:id', c.getVacuna);
router.post('/', verificarRol(['ADMIN']), c.crear);
router.delete('/:id', verificarRol(['ADMIN']), c.eliminar);

module.exports = router;