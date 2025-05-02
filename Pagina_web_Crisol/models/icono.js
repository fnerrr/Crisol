import { DataTypes } from "sequelize";
import db from "../config/db.js";


const Logo = db.define('iconos',{
    img_url:{
        type: DataTypes.TEXT,
        allowNull: false 
    },
    s3_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
});

export default Logo