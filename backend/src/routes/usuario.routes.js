const router = require('express').Router();
const controller = require('../controllers/usuario.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Proteger con el JWT y exigir que el rol sea ADMIN
router.post('/veterinario', verificarToken, verificarRol(['ADMIN']), controller.registrarVeterinario); 
router.post('/administrador', verificarToken, verificarRol(['ADMIN']), controller.registrarAdministrador);

module.exports = router;