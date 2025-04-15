import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Articulo = db.define('articulos', {
    titulo: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false 
    },
    categoria: {
        type: DataTypes.ENUM(
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
        ),
        allowNull: false 
    },
    img: {
        type: DataTypes.TEXT,
        allowNull: false 
    },
    nombreAutor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ocupacionAutor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imgAutor: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

export default Articulo;