import { DataTypes } from "sequelize";
import db from "../config/db.js";


const Logo = db.define('iconos',{
    img_url:{
        type: DataTypes.TEXT,
        allowNull: false 
    },
});

export default Logo