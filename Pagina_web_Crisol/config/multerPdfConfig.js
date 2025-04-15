// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Obtener el equivalente de __dirname en módulos ES
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configuración de almacenamiento para multer
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // Guarda los PDFs en la carpeta 'public/uploads/pdf'
//         cb(null, path.join(__dirname, '../public/uploads/pdf'));
//     },
//     filename: function (req, file, cb) {
//         // Genera un nombre único para el archivo
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único + extensión
//     }
// });

// // Filtro para aceptar solo archivos PDF
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//         cb(null, true); // Aceptar el archivo
//     } else {
//         cb(new Error('El archivo no es un PDF'), false); // Rechazar el archivo
//     }
// };

// const uploadPdf = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 10 * 1024 * 1024 // Límite de 10MB
//     }
// });

// export default uploadPdf;