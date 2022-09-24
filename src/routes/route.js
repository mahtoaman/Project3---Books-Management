const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')

router.get("/test-me", function (req, res) {
  res.send("My first ever api!");
});

router.post("/register", userController.createUser);
router.post("/login", userController.login);

router.post("/books", bookController.createBooks);
router.get("/books/", bookController.getBooks);
router.get("/books/:bookId", bookController.getBookById);
router.delete("/books/:bookId", bookController.deleteBookById);
router.put("/books/:bookId", bookController.updateBookById);

router.post("/books/:bookId/review", reviewController.createReview);
router.put("books/:bookId/review/:reviewId", reviewController.updateReview);
router.delete("books/:bookId/review/:reviewId", reviewController.deleteReviewById);


module.exports = router;