const router = require('express').Router();
const controller = require('../controllers/sede.controller');

router.get('/', controller.getSedes);
router.get('/:id', controller.getSedeById);
router.post('/', controller.crearSede);
router.put('/:id', controller.actualizarSede);

module.exports = router;