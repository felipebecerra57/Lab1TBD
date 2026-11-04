const router = require('express').Router();
const controller = require('../controllers/usuario.controller');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Proteger con el JWT y exigir que el rol sea ADMIN
router.post('/veterinario', verificarToken, verificarRol(['ADMIN']), controller.registrarVeterinario); 
router.post('/administrador', verificarToken, verificarRol(['ADMIN']), controller.registrarAdministrador);

// Rutas GET
router.get('/tutores', verificarToken, verificarRol(['ADMIN', 'VET']), controller.getTutores);
router.get('/personal', verificarToken, verificarRol(['ADMIN']), controller.getPersonal);
router.get('/veterinarios', verificarToken, verificarRol(['ADMIN', 'VET', 'TUTOR']), controller.getVeterinarios);
router.get('/veterinarios/:id', verificarToken, verificarRol(['ADMIN', 'VET']), controller.getVeterinarioById);
router.get('/personal/:id', verificarToken, verificarRol(['ADMIN']), controller.getPersonalById);

// Rutas PUT
router.put('/tutor/:id', verificarToken, verificarRol(['ADMIN']), controller.updateTutor);
router.put('/empleado/:id', verificarToken, verificarRol(['ADMIN']), controller.updateEmpleado);

// Ruta DELETE general (Borra cualquiera por la cascada)
router.delete('/:id', verificarToken, verificarRol(['ADMIN']), controller.deleteUsuario);

module.exports = router;