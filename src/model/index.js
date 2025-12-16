import Book from "./book.model.js";
import Publisher from "./publisher.model.js";
import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";
import Author from "./author.model.js";

// Book and Publisher: Many-To-One relationship
Book.belongsTo(Publisher, {
    foreignKey: "publisher",
    targetKey: "publisher_name",
    as: "publisherDetails"
});

Publisher.hasMany(Book, {
    foreignKey: "publisher",
    sourceKey: "publisher_name",
    as: "books"
})

// Define the junction table
const BooksAuthors = sequelize.define('BooksAuthors', {
    isbn: {
        type: DataTypes.STRING,
        references: {
            model: Book,
            key: 'isbn'
        }
    },
    author_name: {
        type: DataTypes.STRING,
        references: {
            model: Author,
            key: 'name'
        }
    }
}, {
    tableName: 'books_authors'
})

// Book and Author: Many-To-Many relationship
Book.belongsToMany(Author, {
    through: BooksAuthors,
    foreignKey: 'isbn',
    otherKey: 'author_name',
    as: 'authors'
});
Author.belongsToMany(Book, {
    through: BooksAuthors,
    foreignKey: 'author_name',
    otherKey: 'isbn',
    as: 'books'
});

const syncModels = async () => {
    try {
        await sequelize.sync();
        console.log('Models synced successfully.');
    } catch (e) {
        console.log("Error syncing models:", e);
    }
}

export {syncModels, Book, Publisher, Author}