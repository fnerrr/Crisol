import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { fileURLToPath } from 'url'; // Importar fileURLToPath para manejar import.meta.url
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3Config.js';
import Noticias from "../models/noticias.js";
import Logo from "../models/icono.js";
import Configuracion from '../models/configuracion.js';
import Revistas from '../models/revistas.js';
import Contacto from '../models/contacto.js';
import Colaboracion from '../models/colaboraCrisol.js';
import Slider from '../models/slider.js';
import Articulo from '../models/articulo.js';

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





const agregarArticulo = async (req, res) => {
    try {
        res.render('admin/agregarArticulo', {
            pagina: 'Agregar Artículo',
            articulo: null
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/verarticulos?error=Error al cargar el formulario');
    }
};
const registrarArticulo = async (req, res) => {
    try {
        const { titulo, contenido, categoria, nombreAutor, ocupacionAutor } = req.body;

        if (!titulo || !contenido || !categoria || !nombreAutor || !ocupacionAutor) {
            return res.redirect('/admin/agregar-articulo?error=Faltan campos requeridos');
        }

        const img = req.files['img']?.[0];
        const imgAutor = req.files['imgAutor']?.[0];
        
        if (!img || !imgAutor) {
            return res.redirect('/admin/agregar-articulo?error=Se requieren ambas imágenes');
        }
        
        const articulo = await Articulo.create({
            titulo,
            contenido,
            categoria,
            nombreAutor,
            ocupacionAutor,
            img: `/img/${img.filename}`,
            imgAutor: `/img/${imgAutor.filename}`
        });
        
        return res.redirect('/admin/verarticulos?success=Artículo creado correctamente');
    } catch (error) {
        console.error('Error:', error);
        
        // Limpieza de archivos subidos en caso de error
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => {
                    const filePath = path.join(process.cwd(), 'public', 'uploads', file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            });
        }

        return res.redirect(`/admin/agregar-articulo?error=${encodeURIComponent(error.message)}`);
    }
};


const formEditarArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        const articulo = await Articulo.findByPk(id);

        if (!articulo) {
            return res.redirect('/admin/verarticulos?error=Artículo no encontrado');
        }

        res.render('admin/editarArticulo', {
            pagina: `Editar: ${articulo.titulo}`,
            articulo
        });
    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        res.redirect('/admin/verarticulos?error=Error al cargar el formulario');
    }
};


const actualizarArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, categoria, nombreAutor, ocupacionAutor } = req.body;

        const articulo = await Articulo.findByPk(id);
        if (!articulo) {
            return res.redirect('/admin/verarticulos?error=Artículo no encontrado');
        }

        // Actualizar campos básicos
        articulo.titulo = titulo;
        articulo.contenido = contenido;
        articulo.categoria = categoria;
        articulo.nombreAutor = nombreAutor;
        articulo.ocupacionAutor = ocupacionAutor;

        // Manejar imágenes si se subieron nuevas
        if (req.files['img']) {
            // Eliminar imagen anterior si existe
            if (articulo.img) {
                const oldPath = path.join(process.cwd(), 'public', articulo.img);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            articulo.img = `/uploads/${req.files['img'][0].filename}`;
        }

        if (req.files['imgAutor']) {
            // Eliminar imagen anterior si existe
            if (articulo.imgAutor) {
                const oldPath = path.join(process.cwd(), 'public', articulo.imgAutor);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            articulo.imgAutor = `/uploads/${req.files['imgAutor'][0].filename}`;
        }

        await articulo.save();
        
        return res.redirect('/admin/verarticulos?success=Artículo actualizado correctamente');
    } catch (error) {
        console.error('Error:', error);
        return res.redirect(`/admin/editar-articulo/${req.params.id}?error=${encodeURIComponent(error.message)}`);
    }
};

const verArticulos = async (req, res) => {
    try {
        // Configuración de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        // Filtro por categoría si existe
        const categoria = req.query.categoria || '';
        const whereClause = categoria ? { categoria } : {};
        
        // Obtener artículos paginados y filtrados
        const { count, rows: articulos } = await Articulo.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const categorias = [
            'Visión estudiantil', 'Mundo y política', 'Educación', 
            'Ciencia', 'Poesía', 'Arte', 'Cultura', 
            'Deporte', 'Noticiero estudiantil', 'Desafíos mentales'
        ];

        res.render('admin/verArticulos', {
            pagina: 'Gestión de Artículos',
            articulos,
            categorias: categorias.map(cat => ({ value: cat, label: cat })),
            categoriaSeleccionada: categoria,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            limit,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Error al obtener artículos:', error);
        res.redirect('/admin?error=Error al cargar los artículos');
    }
};

const verDetalleArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        const articulo = await Articulo.findByPk(id);

        if (!articulo) {
            return res.redirect('/admin/verarticulos?error=Artículo no encontrado');
        }

        res.render('admin/detalleArticulo', {
            pagina: `Detalle: ${articulo.titulo}`,
            articulo
        });
    } catch (error) {
        console.error('Error al ver detalle:', error);
        res.redirect('/admin/verarticulos?error=Error al cargar el artículo');
    }
};

const eliminarArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        const articulo = await Articulo.findByPk(id);

        if (!articulo) {
            return res.redirect('/admin/verarticulos?error=Artículo no encontrado');
        }

        // Eliminar imágenes asociadas
        if (articulo.img) {
            const imgPath = path.join(process.cwd(), 'public', articulo.img);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }

        if (articulo.imgAutor) {
            const imgAutorPath = path.join(process.cwd(), 'public', articulo.imgAutor);
            if (fs.existsSync(imgAutorPath)) {
                fs.unlinkSync(imgAutorPath);
            }
        }

        await articulo.destroy();
        res.redirect('/admin/verarticulos?success=Artículo eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar artículo:', error);
        res.redirect('/admin/verarticulos?error=Error al eliminar el artículo');
    }
};







const mostrarSlides = async (req, res) => {
    try {
        // Verificar si existe al menos una revista
        const revistaDefault = await Revistas.findByPk(1);
        
        // Si no existe revista con ID 1, crea una por defecto
        if (!revistaDefault) {
            await Revistas.create({
                id: 1,
                titulo: 'Revista por defecto',
                // ...otros campos necesarios con valores por defecto
            });
        }

        // Obtener o crear los 4 slides si no existen
        const slidesCount = await Slider.count();
        if (slidesCount < 4) {
            for (let i = 1; i <= 4; i++) {
                await Slider.findOrCreate({
                    where: { posicion: i },
                    defaults: {
                        imagen: `/img/slider${i}.jpg`,
                        revista_id: 1, // ID de revista por defecto
                        posicion: i
                    }
                });
            }
        }

        const slides = await Slider.findAll({
            where: { posicion: [1, 2, 3, 4] },
            include: [{
                model: Revistas,
                as: 'revista'
            }],
            order: [['posicion', 'ASC']]
        });

        const revistas = await Revistas.findAll();

        res.render('admin/sliders', {
            slides,
            revistas,
        });

    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar los slides');
        res.redirect('/admin/inicio');
    }
};

const actualizarSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const { revista_id } = req.body;
        
        const slide = await Slider.findByPk(id);
        if (!slide) {
            throw new Error('Slide no encontrado');
        }

        // Verificar que la revista exista
        const revista = await Revistas.findByPk(revista_id);
        if (!revista) {
            throw new Error('La revista seleccionada no existe');
        }

        // Actualizar revista
        slide.revista_id = revista_id;

        // Actualizar imagen si se subió una nueva
        if (req.file) {
            // Verificar si es una imagen predefinida
            if (slide.imagen.startsWith('/img/slider')) {
                // Obtener la ruta completa del archivo existente
                const oldImagePath = path.join(__dirname, '..', 'public', slide.imagen);
                
                // Eliminar la imagen anterior si existe
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                
                // Mover la nueva imagen al mismo nombre/ruta
                const newImagePath = path.join(__dirname, '..', 'public', slide.imagen);
                fs.renameSync(req.file.path, newImagePath);
                
                // No actualizamos slide.imagen porque mantiene el mismo valor
            } else {
                // Si no es imagen predefinida, usar el nombre original del archivo subido
                slide.imagen = '/uploads/sliders/' + req.file.filename;
            }
        }

        await slide.save();

        // req.flash('success', 'Slide actualizado correctamente');
        res.redirect('/admin/slider');

    } catch (error) {
        console.error(error);
        // req.flash('error', error.message);
        res.redirect('/admin/slider');
    }
};

const mostrarFormularioCrear = async (req, res) => {
    try {
        // Obtener todas las revistas para el select
        const revistas = await Revistas.findAll({
            order: [['titulo', 'ASC']]
        });    
        
        res.render('admin/sliders', {
            revistas,
            pagina: 'Nuevo Slide'
        });    
    } catch (error) {
        console.log(error);
        res.redirect('/admin/sliders');
    }    
};    

const inicio = (req, res) => {
    res.render('admin/inicio', {
        pagina: 'Inicio de adminitrador'
    });
};


// const formularioColor = (req, res) => {
const formularioColor = async (req, res) => {
    try {
        // Obtener la configuración de colores desde la base de datos
        const configuracion = await Configuracion.findOne({ where: { id: 1 } });

        // Renderizar la vista y pasar los colores
        res.render('admin/actualizar-color', {
            pagina: 'Configuración de Colores',
            configuracion: configuracion || {
                color_principal: '#4c406e', // Valor por defecto
                color_textoPrimario: '#ffffff', // Valor por defecto
                color_textoSecundario: '#cccccc', // Valor por defecto
            },
        });
    } catch (error) {
        console.error('Error al obtener la configuración:', error);
        res.status(500).send('Error al cargar la configuración de colores');
    }
};




const actualizarColores = async (req, res) => {
    const { color_principal, color_textoPrimario, color_textoSecundario } = req.body;

    try {
        // Busca la configuración existente o crea una nueva si no existe
        const [configuracion, created] = await Configuracion.findOrCreate({
            where: { id: 1 }, // Asume que solo hay una configuración con id 1
            defaults: {
                color_principal,
                color_textoPrimario,
                color_textoSecundario
            }
        });

        // Si la configuración ya existe, actualiza los colores
        if (!created) {
            configuracion.color_principal = color_principal;
            configuracion.color_textoPrimario = color_textoPrimario;
            configuracion.color_textoSecundario = color_textoSecundario;
            await configuracion.save();
        }

        res.redirect('/admin/actualizar-color'); // Redirige a la página de configuración después de actualizar
    } catch (error) {
        console.error('Error al actualizar los colores:', error);
        res.status(500).send('Error al actualizar los colores');
    }
};

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/inicio')
}

const verNoticias = async (req, res) => {
    try {
        // Obtener todas las noticias desde la base de datos
        const noticias = await Noticias.findAll({
            order: [['createdAt', 'DESC']], // Ordenar por fecha de creación (más recientes primero)
            limit: 9, // Limitar a 9 noticias
        });

        // Depuración: Imprime las noticias en la consola
        console.log('Noticias obtenidas de la base de datos:', noticias);

        // Verificar si no hay noticias
        if (noticias.length === 0) {
            // Renderizar la vista con un mensaje indicando que no hay noticias
            return res.render('admin/vernoticias', {
                pagina: 'Ver Noticias',
                mensaje: 'No hay noticias disponibles en este momento.',
                noticias: [], // Pasar un arreglo vacío para evitar errores en la vista
            });
        }

        // Renderizar la vista y pasar los datos
        res.render('admin/vernoticias', {
            pagina: 'Ver Noticias',
            noticias, // Pasar las noticias obtenidas
        });
    } catch (error) {
        console.error('Error al obtener las noticias:', error);
        // Enviar una respuesta de error al cliente
        res.status(500).render('error', {
            mensaje: 'Error al cargar las noticias. Por favor, inténtalo de nuevo más tarde.',
        });
    }
};


const formularioRegistroNoticias = async (req, res) => {
    const { id } = req.params;

    try {
        let noticia = null;
        if (id) {
            noticia = await Noticias.findByPk(id);
            if (!noticia) {
                return res.status(404).send('Noticia no encontrada');
            }
        }

        res.render('admin/registro_noticias', {
            pagina: id ? 'Editar Noticia' : 'Registrar Noticia',
            noticia, // Pasar la noticia a la vista si existe
        });
    } catch (error) {
        console.error('Error al cargar el formulario:', error);
        res.status(500).send('Error al cargar el formulario');
    }
};



const obtenerNoticia = async (req, res) => {
    const { id } = req.params;

    try {
        const noticia = await Noticias.findByPk(id);

        if (!noticia) {
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }

        res.status(200).json(noticia);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la noticia' });
    }
};

const actualizarNoticia = async (req, res) => {
    const { id } = req.params;
    const { titulo, url } = req.body; // Asegúrate de que el nombre coincida con el formulario
    const img = req.file;

    try {
        const noticia = await Noticias.findByPk(id);

        if (!noticia) {
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }

        // Actualizar los campos
        noticia.Titulo = titulo; // Asegúrate de que el nombre coincida con el modelo
        noticia.url = url;

        if (img) {
            noticia.img = `/img/${img.filename}`; // Actualizar la imagen si se subió una nueva
        }

        await noticia.save();

        res.redirect('/admin/vernoticias'); // Redirigir a la lista de noticias
    } catch (error) {
        console.error('Error al actualizar la noticia:', error);
        res.status(500).json({ error: 'Error al actualizar la noticia' });
    }
};



const registrarNoticia = async (req, res) => {
    const { titulo, url } = req.body;
    const img = req.file;

    console.log('Datos recibidos:', { titulo, url, img }); // Depuración

    if (!img) {
        console.error('No se subió ninguna imagen.'); // Depuración
        return res.status(400).send('No se subió ninguna imagen.');
    }

    try {
        const noticias = await Noticias.create({
            Titulo: titulo,
            url: url,
            img: `/img/${img.filename}`,
        });

        console.log('Noticia guardada en la base de datos:', noticias); // Depuración
        res.redirect('/admin/vernoticias');
    } catch (error) {
        console.error('Error al crear la noticia:', error); // Depuración
        res.status(500).send('Error al crear la noticia');
    }
};

const formularioEditarNoticia = async (req, res) => {
    const { id } = req.params;

    try {
        const noticia = await Noticias.findByPk(id);

        if (!noticia) {
            return res.status(404).send('Noticia no encontrada');
        }

        res.render('admin/editar-noticia', {
            pagina: 'Editar Noticia',
            noticia, // Pasar la noticia a la vista
        });
    } catch (error) {
        console.error('Error al cargar la noticia:', error);
        res.status(500).send('Error al cargar la noticia');
    }
};

const eliminarNoticia = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la noticia desde los parámetros de la URL

    try {
        // Buscar la noticia por su ID
        const noticia = await Noticias.findByPk(id);

        if (!noticia) {
            // Si la noticia no existe, devolver un error 404
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }

        // Eliminar la noticia de la base de datos
        await noticia.destroy();

        // Redirigir a la página de ver noticias o enviar una respuesta de éxito
        res.redirect('/admin/vernoticias'); // Redirigir a la lista de noticias
    } catch (error) {
        console.error('Error al eliminar la noticia:', error);
        res.status(500).json({ error: 'Error al eliminar la noticia' });
    }
};

const formularioIcono = (req, res) => {
    res.render('admin/actualizar-icono', {
        pagina: 'Actualizar icono'
    });
};



const actualizarIcono = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ninguna imagen.');
    }

    const nombreArchivo = 'crisol.jpg'; // Nombre fijo para el ícono
    const newIconPath = path.join(__dirname, '../../Pagina_web_Crisol/public/img/', nombreArchivo);

    try {
        // Verificar si el archivo antiguo existe y eliminarlo
        if (fs.existsSync(newIconPath)) {
            fs.unlinkSync(newIconPath); // Eliminar el archivo antiguo
            console.log('Imagen anterior eliminada:', newIconPath);
        }

        // Mover la nueva imagen a la ubicación deseada
        fs.rename(req.file.path, newIconPath, async (err) => {
            if (err) {
                console.error('Error al mover el archivo:', err);
                return res.status(500).send('Error al actualizar el ícono.');
            }

            // Si estás utilizando un modelo Logo para almacenar la ruta del ícono
            try {
                const logo = await Logo.findOne();
                if (logo) {
                    logo.ruta = `/img/${nombreArchivo}`;
                    await logo.save();
                } else {
                    await Logo.create({ ruta: `/img/${nombreArchivo}` });
                }
                console.log('Ícono actualizado correctamente.');
                res.redirect('/admin/actualizar-icono');
            } catch (error) {
                console.error('Error al actualizar el logo en la base de datos:', error);
                res.status(500).send('Error al actualizar el ícono.');
            }
        });
    } catch (error) {
        console.error('Error en el bloque try-catch principal:', error);
        res.status(500).send('Error al actualizar el ícono.');
    }
};

const formularioEditarNoticias = async (req, res) => {
    try {
        // Obtener todas las noticias desde la base de datos
        const noticias = await Noticias.findAll({
            order: [['createdAt', 'DESC']],
            limit: 9,
        });

        // Depuración: Imprime las noticias en la consola
        console.log('Noticias obtenidas de la base de datos:', noticias);

        // Renderizar la vista y pasar los datos
        res.render('admin/editar-noticias', {
            pagina: 'Editar Noticias',
            noticias, // Pasar las noticias a la vista
        });
    } catch (error) {
        console.error('Error al obtener las noticias:', error);
        res.status(500).send('Error al cargar las noticias');
    }
};



// controllers/revistaController.js
const uploadPdfController = async (req, res) => {
    const { id } = req.params;
    const isEditMode = !!id;
    
    console.log('Archivos recibidos:', req.files);
    console.log('Cuerpo de la solicitud:', req.body);

    if (req.fileValidationError) {
        return res.status(400).render('admin/agregarPDF', {
            pagina: isEditMode ? 'Editar PDF' : 'Subir PDF',
            error: req.fileValidationError,
            revista: req.body
        });
    }

    const imagenFile = req.files['imagen']?.[0];
    const pdfFile = req.files['pdfFile']?.[0];

    // En modo edición, el PDF no es requerido (puede mantener el anterior)
    if (!isEditMode && !pdfFile) {
        return res.status(400).render('admin/agregarPDF', {
            pagina: 'Subir PDF',
            error: 'No se subió ningún archivo PDF',
            revista: req.body
        });
    }

    try {
        let revistaData = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion
        };

        // En modo edición, primero obtenemos la revista actual para manejar la eliminación del PDF anterior
        let revistaExistente = null;
        if (isEditMode) {
            revistaExistente = await Revistas.findByPk(id);
            if (!revistaExistente) {
                return res.status(404).render('admin/agregarPDF', {
                    pagina: 'Editar PDF',
                    error: 'Revista no encontrada',
                    revista: req.body
                });
            }
        }

        // Procesar PDF si se subió uno nuevo
        if (pdfFile) {
            // 1. Si estamos editando y existe un PDF anterior, lo eliminamos de S3
            if (isEditMode && revistaExistente?.s3_key) {
                try {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: revistaExistente.s3_key
                    }));
                } catch (s3Error) {
                    console.error('Error al eliminar el PDF anterior de S3:', s3Error);
                    // No detenemos el proceso si falla la eliminación del archivo anterior
                }
            }

            // 2. Subir el nuevo PDF a S3
            const fileStream = fs.createReadStream(pdfFile.path);
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: pdfFile.filename,
                Body: fileStream,
                ContentType: pdfFile.mimetype,
                
            };

            await s3Client.send(new PutObjectCommand(uploadParams));
            
            // 3. Generar la URL del archivo
            revistaData.s3_key = uploadParams.Key;
            revistaData.url = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
            revistaData.tamanio = pdfFile.size;

            // Limpiar archivo PDF temporal
            fs.unlinkSync(pdfFile.path);
        }

        // Procesar imagen si se subió una nueva
        if (imagenFile) {
            // Si estamos editando y existe una imagen anterior, la eliminamos del sistema de archivos
            if (isEditMode && revistaExistente?.imagen) {
                try {
                    const oldImagePath = path.join(__dirname, '../public', revistaExistente.imagen);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (fsError) {
                    console.error('Error al eliminar la imagen anterior:', fsError);
                    // No detenemos el proceso si falla la eliminación de la imagen anterior
                }
            }

            const imageExtension = path.extname(imagenFile.originalname);
            const imageName = `${imagenFile.filename}${imageExtension}`;
            const imagePath = path.join(__dirname, '../public/img', imageName);
            
            fs.renameSync(imagenFile.path, imagePath);
            revistaData.imagen = `/img/${imageName}`;
        }

        // Guardar o actualizar en la base de datos
        if (isEditMode) {
            await Revistas.update(revistaData, { where: { id } });
        } else {
            await Revistas.create(revistaData);
        }

        res.render('admin/agregarPDF', {
            pagina: isEditMode ? 'Editar PDF' : 'Subir PDF',
            success: isEditMode ? 'Revista actualizada correctamente' : 'Revista creada correctamente',
            revista: isEditMode ? { id, ...revistaData } : null
        });

    } catch (err) {
        console.error('Error en el controlador:', err);

        // Limpieza en caso de error
        if (pdfFile?.path) fs.unlinkSync(pdfFile.path);
        if (imagenFile?.path) fs.unlinkSync(imagenFile.path);

        res.status(500).render('admin/agregarPDF', {
            pagina: isEditMode ? 'Editar PDF' : 'Subir PDF',
            error: 'Error al procesar la solicitud: ' + err.message,
            revista: req.body
        });
    }
};

const obtenerRevistaParaEditar = async (req, res) => {
    try {
        const revista = await Revistas.findByPk(req.params.id);
        
        if (!revista) {
            return res.redirect('/admin/revistas');
        }

        res.render('admin/agregarPDF', {
            pagina: 'Editar PDF',
            revista
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/revistas');
    }
};


const eliminarRevista = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la revista existe primero
        const revista = await Revistas.findByPk(id);
        
        if (!revista) {
            return res.status(404).redirect('/admin/revistas?error=Revista no encontrada');
        }

        // Eliminar el archivo de S3 si existe
        if (revista.s3_key) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: revista.s3_key
                }));
            } catch (s3Error) {
                console.error('Error al eliminar el PDF de S3:', s3Error);
                // Puedes decidir si quieres continuar o no si falla la eliminación en S3
                // En este caso continuamos para eliminar el registro de la DB igualmente
            }
        }

        // Eliminar la imagen del sistema de archivos si existe
        if (revista.imagen) {
            try {
                const imagePath = path.join(__dirname, '../public', revista.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (fsError) {
                console.error('Error al eliminar la imagen:', fsError);
            }
        }

        // Eliminar el registro de la base de datos
        await Revistas.destroy({ where: { id } });
        
        // Redirigir con parámetro de éxito en la URL
        res.redirect('/admin/lista-revistas?success=Revista eliminada correctamente');
    } catch (error) {
        console.error('Error al eliminar revista:', error);
        // Redirigir con parámetro de error en la URL
        res.redirect('/admin/revistas?error=Error al eliminar la revista');
    }
};

const listarRevistas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8; // Número de revistas por página
        const offset = (page - 1) * limit;

        const { count, rows: revistas } = await Revistas.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.toLocaleString('es-ES', { month: 'long' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        };
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const totalPages = Math.ceil(count / limit);

        res.render('admin/listaRevista', {
            pagina: 'Revistas Crisol',
            revistas,
            formatDate,
            formatFileSize,
            pagination: {
                currentPage: page,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
            
        });

    } catch (error) {
        console.error('Error al listar revistas:', error);
        res.status(500).render('error', {
            pagina: 'Error',
            mensaje: 'Ocurrió un error al cargar las revistas'
        });
    }
};

const mostrarContactos = async (req, res) => {
    try {
        console.log('Intentando obtener contactos...');
        
        // Verifica que el modelo esté conectado
        if (!Contacto.sequelize) {
            throw new Error('Modelo no está conectado a la base de datos');
        }

        const { favoritos } = req.query;
        const whereClause = favoritos === 'true' ? { favorito: true } : {};
        
        console.log('Consultando con whereClause:', whereClause);
        
        // Obtener contactos y total de favoritos en paralelo
        const [contactos, totalFavoritos] = await Promise.all([
            Contacto.findAll({
                where: whereClause,
                order: [
                    ['favorito', 'DESC'],
                    ['createdAt', 'DESC']
                ],
                raw: true
            }),
            Contacto.count({
                where: { favorito: true }
            })
        ]);

        console.log(`Contactos encontrados: ${contactos.length}`);
        console.log(`Total favoritos: ${totalFavoritos}`);
        
        res.render('admin/viewContacto', {
            pagina: favoritos === 'true' ? 'Contactos Favoritos' : 'Todos los Contactos',
            contactos,
            mostrarSoloFavoritos: favoritos === 'true',
            totalFavoritos,
            moment
        });

    } catch (error) {
        console.error('Error completo en mostrarContactos:', error);
        console.error('Stack trace:', error.stack);
        
        if (error.name === 'SequelizeDatabaseError') {
            console.error('Detalles del error SQL:', error.parent);
        }
        
        res.redirect('/admin/inicio');
    }
};


const toggleFavorito = async (req, res) => {
    try {
        const { favoritos } = req.query; // Capturar el estado del filtro
        const contacto = await Contacto.findByPk(req.params.id);
        
        if (!contacto) {
            req.flash('error', 'Contacto no encontrado');
            return res.redirect(`/admin/contactos${favoritos ? '?favoritos=true' : ''}`);
        }
        
        contacto.favorito = !contacto.favorito;
        await contacto.save();
        
        req.flash('exito', `Contacto ${contacto.favorito ? 'marcado' : 'desmarcado'} como favorito`);
        // Mantener el filtro actual después de la acción
        res.redirect(`/admin/contactos${favoritos ? '?favoritos=true' : ''}`);
    } catch (error) {
        console.error('Error en toggleFavorito:', error);
        // req.flash('error', 'Error al actualizar el favorito');
        res.redirect('/admin/contactos');
    }
};

// Eliminar contacto
const eliminarContacto = async (req, res) => {
    try {
        const resultado = await Contacto.destroy({
            where: { id: req.params.id }
        });
        
        if (resultado === 0) {
            req.flash('error', 'Contacto no encontrado');
        } else {
            req.flash('exito', 'Contacto eliminado correctamente');
        }
        
        res.redirect('/admin/contactos');
    } catch (error) {
        console.error('Error en eliminarContacto:', error);
        // req.flash('error', 'Error al eliminar el contacto');
        res.redirect('/admin/contactos');
    }
};

// const mostrarColaboraciones = async (req, res) => {
//     try {
//         const { favoritos, categoria } = req.query;
        
//         // Construir el where clause
//         const whereClause = {};
        
//         if (favoritos === 'true') {
//             whereClause.favorito = true;
//         }
        
//         if (categoria && ['1', '2', '3'].includes(categoria)) {
//             whereClause.categoria = categoria;
//         }
        
//         // Obtener colaboraciones y total de favoritos en paralelo
//         const [colaboraciones, totalFavoritos] = await Promise.all([
//             Colaboracion.findAll({
//                 where: whereClause,
//                 order: [
//                     ['favorito', 'DESC'],
//                     ['createdAt', 'DESC']
//                 ],
//                 raw: true
//             }),
//             Colaboracion.count({
//                 where: { favorito: true }
//             })
//         ]);
        
//         res.render('admin/viewColaboraciones', {
//             pagina: 'Colaboraciones',
//             colaboraciones,
//             mostrarSoloFavoritos: favoritos === 'true',
//             categoriaSeleccionada: categoria,
//             totalFavoritos,
//             categorias: [
//                 { value: '1', label: 'Categoría 1' },
//                 { value: '2', label: 'Categoría 2' },
//                 { value: '3', label: 'Categoría 3' }
//             ]
//         });

//     } catch (error) {
//         console.error('Error en mostrarColaboraciones:', error);
//         res.redirect('/admin/inicio');
//     }
// };


const mostrarColaboraciones = async (req, res) => {
    try {
        // Obtener parámetros de paginación (con valores por defecto)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // 10 items por página
        const offset = (page - 1) * limit;

        // Construir el where clause para los filtros
        const whereClause = {};
        
        if (req.query.favoritos === 'true') {
            whereClause.favorito = true;
        }
        
        if (req.query.categoria && [
            'Visión estudiantil', 
            'Mundo y política', 
            'Educación', 
            'Ciencia', 
            'Poesía', 
            'Arte', 
            'Cultura', 
            'Deporte', 
            'Noticiero estudiantil', 
            'Desafíos mentales'
        ].includes(req.query.categoria)) {
            whereClause.categoria = req.query.categoria;
        }
        
        // Obtener colaboraciones paginadas y total de registros en paralelo
        const [colaboraciones, totalItems] = await Promise.all([
            Colaboracion.findAll({
                where: whereClause,
                limit: limit,
                offset: offset,
                order: [
                    ['favorito', 'DESC'],
                    ['createdAt', 'DESC']
                ],
                raw: true
            }),
            Colaboracion.count({
                where: whereClause
            })
        ]);

        // Obtener total de favoritos (para el contador)
        const totalFavoritos = await Colaboracion.count({
            where: { favorito: true }
        });

        // Calcular total de páginas
        const totalPages = Math.ceil(totalItems / limit);

        res.render('admin/viewColaboraciones', {
            pagina: 'Colaboraciones',
            colaboraciones,
            mostrarSoloFavoritos: req.query.favoritos === 'true',
            categoriaSeleccionada: req.query.categoria || '',
            totalFavoritos,
            categorias: [
                { value: "Visión estudiantil", label: "Visión estudiantil" },
                { value: "Mundo y política", label: "Mundo y política" },
                { value: "Educación", label: "Educación" },
                { value: "Ciencia", label: "Ciencia" },
                { value: "Poesía", label: "Poesía" },
                { value: "Arte", label: "Arte" },
                { value: "Cultura", label: "Cultura" },
                { value: "Deporte", label: "Deporte" },
                { value: "Noticiero estudiantil", label: "Noticiero estudiantil" },
                { value: "Desafíos mentales", label: "Desafíos mentales" }
            ],
            // Variables de paginación
            currentPage: page,
            totalPages,
            totalItems,
            limit
        });

    } catch (error) {
        console.error('Error en mostrarColaboraciones:', error);
        res.redirect('/admin/inicio');
    }
};

const toggleFavoritoColaboracion = async (req, res) => {
    try {
        const { id } = req.params;
        const { favoritos, categoria, page } = req.query;
        
        const colaboracion = await Colaboracion.findByPk(id);
        
        if (!colaboracion) {
            return res.status(404).json({ error: 'Colaboración no encontrada' });
        }
        
        colaboracion.favorito = !colaboracion.favorito;
        await colaboracion.save();
        
        // Redirigir manteniendo los parámetros de filtro y paginación
        const queryParams = new URLSearchParams();
        if (favoritos) queryParams.append('favoritos', favoritos);
        if (categoria) queryParams.append('categoria', categoria);
        if (page) queryParams.append('page', page);
        
        res.redirect(`/admin/colaboraciones?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error en toggleFavorito:', error);
        res.redirect('/admin/colaboraciones');
    }
};

const eliminarColaboracion = async (req, res) => {
    try {
        const { id } = req.params;
        const { favoritos, categoria, page } = req.query;
        
        await Colaboracion.destroy({ where: { id } });
        
        // Redirigir manteniendo los parámetros de filtro y paginación
        const queryParams = new URLSearchParams();
        if (favoritos) queryParams.append('favoritos', favoritos);
        if (categoria) queryParams.append('categoria', categoria);
        if (page) queryParams.append('page', page);
        
        res.redirect(`/admin/colaboraciones?${queryParams.toString()}`);
    } catch (error) {
        console.error('Error en eliminarColaboracion:', error);
        res.redirect('/admin/colaboraciones');
    }
};

// controllers/colaboracionesController.js
const verColaboracionIndividual = async (req, res) => {
    try {
        const { id } = req.params;
        
        const colaboracion = await Colaboracion.findByPk(id);
        
        if (!colaboracion) {
            return res.status(404).render('error', {
                mensaje: 'Colaboración no encontrada'
            });
        }
        
        // Definir las categorías aquí
        const categorias = [
            { value: "Visión estudiantil", label: "Visión estudiantil" },
            { value: "Mundo y política", label: "Mundo y política" },
            { value: "Educación", label: "Educación" },
            { value: "Ciencia", label: "Ciencia" },
            { value: "Poesía", label: "Poesía" },
            { value: "Arte", label: "Arte" },
            { value: "Cultura", label: "Cultura" },
            { value: "Deporte", label: "Deporte" },
            { value: "Noticiero estudiantil", label: "Noticiero estudiantil" },
            { value: "Desafíos mentales", label: "Desafíos mentales" }
        ];
        
        res.render('admin/verColaboracion', {
            colaboracion,
            categorias, // Asegúrate de pasar las categorías a la vista
            pagina: `Colaboración: ${colaboracion.titulo}`
        });
        
    } catch (error) {
        console.error('Error al mostrar colaboración individual:', error);
        res.redirect('/admin/colaboraciones');
    }
};


const formularioPDF = (req, res) => {
    res.render('admin/agregarPDF', {
        pagina: 'Agregar revista',
    });
};


export {
    inicio,
    cerrarSesion,
    verNoticias,
    formularioRegistroNoticias,
    formularioEditarNoticia,
    formularioEditarNoticias,
    eliminarNoticia,
    obtenerNoticia,
    actualizarNoticia,
    registrarNoticia,
    formularioIcono,
    actualizarIcono,
    formularioColor,
    uploadPdfController,
    formularioPDF,
    obtenerRevistaParaEditar,
    listarRevistas,
    eliminarRevista,
    actualizarColores,
    mostrarContactos,
    eliminarContacto,
    toggleFavorito,
    mostrarColaboraciones,
    eliminarColaboracion,
    toggleFavoritoColaboracion,
    verColaboracionIndividual,
    mostrarSlides,
    actualizarSlide,
    mostrarFormularioCrear,
    agregarArticulo,
    registrarArticulo,
    actualizarArticulo,
    verArticulos,
    verDetalleArticulo,
    eliminarArticulo,
    formEditarArticulo
};