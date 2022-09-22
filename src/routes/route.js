const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')

router.get("/test-me", function (req, res) {
  res.send("My first ever api!");
});

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post("/books", bookController.createBooks);
router.get("/books", bookController.getBooks);
router.delete("/books/:bookId", bookController.deleteBookById);
router.put("/books/:bookId", bookController.updateBookById);


module.exports = router;