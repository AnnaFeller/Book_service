import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

const Book = sequelize.define('Book', {
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    tableName: 'books',
    timestamps: false
})
export default Book;