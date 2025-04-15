// middlewares/configMiddleware.js
import Configuracion from '../models/configuracion.js';

const configMiddleware = async (req, res, next) => {
    console.log('Middleware de configuración: Iniciando obtención de colores...');

    try {
        const configuracion = await Configuracion.findOne({ where: { id: 1 } });

        if (!configuracion) {
            // console.warn('Middleware de configuración: No se encontró ninguna configuración en la base de datos. Usando valores por defecto.');
            res.locals.styles = `
                :root {
                    --color-principal: #4c406e; /* Valor por defecto */
                    --color-texto-primario: #ffffff; /* Valor por defecto */
                    --color-texto-secundario: #cccccc; /* Valor por defecto */
                }
            `;
        } else {
            // console.log('Middleware de configuración: Configuración obtenida correctamente:', configuracion);
            res.locals.styles = `
                :root {
                    --color-principal: ${configuracion.color_principal};
                    --color-texto-primario: ${configuracion.color_textoPrimario};
                    --color-texto-secundario: ${configuracion.color_textoSecundario};
                }
            `;
        }

        next(); // Continuar con el siguiente middleware o ruta
    } catch (error) {
        // console.error('Middleware de configuración: Error al obtener la configuración:', error);

        // En caso de error, usar valores por defecto
        res.locals.styles = `
            :root {
                --color-principal: #4c406e; /* Valor por defecto */
                --color-texto-primario: #ffffff; /* Valor por defecto */
                --color-texto-secundario: #cccccc; /* Valor por defecto */
            }
        `;

        // console.warn('Middleware de configuración: Usando valores por defecto debido a un error.');

        next(); // Continuar con el siguiente middleware o ruta
    }
};

export default configMiddleware;