import { DataTypes } from 'sequelize';
import db from '../config/db.js'; // Importa la instancia de Sequelize (db)

const Revistas = db.define('revistas', {
    titulo: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imagen: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    s3_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    tamanio: {
        type: DataTypes.INTEGER, // Almacena el tamaño en bytes
        allowNull: true,
    },
});

export default Revistas;