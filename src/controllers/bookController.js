const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");
const {isValidId,isValidName, isValidBody} = require('../validators/validator')

const createBooks = async function (req, res) {
  try {
    data = req.body;
    const {
      title,excerpt, userId, ISBN,category,subcategory,reviews,releasedA } = data;

    if (!isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "PLz provide data to create book" });
    }
    if (!title || !isValidName(title.trim()))
      return res
        .status(400)
        .send({ status: false, msg: "Title is required" });
    
    let isUniqueTitle = await bookModel.findOne({"title":title})
    if(isUniqueTitle){
       return res
         .status(400)
         .send({ status: false, msg: "This book already exist" });
    }
      
    if (!excerpt)
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Excerpt" });

    if (!userId || !isValidId(userId))
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide a valid userId" });

    if (!ISBN)
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide ISBN" });

    let duplicateISBN = await bookModel.findOne({ ISBN });
    if (duplicateISBN)
      return res
        .status(400)
        .send({ status: false, msg: "ISBN is already registered!" });

    if (!category)
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Category" });
    if (!subcategory)
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide Subcategory" });

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

const getBooks = async function (req, res) {
  try {
    const query = req.query;
    const filter = {
      ...query, 
      isDeleted: false,
    };
console.log(query)
    const findBooks = await bookModel
      .find(filter)
      .select({
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
      })
      .sort({ title: 1 }); 
      console.log(findBooks)

    if (findBooks.length == 0) {
      return res.status(404).send({ status: true, msg: "No book found." });
    }

    if (query.userId != req.userId) {
      return res.status(403).send({
        status: false,
        message: "Unauthorized access.",
      });
    }

    res.status(200).send({ status: true, msg: "Books list", data: findBooks });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: err.message });
  }
};

module.exports.getBooks = getBooks;
module.exports.createBooks = createBooks;
