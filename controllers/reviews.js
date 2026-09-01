/**
 * ============================================
 * WANDERLUST - REVIEW CONTROLLER
 * ============================================
 *
 * This controller handles review operations:
 *
 * 1. Create a review
 * 2. Delete a review
 *
 * Relationship:
 *
 * Listing
 *    │
 *    └── reviews[] ──► Review
 *                         │
 *                         └── author ──► User
 */


// ============================================
// 1. IMPORT REQUIRED MODELS
// ============================================

const Listing = require("../Models/listing.js");

const Review = require("../Models/review.js");


// ============================================
// 2. CREATE REVIEW
// ============================================
//
// POST /listings/:id/reviews
//
// Flow:
//
//     User submits review
//            ↓
//     Find Listing
//            ↓
//     Create Review
//            ↓
//     Set Review Author
//            ↓
//     Save Review
//            ↓
//     Add Review ID to Listing
//            ↓
//     Save Listing
//            ↓
//     Redirect to Listing
//

module.exports.createReview = async (
    req,
    res
) => {

    const { id } = req.params;


    // ----------------------------------------
    // Find Listing
    // ----------------------------------------

    const listing = await Listing.findById(id);


    // ----------------------------------------
    // Check Listing Exists
    // ----------------------------------------

    if (!listing) {

        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect(
            "/listings"
        );
    }


    // ----------------------------------------
    // Create New Review
    // ----------------------------------------

    const newReview = new Review(
        req.body.review
    );


    // ----------------------------------------
    // Set Review Author
    // ----------------------------------------
    //
    // req.user is provided by Passport after
    // successful authentication.
    //

    newReview.author = req.user._id;


    // ----------------------------------------
    // Save Review
    // ----------------------------------------

    await newReview.save();


    // ----------------------------------------
    // Add Review to Listing
    // ----------------------------------------
    //
    // Store the Review ObjectId inside the
    // listing's reviews array.
    //

    listing.reviews.push(
        newReview._id
    );


    // Save updated listing
    await listing.save();


    // ----------------------------------------
    // Success Message
    // ----------------------------------------

    req.flash(
        "success",
        "New Review Created!"
    );


    // ----------------------------------------
    // Redirect to Listing
    // ----------------------------------------

    res.redirect(
        `/listings/${listing._id}`
    );
};


// ============================================
// 3. DELETE REVIEW
// ============================================
//
// DELETE /listings/:id/reviews/:reviewid
//
// Flow:
//
//     Find Listing
//          ↓
//     Remove Review ID from listing.reviews
//          ↓
//     Delete Review document
//          ↓
//     Redirect to Listing
//

module.exports.deleteReview = async (
    req,
    res
) => {

    const {
        id,
        reviewid,
    } = req.params;


    // ----------------------------------------
    // Remove Review Reference from Listing
    // ----------------------------------------
    //
    // $pull removes the review ID from the
    // listing's reviews array.
    //

    await Listing.findByIdAndUpdate(
        id,
        {
            $pull: {
                reviews: reviewid,
            },
        }
    );


    // ----------------------------------------
    // Delete Review Document
    // ----------------------------------------

    await Review.findByIdAndDelete(
        reviewid
    );


    // ----------------------------------------
    // Success Message
    // ----------------------------------------

    req.flash(
        "success",
        "Review Deleted!"
    );


    // ----------------------------------------
    // Redirect to Listing
    // ----------------------------------------

    res.redirect(
        `/listings/${id}`
    );
};