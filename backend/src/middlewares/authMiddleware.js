const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica que el token exista y sea válido
const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json({ error: 'Acceso denegado. No hay token proporcionado.' });

    try {
        // Extrae el token asumiendo el formato "Bearer <token>"
        const tokenLimpio = token.split(' ')[1]; 
        const payload = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        // Inyectamos los datos del usuario en la request para usarlo en el siguiente controlador
        req.usuario = payload; 
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Verifica si el rol del usuario está dentro de los roles permitidos para ese endpoint
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'No tienes los permisos necesarios (RBAC)' });
        }
        next();
    };
};

module.exports = { verificarToken, verificarRol };