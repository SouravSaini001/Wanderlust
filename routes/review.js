/**
 * ============================================
 * WANDERLUST - REVIEW ROUTES
 * ============================================
 *
 * This router handles review operations
 * for a specific listing.
 *
 * Mounted in index.js as:
 *
 *     /listings/:id/reviews
 *
 * Therefore:
 *
 * POST /
 *     = POST /listings/:id/reviews
 *
 * DELETE /:reviewid
 *     = DELETE /listings/:id/reviews/:reviewid
 */


// ============================================
// 1. IMPORT REQUIRED MODULES
// ============================================

const express = require("express");

const router = express.Router({
    mergeParams: true,
});


// ============================================
// 2. IMPORT ASYNC HANDLER
// ============================================

const wrapAsync = require(
    "../utils/wrapAsync.js"
);


// ============================================
// 3. IMPORT MIDDLEWARE
// ============================================

const {
    isLoggedIn,
    isAuthor,
    validateReview,
} = require("../middleware.js");


// ============================================
// 4. IMPORT CONTROLLER
// ============================================

const reviewController = require(
    "../controllers/reviews.js"
);


// ============================================
// 5. CREATE REVIEW
// ============================================
//
// POST /listings/:id/reviews
//
// Middleware flow:
//
//     isLoggedIn
//          ↓
//     validateReview
//          ↓
//     createReview()
//
// Only authenticated users can create
// reviews.
//

router.post(

    "/",

    // User must be logged in
    isLoggedIn,

    // Validate review data
    validateReview,

    // Create review
    wrapAsync(
        reviewController.createReview
    )
);


// ============================================
// 6. DELETE REVIEW
// ============================================
//
// DELETE /listings/:id/reviews/:reviewid
//
// Middleware flow:
//
//     isLoggedIn
//          ↓
//     isAuthor
//          ↓
//     deleteReview()
//
// Only the review author can delete
// their own review.
//

router.delete(

    "/:reviewid",

    // User must be logged in
    isLoggedIn,

    // User must be the review author
    isAuthor,

    // Delete review
    wrapAsync(
        reviewController.deleteReview
    )
);


// ============================================
// 7. EXPORT ROUTER
// ============================================

module.exports = router;