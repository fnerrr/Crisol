// middlewares/obtenerLogo.js
import Logo from "../models/icono.js";

const obtenerLogo = async (req, res, next) => {
    try {
        // Busca el logo más reciente en la BD
        const logo = await Logo.findOne({
            order: [['createdAt', 'DESC']] // Ordena por fecha de creación (el más reciente)
        });

        // Guarda el logo en `res.locals` para que esté disponible en todas las vistas
        res.locals.logo = logo || null;

    } catch (error) {
        console.error('🔴 Error al obtener el logo:', error);
        res.locals.logo = null; // Si hay error, se pasa `null`
    }

    next(); // Pasa al siguiente middleware o ruta
};

export default obtenerLogo