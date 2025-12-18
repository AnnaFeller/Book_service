import {Author, Book, Publisher} from "../model/index.js";
import {sequelize} from "../config/database.js";

export const addBook = async (req, res) => {
    const t = await sequelize.transaction({readOnly: true});
    try {
        const {isbn, title, authors, publisher} = req.body;
        const existingBook = await Book.findByPk(isbn);
        if (existingBook) {
            await t.rollback();
            return res.status(409).send({
                error: `Book with ISBN ${isbn} already exists`
            });
        }
        // Create or find the publisher
        if (!await Publisher.findByPk(publisher, {transaction: t})) {
            await Publisher.create({publisher_name: publisher}, {transaction: t});
        }
        // Process the authors
        const authorRecords = [];
        for (const author of authors) {
            let authorRecord = await Author.findByPk(author.name, {transaction: t});
            if (!authorRecord) {
                authorRecord = await Author.create({
                    name: author.name,
                    birth_date: new Date(author.birthDate)
                }, {transaction: t});
            }
            if (authorRecords.findIndex(a => a.name === authorRecord.name) === -1) {
                authorRecords.push(authorRecord);
            }
        }
        // Create a new book
        const book = await Book.create({isbn, title, publisher}, {transaction: t});
        await book.setAuthors(authorRecords, {transaction: t});
        await t.commit();
        return res.status(201).send();
    } catch (e) {
        await t.rollback();
        console.error('Error adding book:', e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to add book'
        });
    }
}

export const findBookByIsbn = async (req, res) => {
    const book = await Book.findByPk(req.params.isbn,
        {include: [{model: Author, as: 'authors',attributes:{
            include:[[sequelize.col('birth_date'),'birthDate']],
                    exclude:['birth_date']
                } ,through: {attributes: []}}]});
    if (book) {
        book.authors = book.dataValues.authors.map(a => ({name:a.name,birthDate:a.birth_date}))
        return res.json(book);
    } else {
        return res.status(404).send({error: `Book with ISBN ${req.params.isbn} not found`});
    }
}

export const updateBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { isbn } = req.params;
        const { title, publisher } = req.body || {};
        if (!title && !publisher) {
            return res.status(400).send({ error: "Nothing to update" });
        }

        const book = await Book.findByPk(isbn, { transaction: t });
        if (!book) {
            await t.rollback();
            return res.status(404).send({ error: `Book with ISBN ${isbn} not found` });
        }

        if (publisher) {
            // Создаем или находим издателя
            let pub = await Publisher.findByPk(publisher, { transaction: t });
            if (!pub) {
                pub = await Publisher.create({ publisher_name: publisher }, { transaction: t });
            }
            book.publisher = publisher;
        }
        if (title) {
            book.title = title;
        }

        await book.save({ transaction: t });
        await t.commit();
        return res.status(200).send(book);
    } catch (e) {
        await t.rollback();
        return res.status(500).send({ error: e.message });
    }
};

export const updateBookTitle = async (req, res) => {
    try {
        const { isbn, title } = req.params; // берем title из URL
        const book = await Book.findByPk(isbn);
        if (!book) return res.status(404).send({ error: `Book with ISBN ${isbn} not found` });

        book.title = title;
        await book.save();
        return res.status(200).send(book);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
};

export const findBooksByAuthor = async (req, res) => {
    try {
        const authorName = req.params.author; // совпадает с маршрутом
        const author = await Author.findByPk(authorName, { include: 'books' });
        if (!author) return res.status(404).send({ error: `Author ${authorName} not found` });

        return res.json(author.books);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
};


export const findBooksByPublisher = async (req, res) => {
    try {
        const publisherName = req.params.publisher; // совпадает с маршрутом
        const publisher = await Publisher.findByPk(publisherName, { include: 'books' });
        if (!publisher) return res.status(404).send({ error: `Publisher ${publisherName} not found` });

        return res.json(publisher.books);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
};


export const findBookAuthors = async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.isbn, { include: 'authors' });
        if (!book) return res.status(404).send({ error: `Book with ISBN ${req.params.isbn} not found` });

        return res.json(book.authors);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
};

export const findPublisherByAuthor = async (req, res) => {
    try {
        const authorName = req.params.author; // совпадает с маршрутом
        const author = await Author.findByPk(authorName, {
            include: { model: Book, as: 'books', include: 'publisherDetails' }
        });

        if (!author) return res.status(404).send({ error: `Author ${authorName} not found` });

        const publishers = author.books.map(b => b.publisherDetails).filter(Boolean);
        return res.json(publishers);
    } catch (e) {
        return res.status(500).send({ error: e.message });
    }
};


export const removeAuthor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const authorName = req.params.author; // совпадает с маршрутом
        const author = await Author.findByPk(authorName, { transaction: t });
        if (!author) {
            await t.rollback();
            return res.status(404).send({ error: `Author ${authorName} not found` });
        }

        await author.setBooks([], { transaction: t });
        await author.destroy({ transaction: t });
        await t.commit();
        return res.status(200).send({ message: `Author ${authorName} removed` });
    } catch (e) {
        await t.rollback();
        return res.status(500).send({ error: e.message });
    }
};
