import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

const Publisher= sequelize.define('Publisher', {
        publisher_name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            validate: {
                notEmpty: true,
            }
        }
    }, {
    tableName: 'publisher',
timestamps: false})

export default Publisher;