import { DataTypes } from "sequelize";
import db from "../config/db.js";


const Usuario = db.define('usuarios',{
    username:{
        type: DataTypes.STRING,
        allowNull: false 
    },
    password:{
        type: DataTypes.STRING,
    },
});

export default Usuario