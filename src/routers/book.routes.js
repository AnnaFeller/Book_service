import express from "express";
import {
    addBook, findBookAuthors,
    findBookByIsbn,
    findBooksByAuthor,
    findBooksByPublisher, findPublisherByAuthor, removeAuthor,
    updateBookTitle
} from "../controller/book.controller.js";

const router = express.Router();

router.post("/book", addBook);
router.get("/book/:isbn", findBookByIsbn);
router.patch("/book/:isbn/title/:title",updateBookTitle );
router.get("/books/author/:author",findBooksByAuthor)
router.get("/books/publisher/:publisher",findBooksByPublisher)
router.get("/authors/book/:isbn",findBookAuthors)
router.get("/publishers/author/:author",findPublisherByAuthor)
router.delete("/author/:author",removeAuthor)



export default router;