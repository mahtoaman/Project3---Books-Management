const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");

const {
  isValidId,
  isValidName,
  isValidBody,
  isValidDate,
  isValidISBN,
  isValid,
  isValidRating,
} = require("../validators/validator");

//==============================CREATE BOOK==================================================
const createBooks = async function (req, res) {
  try {
    data = req.body;
    const {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt,
      reviews,
    } = data;

    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "Please provide data to create book" });

    if (req.decoded.userId != userId)
      return res
        .status(403)
        .send({ status: false, msg: "you are not authorised" });

    if (!title || !isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });

    let isUniqueTitle = await bookModel.findOne({ title: title });
    if (isUniqueTitle)
      return res
        .status(400)
        .send({ status: false, message: "This book already exist" });

    if (!excerpt || !isValidName(excerpt))
      return res.status(400).send({
        status: false,
        message:
          "Please Provide Excerpt in a valid format it contains only alphabets",
      });

   

    let isUserPresent = await userModel.findById(userId);
    if (!isUserPresent)
      return res
        .status(400)
        .send({ status: false, message: "User is not present" });

    if (!ISBN || !isValidISBN(ISBN))
      return res.status(400).send({
        status: false,
        message: "Please Provide ISBN in a valid format",
      });

    let duplicateISBN = await bookModel.findOne({ ISBN });
    if (duplicateISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN is already registered!" });

    if (!category || !isValid(category))
      return res.status(400).send({
        status: false,
        message:
          "Please Provide Category in a valid format, type should be string",
      });

    if (!subcategory || !isValidName(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Subcategory" });

    if (!releasedAt || !isValidDate(releasedAt))
      return res.status(400).send({
        status: false,
        message: "Please enter valid release date in YYYY-MM-DD format",
      });

    // if(reviews && !isValidRating(reviews))
    // return res.status(400).send({
    //   status: false,
    //   message: "Please enter reviews in a valid format, it contains only numbers",
    // });

    const bookCreation = await bookModel.create(data);
    res.status(201).send({
      status: true,
      message: "Book Created Successfully",
      data: bookCreation,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//=================================GET BOOKS BY FILTER=====================================

const getBooks = async (req, res) => {
  try {
    const input = req.query;
    const { userId, category, subcategory } = input;

    if (!isValidBody(input))
      return res
        .status(400)
        .send({ status: false, message: "Please provide atleast one param!" });

    if (userId && !isValidId(userId))
      return res
        .status(400)
        .send({ status: false, message: "userId is invalid!" });

    if (category && !isValid(category))
      return res
        .status(400)
        .send({ status: false, message: "Category is invalid!" });

    if (subcategory && !isValid(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "subcategory is invalid!" });

    input["isDeleted"] = false;

    const bookList = await bookModel.find(input).select({
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      reviews: 1,
      releasedAt: 1,
    }).sort('title');

    if (bookList.length === 0)
      return res.status(404).send({ status: false, message: "No book found!" });

    return res
      .status(200)
      .send({ status: true, message: "Books list", data: bookList });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//====================GET BOOK BY ID==========================================
const getBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid bookId!" });

    let getBook = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .lean();
    if (!getBook)
      return res
        .status(404)
        .send({ status: false, message: "No book found with given bookId" });

    let getReviews = await reviewModel
      .find({
        bookId: bookId,
        isDeleted: false,
      })
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, _id: 0, __v:0 });

    getBook["reviewsData"] = getReviews;
    return res
      .status(200)
      .send({ status: true, message: "Book List", data: getBook });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
//====================DELETE BY ID============================================

const deleteBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!isValidId(bookId))
      return res.status(400).send({ status: false, message: "Invalid bookId" });

    let bookDetails = await bookModel.findById({
      _id: bookId,
      isDeleted: false,
    });

    if (!bookDetails)
      return res
      .status(404)
      .send({ status: false, message: "book not found" });

    let deleteBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: `${deleteBook.title} successfully deleted`,
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

//==============================UPDATE BOOK ==================================

const updateBookById = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const data = req.body;

    if (!isValidId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "BookId is not valid" });
    }

    let isBookPresent = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!isBookPresent) {
      return res.status(400).send({ status: false, message: "Book not found" });
    }
    if (!isValidBody(data))
      return res.status(400).send({
        status: false,
        message: " Update request rejected no data is found to update",
      });

    const { title, excerpt, releasedAt, ISBN } = data;

    if (title && !isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "title type must be in string" });

    const titleExist = await bookModel.findOne({ title });
    if (titleExist)
      return res
        .status(400)
        .send({ status: false, message: "Use different title" });

    if (ISBN && !isValidISBN(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid ISBN" });

    const existISBN = await bookModel.findOne({ ISBN });
    if (existISBN)
      return res
        .status(400)
        .send({ status: false, message: "Use different ISBN" });

    if (excerpt && !isValidName(excerpt))
      return res.status(400).send({
        status: false,
        message: "Invalid excerpt",
      });

    if (releasedAt && !isValidDate(releasedAt))
      return res.status(400).send({
        status: false,
        message: "releasedAt type must be in string in YYYY/MM/DD format",
      });

    const updateBook = await bookModel.findByIdAndUpdate(
      { _id: bookId },
      {
        $set: {
          title: title,
          excerpt: excerpt,
          releasedAt: releasedAt,
          ISBN: ISBN,
        },
      },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Success", data: updateBook });
  } catch (err) {
    return res.status(500).send({ status: false, message: "server error" });
  }
};

module.exports.createBooks = createBooks;
module.exports.getBooks = getBooks;
module.exports.getBookById = getBookById;
module.exports.deleteBookById = deleteBookById;
module.exports.updateBookById = updateBookById;
