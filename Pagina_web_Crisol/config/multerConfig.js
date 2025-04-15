import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url'; // Importa fileURLToPath para manejar __dirname

// Obtener el equivalente de __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guarda las imágenes en la carpeta 'public/img'
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: function (req, file, cb) {
        // Genera un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único + extensión
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar el archivo
    } else {
        cb(new Error('El archivo no es una imagen'), false); // Rechazar el archivo
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

export default upload;