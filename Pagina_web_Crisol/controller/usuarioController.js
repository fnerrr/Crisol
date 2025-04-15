import { check, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken';
import Usuario from "../models/Usuarios.js";

// Muestra el formulario de login
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Inicio de Sesión'
    });
};
// Autentica al usuario
const autenticarUsuario = async (req, res) => {
    // Validaciones con express-validator
    await check('username')
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .run(req);

    await check('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .run(req);

    let resultado = validationResult(req);

    // Verificar si hay errores de validación
    if (!resultado.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: resultado.array(),
            datos: {
                username: req.body.username
            }
        });
    }

    const { username, password } = req.body;

    try {
        // Busca al usuario en la base de datos
        const usuario = await Usuario.findOne({ where: { username } });

        // Si el usuario no existe
        if (!usuario) {
            return res.render('auth/login', {
                pagina: 'Inicio de Sesión',
                errores: [{ msg: 'Datos de acceso incorrectos' }], // Mensaje genérico por seguridad
                datos: {
                    username: req.body.username
                }
            });
        }

        // Comparación de contraseñas (deberías usar bcrypt en producción)
        if (password !== usuario.password) {
            return res.render('auth/login', {
                pagina: 'Inicio de Sesión',
                errores: [{ msg: 'Credenciales incorrectas' }], // Mismo mensaje por seguridad
                datos: {
                    username: req.body.username
                }
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: usuario.id, username: usuario.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Configurar cookie
        res.cookie('_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hora en milisegundos
        });

        // Redirigir al usuario
        res.redirect('/admin/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).render('auth/login', {
            pagina: 'Inicio de Sesión',
            errores: [{ msg: 'Ocurrió un error inesperado. Por favor, inténtalo nuevamente.' }]
        });
    }
};
export {
    formularioLogin,
    autenticarUsuario
};