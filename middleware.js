/**
 * ============================================
 * WANDERLUST - MIDDLEWARE
 * ============================================
 *
 * This file contains middleware for:
 *
 * 1. Authentication
 * 2. Authorization
 * 3. Listing ownership
 * 4. Review authorship
 * 5. Listing validation
 * 6. Review validation
 */


// ============================================
// 1. IMPORT REQUIRED FILES
// ============================================

const Listing = require("./Models/listing.js");
const Review = require("./Models/review.js");

const {
    listingJoiSchema,
    reviewJoiSchema,
} = require("./schema.js");

const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");


// ============================================
// 2. CHECK USER LOGIN
// ============================================
//
// This middleware checks whether the user is
// currently authenticated.
//
// If the user is not logged in:
// 1. Save the current URL.
// 2. Show an error message.
// 3. Redirect to login page.
//

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        // Save the URL the user originally wanted
        // to visit so we can redirect them back
        // after successful login.
        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in!"
        );

        return res.redirect("/login");
    }

    next();
};


// ============================================
// 3. SAVE REDIRECT URL
// ============================================
//
// Copies the redirect URL from the session to
// res.locals so that it can be accessed by EJS.
//

module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {

        // Make redirectUrl available in EJS
        res.locals.redirectUrl = req.session.redirectUrl;

        // Remove it from the session after
        // transferring it to res.locals.
        delete req.session.redirectUrl;
    }

    next();
};


// ============================================
// 4. CHECK LISTING OWNER
// ============================================
//
// Only the owner of a listing should be able
// to edit or delete that listing.
//

module.exports.isOwner = wrapAsync(
    async (req, res, next) => {

        const { id } = req.params;

        // Find the listing
        const listing = await Listing.findById(id);

        // Listing does not exist
        if (!listing) {

            req.flash(
                "error",
                "Listing not found!"
            );

            return res.redirect("/listings");
        }

        // Check whether the current user is
        // the owner of the listing.
        if (
            !listing.owner ||
            !listing.owner.equals(res.locals.currUser._id)
        ) {

            req.flash(
                "error",
                "You don't have permission to update."
            );

            return res.redirect(`/listings/${id}`);
        }

        next();
    }
);


// ============================================
// 5. CHECK REVIEW AUTHOR
// ============================================
//
// Only the user who created a review should
// be able to delete that review.
//

module.exports.isAuthor = wrapAsync(
    async (req, res, next) => {

        const {
            id,
            reviewid,
        } = req.params;

        // Find the review
        const review = await Review.findById(reviewid);

        // Review does not exist
        if (!review) {

            req.flash(
                "error",
                "Review not found!"
            );

            return res.redirect(`/listings/${id}`);
        }

        // Check whether the current user is
        // the author of the review.
        if (
            !review.author ||
            !review.author.equals(res.locals.currUser._id)
        ) {

            req.flash(
                "error",
                "You are not the author of this review."
            );

            return res.redirect(`/listings/${id}`);
        }

        next();
    }
);


// ============================================
// 6. VALIDATE LISTING
// ============================================
//
// Uses Joi to validate listing data before
// sending it to the controller.
//

module.exports.validateListing = (req, res, next) => {

    const { error } = listingJoiSchema.validate(
        req.body
    );

    // Validation failed
    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(", ");

        throw new ExpressError(
            400,
            errMsg
        );
    }

    // Validation successful
    next();
};


// ============================================
// 7. VALIDATE REVIEW
// ============================================
//
// Uses Joi to validate review data before
// sending it to the controller.
//

module.exports.validateReview = (req, res, next) => {

    const { error } = reviewJoiSchema.validate(
        req.body
    );

    // Validation failed
    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(", ");

        throw new ExpressError(
            400,
            errMsg
        );
    }

    // Validation successful
    next();
};