import express from 'express';
import configMiddleware from './middleware/configMiddleware.js';
import cookieParser from 'cookie-parser'; // Importa cookie-parser
import usuarioRoutes from './routes/usuarioRoutes.js';
import appRoutes from './routes/appRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import db from './config/db.js';
import { fileURLToPath } from 'url';
import path from 'path'
import Usuario from './models/Usuarios.js'; // Importar el modelo Usuario
import Noticias from './models/noticias.js'
import Slider_img from './models/slider.js'
import Articulo from './models/articulo.js'
import Logo from './models/icono.js'
import revistas from './models/revistas.js'
import Configuracion from './models/configuracion.js'
import Contacto from './models/contacto.js'
import Colaboracion from './models/colaboraCrisol.js';
const app = express();
// Middleware para parsear cookies
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
// Función asíncrona para conectar y sincronizar la base de datos
const iniciarBaseDeDatos = async () => {
  try {
    // Autenticar la conexión a la base de datos
    await db.authenticate();
    console.log('Conexión correcta a la base de datos');
    // Sincronizar todos los modelos con la base de datos
    await db.sync(); // Usa { force: true } en desarrollo para recrear tablas
    console.log('Todos los modelos se sincronizaron correctamente');
  } catch (error) {
    console.error('Error en la conexión o sincronización:', error);
    process.exit(1); // Detener la aplicación si hay un error grave
  }
};
// Configuración de Express
app.set('view engine', 'pug');
app.set('views', './views');
// Obtener el equivalente de __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configurar express.static
app.use(express.static(path.join(__dirname, 'public')));
// Middleware para obtener la configuración de colores
app.use(configMiddleware);
// Rutas
app.use('/auth', usuarioRoutes);
app.use('/', appRoutes);
app.use('/admin', adminRoutes);
// Función asíncrona para iniciar la aplicación
const iniciarAplicacion = async () => {
  // Iniciar la base de datos primero
  await iniciarBaseDeDatos();
  // Definir el puerto del proyecto
  const port = 3000;
  app.listen(port, () => {
    console.log(`El servidor está funcionando en el puerto ${port}`);
  });
};
// Llamar a la función para iniciar la aplicación
iniciarAplicacion();