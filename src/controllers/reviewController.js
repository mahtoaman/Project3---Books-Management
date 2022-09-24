const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");



const isValidType = function (value){
  if(typeof value !== "string"||value.trim().length === 0){
    return false
  }
    return true
}

// =============================== CREATE REVIEW ==========================================================

const createReview = async function (req, res) {    
    try {
        
        const bookId = req.params.bookId;

        if (!mongoose.isValidObjectId(bookId)){
            return res.status(400).send({status: false, message: "book Id id not valid"})
        }
        const existBook = await bookModel.findOne({_id: bookId, isDeleted: false})
        if (!existBook){
            return res.status(400).send({status: false, message: "no data found"}) 
        }
          const result = {}

               result.bookId = existBook._id.toString();

           const data = req.body;

        if (Object.keys(data)=== 0){
            return res.status(400).send({status: false, message: "required data"})
        }
        const { reviewedBy, rating, review, isDeleted } = data

        if(!reviewedBy){
             result.reviewedBy = "Guest"
        }
        if(reviewedBy){
            if(!isValidType(reviewedBy)) return res.status(400).send({status: false, message: "type must be in string & required data in string"})
            result.reviewedBy = reviewedBy
        }
            if (isDeleted){
                if (typeof isDeleted !== "boolean"){
                    return res.status(400).send({status: false, message: "isDeleted type must be in boolean"})
                }
                result.isDeleted = isDeleted
            }
            if ( typeof rating !== "number"){
                return res.status(400).send({status: false, message: " rating is required & time must be in number"})
            }
            if (rating < 1 || rating > 5){
                return res.status(400).send({status: false, message: "rating should be b/w 1 to 5"})
            }
            result.rating = rating

            if (review){
                if (!isValidType(review)){
                    return res.status(400).send({status: false, message:  "type must be in string & required data in string" })
                }
                result.review = review
            }
           result.reviewedAt = new Date();

            const createdreviews = await reviewModel.create(result)

            const findCreateReview = await reviewModel.findById(createdreviews._id).select({_id: 1, bookId: 1, reviedBy: 1, reviewedAt: 1, rating: 1, review: 1})
            if (findCreateReview){
                const updateBookReview = await bookModel.findOneAndUpdate(
                    {_id: createdreviews.bookId, isDeleted: false}, {$inc: {reviews: 1}}, {new: true})
                updateBookReview.reviewsData = findCreateReview
                return res.status(201).send({status: true, message: "success", data: createdreviews})
            }
        
    }
    catch(err){
        return res.status(500).send({status: false, message: "server error", error:err.message})
    }
}

module.exports.createReview = createReview