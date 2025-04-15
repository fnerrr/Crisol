import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Colaboracion = db.define('colaboraciones', {
    // Definición de los campos del modelo
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    categoria: {
        type: DataTypes.ENUM("Visión estudiantil", "Mundo y política", "Educación", "Ciencia", "Poesía", "Arte", "Cultura", "Deporte", "Noticiero estudiantil", "Desafíos mentales"),
        allowNull: false
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING, // Guardar la ruta de la imagen
        allowNull: true
    },
    favorito: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
});


export default Colaboracion