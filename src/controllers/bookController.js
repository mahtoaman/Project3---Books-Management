const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");
const {isValidId,isValidName, isValidBody, isValidDate, isValidISBN} = require('../validators/validator')

const createBooks = async function (req, res) {
  try {
    data = req.body;
    const {
      title,excerpt, userId, ISBN,category,subcategory,releasedAt } = data;

    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "PLz provide data to create book" });
  
    if (!title || !isValidName(title.trim()))
      return res
        .status(400)
        .send({ status: false, msg: "Title is required" });
    
    let isUniqueTitle = await bookModel.findOne({"title":title})
    if(isUniqueTitle)
       return res
         .status(400)
         .send({ status: false, msg: "This book already exist" });
              
    if (!excerpt || !isValidName(excerpt.trim()))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Excerpt in a valid format" });

    if (!userId || !isValidId(userId))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide a valid userId" });

    if (!ISBN || !isValidISBN(ISBN))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide ISBN" });

    let duplicateISBN = await bookModel.findOne({ ISBN });
    if (duplicateISBN)
      return res
        .status(400)
        .send({ status: false, msg: "ISBN is already registered!" });

    if (!category || !isValidName(category))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Category in a valid format" });

    if (!subcategory || !isValidName(subcategory))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Subcategory" });
  
    if (!releasedAt || !isValidDate(releasedAt))
      return res
        .status(400)
        .send({
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

    const book = await bookModel
      .find(input, { isDeleted: false })
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
        createdAt: 0,
        updatedAt: 0,
        subcategory: 1,
        deletedAt: 0,
        __v: 0,
      }); //.sort({title: 1})

    if (book.length == 0)
      return res
        .status(404)
        .send({ status: false, msg: "no such  data found" });
    const sortedBooks = book.sort((a, b) => a.title.localeCompare(b.title));
    return res
      .status(200)
      .send({ status: true, msg: "Book lists", data: sortedBooks });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//====================DELETE BY ID============================================
const deleteBooksById = async function (req, res) {
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

module.exports.getBooks = getBooks;
module.exports.createBooks = createBooks;
module.exports.deleteBooksById = deleteBooksById;
