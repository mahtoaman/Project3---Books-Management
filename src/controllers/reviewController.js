const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const { isValidId, isValidBody, isValidRating } = require("../validators/validator");
const mongoose = require("mongoose");

// =============================== CREATE REVIEW ==================================================
const createReview = async function (req, res) {try {
  const requestBody = req.body;
  // const queryParams = req.query;
  const bookId = req.params.bookId;

  //query params must be empty
  // if (!isValidBody(queryParams)) {
  //   return res.status(400).send({ status: false, message: "invalid request" });
  // }

  if (!isValidBody(requestBody)) {
    return res
      .status(400)
      .send({
        status: false,
        message: "review data is required to create a new review",
      });
  }

  if (!bookId) {
    return res
      .status(400)
      .send({ status: false, message: "bookId is required in path params" });
  }

  if (!isValidId(bookId)) {
    return res
      .status(400)
      .send({ status: false, message: `enter a valid bookId` });
  }

  const bookByBookId = await bookModel.findOne({
    _id: bookId,
    isDeleted: false,
    deletedAt: null,
  });

  if (!bookByBookId) {
    return res
      .status(404)
      .send({ status: false, message: ` No Book found by ${bookId}` });
  }

  // using destructuring then checking existence of property. If exist then validating that key
  const { reviewedBy, rating, review } = requestBody;

  // creating an object to add validated keys from requestBody
  const reviewData = {};

  if (requestBody.hasOwnProperty("reviewedBy")) {
    if (isValid(reviewedBy)) {
      reviewData["reviewedBy"] = reviewedBy.trim();
    } else {
      return res
        .status(400)
        .send({
          status: false,
          message: "enter name in valid format like: JOHN",
        });
    }

    // if requestBody does not have the "reviewedBy" then assigning its default value
  } else {
    reviewData["reviewedBy"] = "Guest";
  }

  if (isValidRating(rating)) {
    reviewData["rating"] = rating;
  } else {
    return res
      .status(400)
      .send({
        status: false,
        message: "rate the book from 1 to 5, in Number format",
      });
  }

  if (requestBody.hasOwnProperty("review")) {
    if (typeof review === "string" && review.trim().length > 0) {
      reviewData["review"] = review.trim();
    } else {
      return res
        .status(400)
        .send({
          status: false,
          message: `enter review in valid format like : "awesome book must read" `,
        });
    }
  }

  // adding properties like: bookId, default value of isDeleted and review creation date & time inside reviewData
  reviewData.bookId = bookId;
  reviewData.isDeleted = false;
  reviewData.reviewedAt = Date.now();

  const createReview = await reviewModel.create(reviewData);

  const updateReviewCountInBook = await bookModel.findOneAndUpdate(
    { _id: bookId, isDeleted: false, deletedAt: null },
    { $inc: { reviews: +1 } },
    { new: true }
  );

  const allReviewsOfThisBook = await reviewModel.find({
    bookId: bookId,
    isDeleted: false,
  });

  // USING .lean() to convert mongoose object to plain js object for adding a property temporarily
  const book = await bookModel.findOne({
    _id: bookId,
    isDeleted: false,
    deletedAt: null,
  }).lean();

  // temporarily adding one new property inside book which consist all reviews of this book
  book.reviewsData = allReviewsOfThisBook;

  res
    .status(201)
    .send({ status: true, message: "review added successfully", data: book });
} catch (err) {
  res.status(500).send({ error: err.message });
}
};

//===================update Review===========================================
const updateReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!mongoose.Types.ObjectId.isValid(bookId))
      return res
        .status(400)
        .send({ status: false, msg: "bookId is not valid" });

    let reviewId = req.params.reviewId;
    if (!mongoose.Types.ObjectId.isValid(reviewId))
      return res
        .status(400)
        .send({ status: false, msg: "reviewId is not valid" });

    let reviewData = req.body;
    let { review, rating, reviewedBy } = reviewData; //-----check for request body-----

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
