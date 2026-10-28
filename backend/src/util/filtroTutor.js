// Si es TUTOR devuelve su id. Para ADMIN o VET devuelve null (sin filtro).
function filtroTutor(req) {
    return req.usuario.rol === 'TUTOR' ? req.usuario.idUsuario : null;
}

module.exports = filtroTutor;