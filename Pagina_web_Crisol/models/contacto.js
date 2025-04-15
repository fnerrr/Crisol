import { DataTypes } from "sequelize";
import db from "../config/db.js";


const Contacto = db.define('contactos',{
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellidos: {
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
    comentario: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    favorito: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

export default Contacto