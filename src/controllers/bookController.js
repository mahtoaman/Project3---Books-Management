const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");

const createBooks = async function (req, res) {
  try {
    let data = req.body;
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      data;

    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Plz provide data to create book" });
    }

    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "title is required" });
    }

    // ======================== for unique title ============================================================

    const duplicateTitle = await bookModel.findOne({ title: title });
    if (!duplicateTitle) {
      return res
        .status(400)
        .send({ status: false, messaage: "Title is already Exist" });
    }
    if (!excerpt) {
      return res
        .status(400)
        .send({ status: false, message: "excerpt field is mandatory" });
    }
    if (!userId) {
      return res
        .status(400)
        .send({ status: false, message: "userId is required" });
    }
    const duplicateuserId = await userModel.findOne({ userId: userId });
    if (!duplicateuserId) {
      return res
        .status(400)
        .send({ status: false, message: "userId is already Exist" });
    }
    if (!ISBN) {
      return res
        .status(400)
        .send({ status: false, message: "ISBN is required" });
    }
    const duplicateISBN = await bookModel.findone({ ISBN: ISBN });
    if (!duplicateISBN) {
      return res
        .status(400)
        .send({ status: false, message: "ISbN is already Exist" });
    }
  } catch {}
};


//=========================================GET BOOKS=====================================

const bookModel = require("../models/bookModel");

const getAllBooks = async function (req, res) {
  try {
    data = req.query;

    const findBooks = await bookModel.find
      .select({
        title: title,
        excerpt: excerpt,
        userId: userId,
        category: category,
        releasedAt: releasedAt,
        reviews: reviews,
      })
      .sort({ title: title });

    if (findBooks.length == 0) {
      return res.status(404).send({ status: true, msg: "No book found." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: err.message });
  }
};

module.exports.getAllBooks = getAllBooks;
module.exports.createBooks = createBooks;