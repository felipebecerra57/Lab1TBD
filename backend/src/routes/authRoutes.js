const express = require('express');
const router = express.Router();
const { registerTutor, login } = require('../controllers/authController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.post('/register', registerTutor);
router.post('/login', login);

// Ruta protegida de prueba (Solo para Tutores)
router.get('/perfil-tutor', verificarToken, verificarRol(['TUTOR']), (req, res) => {
    res.json({ 
        mensaje: '¡Éxito! Lograste entrar a una ruta protegida.', 
        datos_del_token: req.usuario 
    });
});

module.exports = router;