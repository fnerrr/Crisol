import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import Revistas from '../models/revistas.js';

const Slider = db.define('sliders', {
    imagen: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '/images/slide-default.jpg', // Imagen por defecto
        comment: 'Ruta relativa de la imagen del slide'
    },
    revista_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'revistas',
            key: 'id'
        }
    },
    posicion: { // Nueva columna para identificar posición fija (1-4)
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
            min: 1,
            max: 4
        }
    }
});

Slider.belongsTo(Revistas, {
    foreignKey: 'revista_id',
    as: 'revista'
});

export default Slider;