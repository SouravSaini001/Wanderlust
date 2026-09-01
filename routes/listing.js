/**
 * ============================================
 * WANDERLUST - LISTING ROUTES
 * ============================================
 *
 * This file handles all listing-related routes:
 *
 * 1. Display all listings
 * 2. Create a new listing
 * 3. Display new listing form
 * 4. Display a single listing
 * 5. Display edit form
 * 6. Update listing
 * 7. Delete listing
 *
 * Authentication:
 *     isLoggedIn
 *
 * Authorization:
 *     isOwner
 *
 * Validation:
 *     validateListing
 *
 * Image Upload:
 *     Multer + Cloudinary
 */


// ============================================
// 1. IMPORT REQUIRED MODULES
// ============================================

const express = require("express");

const router = express.Router();

const multer = require("multer");


// ============================================
// 2. IMPORT MODELS
// ============================================

const Listing = require("../Models/listing.js");


// ============================================
// 3. IMPORT CONTROLLERS
// ============================================

const listingController = require(
    "../controllers/listings.js"
);


// ============================================
// 4. IMPORT MIDDLEWARE
// ============================================

const wrapAsync = require(
    "../utils/wrapAsync.js"
);

const {
    isLoggedIn,
    isOwner,
    validateListing,
} = require("../middleware.js");


// ============================================
// 5. CLOUDINARY + MULTER CONFIGURATION
// ============================================
//
// Uploaded listing images are stored in
// Cloudinary using the storage configuration
// defined in cloudConfig.js.
//

const {
    storage,
} = require("../cloudConfig.js");

const upload = multer({
    storage,
});


// ============================================
// 6. NEW LISTING FORM
// ============================================
//
// GET /listings/new
//
// Only logged-in users can create listings.
//

router.get(
    "/new",

    isLoggedIn,

    listingController.renderNewForm
);


// ============================================
// 7. EDIT LISTING FORM
// ============================================
//
// GET /listings/:id/edit
//
// Middleware flow:
//
//     isLoggedIn
//          ↓
//     isOwner
//          ↓
//     renderEditForm
//
// Only the listing owner can edit the listing.
//

router.get(
    "/:id/edit",

    isLoggedIn,

    isOwner,

    wrapAsync(
        listingController.renderEditForm
    )
);


// ============================================
// 8. LIST ALL + CREATE LISTING
// ============================================
//
// GET /listings
//     → Display all listings
//
// POST /listings
//     → Create a new listing
//

router
    .route("/")

    // ----------------------------------------
    // INDEX
    // ----------------------------------------
    //
    // GET /listings
    //
    // Public route.
    //

    .get(
        wrapAsync(
            listingController.index
        )
    )

    // ----------------------------------------
    // CREATE
    // ----------------------------------------
    //
    // POST /listings
    //
    // Middleware flow:
    //
    //     isLoggedIn
    //          ↓
    //     upload image
    //          ↓
    //     validate listing
    //          ↓
    //     create listing
    //

    .post(

        // User must be logged in
        isLoggedIn,

        // Handle listing image upload
        upload.single("listing[image]"),

        // Validate listing data
        validateListing,

        // Create listing
        wrapAsync(
            listingController.createListing
        )
    );


// ============================================
// 9. SHOW + UPDATE + DELETE LISTING
// ============================================
//
// GET /listings/:id
//     → Display one listing
//
// PATCH /listings/:id
//     → Update listing
//
// DELETE /listings/:id
//     → Delete listing
//

router
    .route("/:id")

    // ----------------------------------------
    // SHOW
    // ----------------------------------------
    //
    // GET /listings/:id
    //
    // Public route.
    //

    .get(
        wrapAsync(
            listingController.showListings
        )
    )

    // ----------------------------------------
    // UPDATE
    // ----------------------------------------
    //
    // PATCH /listings/:id
    //
    // Middleware flow:
    //
    //     isLoggedIn
    //          ↓
    //     isOwner
    //          ↓
    //     upload image
    //          ↓
    //     validate listing
    //          ↓
    //     update listing
    //

    .patch(

        // User must be logged in
        isLoggedIn,

        // User must own the listing
        isOwner,

        // Handle new image upload
        upload.single("listing[image]"),

        // Validate updated listing data
        validateListing,

        // Update listing
        wrapAsync(
            listingController.updateListing
        )
    )

    // ----------------------------------------
    // DELETE
    // ----------------------------------------
    //
    // DELETE /listings/:id
    //
    // Only the listing owner can delete it.
    //

    .delete(

        // User must be logged in
        isLoggedIn,

        // User must own the listing
        isOwner,

        // Delete listing
        wrapAsync(
            listingController.deleteListing
        )
    );


// ============================================
// 10. EXPORT ROUTER
// ============================================

module.exports = router;