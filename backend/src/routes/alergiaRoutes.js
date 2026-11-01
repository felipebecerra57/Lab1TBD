const router = require('express').Router();
const c = require('../controllers/alergiaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', c.listar);
router.get('/mascota/:idMascota', c.listarPorMascota);
router.post('/', verificarRol(['VET', 'ADMIN']), c.crear);
router.put('/mascota/:idMascota/principio/:idPrincipio', verificarRol(['VET', 'ADMIN']), c.actualizar);
router.delete('/mascota/:idMascota/principio/:idPrincipio', verificarRol(['VET', 'ADMIN']), c.eliminar);

module.exports = router;