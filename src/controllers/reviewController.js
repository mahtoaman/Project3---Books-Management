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

    if (!req.body.bookId || !isValidId(req.body.bookId)) {
      return res.status(400).send({
        status: false,
        message: "bookId is required in a valid format",
      });
    }

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
    const updateBookReview = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { $inc: { reviews: 1 } },
      { new: true }
    ).lean()
    updateBookReview["reviewsData"] = createReview;

    //we need bookId in response that is why we have added this
    data["bookId"] = bookId;
    return res.status(201).send({
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
    if (!isValidId(bookId))
      return res
        .status(400)
        .send({ status: false, msg: "bookId is not valid" });

    let reviewId = req.params.reviewId;
    if (!isValidId(reviewId))
      return res
        .status(400)
        .send({ status: false, msg: "reviewId is not valid" });

    let reviewData = req.body;
    let { review, rating, reviewedBy } = reviewData;

    if (Object.keys(reviewData).length == 0)
      return res
        .status(404)
        .send({ status: false, msg: "please add some data for updates!!!" }); //----check if book exist in collection or not------

    const book = await bookModel.findById(bookId);

    if (!book)
      return res.status(404).send({
        status: false,
        msg: "No Book with this bookId was found in the reviewModel",
      });

    if (bookId.isDeleted == true)
      return res
        .status(404)
        .send({ status: false, msg: "Book is already deleted!!!" });

    const rev = await ReviewModel.findById(reviewId);
    if (!rev)
      return res.status(404).send({
        status: false,
        msg: "No reviews with this reviewID was found in the reviewModel",
      });

    if (reviewId.isDeleted == true)
      return res
        .status(404)
        .send({ status: false, msg: "reviews are already deleted!!" });

    if (!/^\s*([1-5]){1}\s*$/.test(rating))
      return res
        .status(404)
        .send({ status: false, msg: "ratings not accepted!!!" });

    let updateReview = await ReviewModel.findOneAndUpdate(
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

    if (!updateReview)
      return res
        .status(404)
        .send({ status: false, msg: "Something went wrong!!!!" });

    return res
      .status(201)
      .send({ status: true, msg: "Updated the reviews!!!!" });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};
//===========================delete Review by Id======================================
const deleteReviewById = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter bookId" });
    }

    if (!isValidId(bookId)) {
      return res
        .status(400)
        .send({ status: false, msg: "bookId id is not valid" });
    }

    if (!reviewId) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter reviewId" });
    }

    if (!isValidobjectId(reviewId)) {
      return res
        .status(400)
        .send({ status: false, msg: "reviewId in not valid" });
    }

    const findBooksbyId = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    }); // DB Call
    if (!findBooksbyId) {
      return res
        .status(404)
        .send({ status: false, msg: "Books not found or does not exist!" });
    } // DB Validation

    const findReview = await reviewModel.findOne({
      _id: reviewId,
      isDeleted: false,
    }); // DB Call
    if (!findReview) {
      return res
        .status(404)
        .send({ status: false, msg: "review not found or does not exist!" });
    } // DB Validation

    findBooksbyId.reviews = findBooksbyId.reviews - 1; // Decreasing the review count by 1

    await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { $set: { reviews: findBooksbyId.reviews } }
    );

    await reviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    return res.status(200).send({
      status: true,
      message: "Review deleted successfully!",
      data: findBooksbyId,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReviewById = deleteReviewById;
