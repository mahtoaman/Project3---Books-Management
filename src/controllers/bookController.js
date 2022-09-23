const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");

const {
  isValidId,
  isValidName,
  isValidBody,
  isValidDate,
  isValidISBN,
} = require("../validators/validator");

const createBooks = async function (req, res) {
  try {
    data = req.body;
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      data;

    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "PLz provide data to create book" });

    if (!title || !isValidName(title))
      return res.status(400).send({ status: false, msg: "Title is required" });

    let isUniqueTitle = await bookModel.findOne({ title: title });
    if (isUniqueTitle)
      return res
        .status(400)
        .send({ status: false, msg: "This book already exist" });

    if (!excerpt || !isValidName(excerpt.trim()))
      return res.status(400).send({
        status: false,
        msg: "Please Provide Excerpt in a valid format",
      });

    if (!userId || !isValidId(userId))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide a valid userId" });

    let isUserPresent = await userModel.findById(userId);
    if (!isUserPresent)
      return res
        .status(400)
        .send({ status: false, msg: "User is not present" });

    if (!ISBN || !isValidISBN(ISBN.trim()))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide ISBN" });

    let duplicateISBN = await bookModel.findOne({ ISBN });
    if (duplicateISBN)
      return res
        .status(400)
        .send({ status: false, msg: "ISBN is already registered!" });

    if (!category || !isValidName(category.trim()))
      return res.status(400).send({
        status: false,
        msg: "Please Provide Category in a valid format",
      });

    if (!subcategory || !isValidName(subcategory.trim()))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Subcategory" });

    if (!releasedAt || !isValidDate(releasedAt))
      return res.status(400).send({
        status: false,
        message: "Please enter valid release date in YYYY-MM-DD format",
      });

    const bookCreation = await bookModel.create(data);
    res.status(201).send({
      status: true,
      msg: "Book Created Successfully",
      data: bookCreation,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//=================================GET BOOKS=====================================

const getBooks = async (req, res) => {
  try {
    const input = req.query;
    const filter = { isDeleted: false }; // Object Manupulation
    const { userId, category, subcategory } = input; // Destructuring

    if (!isValidBody(input))
      return res
        .status(400)
        .send({ status: false, msg: "Please provide atleast one param!" });

    if (userId) {
      // Nested If Else used here
      if (!objectValue(userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "userId is invalid!" });
      }
      if (!isValidId(userId)) {
        return res
          .status(400)
          .send({ status: false, msg: "userId is invalid!" });
      } else {
        filter.userId = userId;
      }
    }
    if (objectValue(category)) {
      filter.category = category.trim();
    }
    if (objectValue(subcategory)) {
      const subcategoryArray = subcategory
        .trim()
        .split(",")
        .map((s) => s.trim());
      filter.subcategory = { $all: subcategoryArray }; // The $all operator selects the documents where the value of a field is an array that contains all the specified elements.
    }

    const bookList = await bookModel.find(filter).select({
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      review: 1,
      releasedAt: 1,
    });

    if (bookList.length === 0)
      return res.status(400).send({ status: false, msg: "no book found!" }); // DB Validation

    const sortedBooks = bookList.sort((a, b) => a.title.localeCompare(b.title)); // Sorting in Alphabetical Order
    // The localeCompare() method returns a number indicating whether a reference string comes before, or after, or is the same as the given string in sort order.

    res
      .status(200)
      .send({ status: true, message: "Books list", data: sortedBooks });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//====================DELETE BY ID============================================

const deleteBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    if (!bookId) {
      return res.status(401).send({ status: false, msg: "bookId is required" });
    }
    let bookDetails = await bookModel.findById({ _id: bookId });
    if (!bookDetails || bookDetails.isDeleted == true) {
      return res.status(404).send({ status: false, msg: "book not found" });
    }
    let deleteBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).send({ status: true, msg: deleteBook });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

//===================================UPDATE BY ID==================================

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
      return res
        .status(400)
        .send({ status: false, message: "No book found with given Id" });
    }
    if (!isValidBody(data))
      return res.status(400).send({
        status: false,
        messaage: " Update request rejected no data is found to update",
      });

    const { title, excerpt, releasedAt, ISBN } = data;

    if (title && !isValidName(title.trim()))
      return res
        .status(400)
        .send({ status: false, messaage: "title type must be in string" });

    const titleExist = await bookModel.findOne({ title });
    if (titleExist)
      return res
        .status(400)
        .send({ status: false, messaage: "Use different title" });

    if (ISBN && !isValidISBN(ISBN.trim()))
      return res
        .status(400)
        .send({ status: false, messaage: "Not a valid ISBN" });

    const existISBN = await bookModel.findOne({ ISBN });
    if (existISBN)
      return res
        .status(400)
        .send({ status: false, messaage: "Use different ISBN" });

    if (excerpt && !isValidName(excerpt.trim()))
      return res.status(400).send({
        status: false,
        messaage: "Invalid excerpt",
      });

    if (releasedAt && !isValidDate(releasedAt))
      return res.status(400).send({
        status: false,
        messaage: "releasedAt type must be in string in YYYY/MM/DD format",
      });

    const updateBook = await bookModel.findByIdAndUpdate(
      { _id: bookId, isDeleted: false },
      {
        $set: {
          title: title,
          excerpt: excerpt,
          releasedAt: releasedAt,
          ISBN: ISBN,
          isPublished: true,
          publishedAt: new Date(),
        },
      },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, messaage: "successful", data: updateBook });
  } catch (err) {
    return res.status(500).send({ status: false, messaage: "server error" });
  }
};

module.exports.getBooks = getBooks;
module.exports.createBooks = createBooks;
module.exports.deleteBookById = deleteBookById;
module.exports.updateBookById = updateBookById;
