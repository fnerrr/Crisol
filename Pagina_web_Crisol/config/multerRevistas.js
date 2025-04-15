// middlewares/multer.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento para imágenes
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/img')); // Guarda las imágenes en 'public/img'
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único
    },
});

// Configuración de almacenamiento para PDFs
const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/pdf')); // Guarda los PDFs en 'public/uploads/pdf'
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único
    },
});

// Filtro para aceptar solo imágenes
const imageFilter = (req, file, cb) => {
    console.log('Campo recibido (imagen):', file.fieldname); // Depuración adicional
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar el archivo
    } else {
        cb(new Error('El archivo no es una imagen'), false); // Rechazar el archivo
    }
};

// Filtro para aceptar solo PDFs
const pdfFilter = (req, file, cb) => {
    console.log('Campo recibido (PDF):', file.fieldname); // Depuración adicional
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Aceptar el archivo
    } else {
        cb(new Error('El archivo no es un PDF'), false); // Rechazar el archivo
    }
};

// Configuración de Multer para manejar múltiples archivos
export const uploadFiles = multer({
    storage: multer.diskStorage({}), // No necesitas almacenamiento aquí, ya que se maneja en los campos
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'imagen') {
            imageFilter(req, file, cb);
        } else if (file.fieldname === 'pdfFile') {
            pdfFilter(req, file, cb);
        } else {
            cb(new Error('Campo inesperado'), false);
        }
    },
}).fields([
    { name: 'imagen', maxCount: 1 }, // Campo para la imagen
    { name: 'pdfFile', maxCount: 1 }, // Campo para el PDF
]);

// Configuración de Multer para imágenes (opcional, si la necesitas por separado)
export const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFilter,
});

// Configuración de Multer para PDFs (opcional, si la necesitas por separado)
export const uploadPdf = multer({
    storage: pdfStorage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Límite de 10MB
    },
});