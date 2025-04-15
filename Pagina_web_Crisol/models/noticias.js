import { DataTypes } from "sequelize";
import db from "../config/db.js";


const Noticias = db.define('noticias',{
    Titulo:{
        type: DataTypes.STRING,
        allowNull: false 
    },
    url:{
        type: DataTypes.TEXT,
        allowNull: false 
    },
    img:{
        type: DataTypes.TEXT,
        allowNull: false 
    },
});

export default Noticias