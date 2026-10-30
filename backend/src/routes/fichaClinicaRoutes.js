const router = require('express').Router();
const c = require('../controllers/fichaClinicaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', c.getFichas);
router.get('/mascota/:idMascota', c.getFicha);
router.get('/:id', c.getFicha);
router.post('/', verificarRol(['VET', 'ADMIN']), c.crear);
router.put('/:id', verificarRol(['VET', 'ADMIN']), c.actualizar);
router.delete('/:id', verificarRol(['ADMIN']), c.eliminar);

module.exports = router;