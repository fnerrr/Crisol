import jwt from 'jsonwebtoken';

const protegerRuta = async (req, res, next) => {
    // Verificar si hay un token en las cookies
    const { _token } = req.cookies;
    if (!_token) {
        return res.redirect('/404'); // Redirigir si no hay token
    }

    // Comprobar el token
    try {
        // Verificar el token
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);

        // Almacenar el ID del usuario en el objeto `req`
        req.usuarioId = decoded.id;

        // Pasar al siguiente middleware o ruta
        return next();
    } catch (error) {
        // Si el token es inválido, eliminar la cookie y redirigir al login
        return res.clearCookie('_token').redirect('/404');
    }
};

export default protegerRuta;