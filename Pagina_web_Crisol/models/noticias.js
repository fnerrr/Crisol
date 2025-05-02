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
    s3_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
});

export default Noticias