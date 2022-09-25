const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const {
  isValidId,
  isValidBody,
  isValidRating,
  isValidName,
  isValidDate,
  isValid,
} = require("../validators/validator");

// =============================== CREATE REVIEW ==========================================================

const createReview = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const data = req.body;
    const { reviewedBy, rating, review, isDeleted, reviewedAt } = data;

    if (!isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "book Id id not valid" });

    const existBook = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!existBook) {
      return res.status(404).send({ status: false, message: "Book not found" });
    }

    if (!isValidBody(data))
      return res.status(400).send({
        status: false,
        message: "Data is required to create review",
      });

    // if (!req.body.bookId || !isValidId(req.body.bookId)) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "bookId is required in a valid format",
    //   });
    // }

    if (!reviewedBy) data["reviewedBy"] = "Guest";
    if (reviewedBy && !isValidName(reviewedBy))
      return res.status(400).send({
        status: false,
        message: "reviewedBy is required in a string format",
      });

    if (!reviewedAt) data["reviewedAt"] = new Date();

    if (reviewedAt && isValidDate(reviewedAt))
      return res.status(400).send({
        status: false,
        message: "reviewdAt is required in YYYY/MM/DD format",
      });

    if (!rating || !isValidRating(rating))
      return res.status(400).send({
        status: false,
        message: "Rating is required b/w 1 to 5 and accepted format is number",
      });

    if (!review || !isValid(review))
      return res.status(400).send({
        status: false,
        message: "Review is required in string format",
      });

    if (isDeleted && typeof isDeleted !== "boolean")
      return res.status(400).send({
        status: false,
        message: "isDeleted type must be in boolean",
      });

    const createReview = await reviewModel.create(data);
    const updateBookReview = await bookModel
      .findOneAndUpdate(
        { _id: bookId, isDeleted: false },
        { $inc: { reviews: 1 } },
        { new: true }
      )
      .lean();
    updateBookReview["reviewsData"] = createReview;

    data["bookId"] = bookId;
    return res.status(200).send({
      status: true,
      message: "Success",
      data: updateBookReview,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//===================update Review===========================================
const updateReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    let data = req.body;
    let { review, rating, reviewedBy } = data;

    if (!isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "bookId is not valid" });

    const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book)
      return res.status(404).send({
        status: false,
        message: "Book not found",
      });

    if (!isValidId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid reviewId" });

    const rev = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
    if (!rev)
      return res.status(404).send({
        status: false,
        message: "Review not found",
      });

    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "Please add some data for updates" });

    if (rating && !isValidRating(rating))
      return res.status(400).send({
        status: false,
        message: "Rating is required b/w 1 to 5 and accepted format is number",
      });

    if (review && !isValid(review))
      return res.status(400).send({
        status: false,
        message: "Review is required in string format",
      });

    if (reviewedBy && !isValidName(reviewedBy))
      return res.status(400).send({
        status: false,
        message: "reviewedBy is required in a string format",
      });
    let getBook = await bookModel.findById(bookId).lean();
    let updateReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      {
        $set: {
          review: review,
          rating: rating,
          reviewedBy: reviewedBy,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );
    getBook["reviewData"] = updateReview;

    return res
      .status(200)
      .send({ status: true, message: "Reviews updated", data: getBook });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//===========================delete Review by Id======================================
const deleteReviewById = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    if (!bookId || !isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid bookId" });

    const findBooksbyId = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!findBooksbyId)
      return res
        .status(404)
        .send({ status: false, message: "Books not found" });

    if (!reviewId || !isValidId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid reviewId" });

    const findReview = await reviewModel.findOne({
      _id: reviewId,
      isDeleted: false,
    });

    if (!findReview)
      return res.status(404).send({
        status: false,
        message: "review not found",
      });

    await reviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

await bookModel.findOneAndUpdate(
    {_id:bookId},
    {$set:{reviews:-1}},
    {new:true}
)
    return res.status(200).send({
      status: true,
      message: `Review deleted successfully!`
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReviewById = deleteReviewById;
