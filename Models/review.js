/**
 * ============================================
 * WANDERLUST - REVIEW MODEL
 * ============================================
 *
 * This file defines the MongoDB schema for
 * reviews submitted by users on listings.
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;


// ============================================
// 1. REVIEW SCHEMA
// ============================================

const reviewSchema = new Schema({

    // ----------------------------------------
    // Review Comment
    // ----------------------------------------

    comment: {
        type: String,
    },


    // ----------------------------------------
    // Review Rating
    // ----------------------------------------
    //
    // Rating must be between 1 and 5.
    //

    rating: {
        type: Number,
        min: 1,
        max: 5,
    },


    // ----------------------------------------
    // Review Creation Date
    // ----------------------------------------
    //
    // Date.now is passed as a function.
    // Mongoose calls it when a new review
    // document is created.
    //

    created_at: {
        type: Date,
        default: Date.now,
    },


    // ----------------------------------------
    // Review Author
    // ----------------------------------------
    //
    // Stores the ObjectId of the User who
    // created the review.
    //

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});


// ============================================
// 2. CREATE MONGOOSE MODEL
// ============================================

const Review = mongoose.model("Review", reviewSchema);


// ============================================
// 3. EXPORT MODEL
// ============================================

module.exports = Review;