// models/configuracion.js
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Configuracion = db.define('configuraciones', {
    color_principal: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    color_textoPrimario: {
        type: DataTypes.TEXT,
        allowNull: false 
    },
    color_textoSecundario: {
        type: DataTypes.TEXT,
        allowNull: false 
    }
});

export default Configuracion;