/**
 * ============================================
 * WANDERLUST - LISTING CONTROLLER
 * ============================================
 *
 * This controller handles all listing operations:
 *
 * 1. Display all listings
 * 2. Display new listing form
 * 3. Create listing
 * 4. Display single listing
 * 5. Display edit form
 * 6. Update listing
 * 7. Delete listing
 *
 * External Services:
 *
 * - MongoDB / Mongoose
 * - Cloudinary for listing images
 * - Mapbox for location geocoding
 */


// ============================================
// 1. IMPORT REQUIRED MODULES
// ============================================

const Listing = require("../Models/listing.js");

const mbxGeocoding = require(
  "@mapbox/mapbox-sdk/services/geocoding"
);


// ============================================
// 2. MAPBOX CONFIGURATION
// ============================================

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
  accessToken: mapToken,
});


// ============================================
// 3. INDEX / SHOW ALL LISTINGS
// ============================================
//
// GET /listings
//
// If a category is provided:
//
//     /listings?category=Beach
//
// only listings from that category are shown.
//
// Otherwise, all listings are displayed.
//

module.exports.index = async (req, res) => {

  const { category, search } = req.query;

  let filter = {};

  // ============================
  // SEARCH
  // ============================

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];
  }

  // ============================
  // CATEGORY
  // ============================

  if (category) {
    filter.category = category;
  }

  // ============================
  // FIND LISTINGS
  // ============================

  const allListings = await Listing.find(filter);

  // ============================
  // RENDER
  // ============================

  res.render("listings/index", {
    allListings,
    search,
    category
  });
};


// ============================================
// 4. RENDER NEW LISTING FORM
// ============================================
//
// GET /listings/new
//
// The isLoggedIn middleware in the route
// ensures that only authenticated users can
// access this page.
//

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new");
};


// ============================================
// 5. CREATE NEW LISTING
// ============================================
//
// POST /listings
//
// Flow:
//
//     Form data
//          ↓
//     Upload image to Cloudinary
//          ↓
//     Geocode location using Mapbox
//          ↓
//     Create Listing document
//          ↓
//     Save owner
//          ↓
//     Save image information
//          ↓
//     Save geometry
//          ↓
//     MongoDB
//

module.exports.createListing = async (req, res) => {


  // ----------------------------------------
  // Geocode Listing Location
  // ----------------------------------------
  //
  // Convert a location such as:
  //
  //     "Goa"
  //
  // into geographical coordinates.
  //

  const response = await geocodingClient
    .forwardGeocode({

      query: req.body.listing.location,

      // We only need the best result.
      limit: 1,
    })
    .send();


  // ----------------------------------------
  // Get Uploaded Image Information
  // ----------------------------------------

  const url = req.file.path;

  const filename = req.file.filename;


  // ----------------------------------------
  // Create New Listing
  // ----------------------------------------

  const newListing = new Listing(
    req.body.listing
  );


  // ----------------------------------------
  // Set Listing Owner
  // ----------------------------------------

  newListing.owner = req.user._id;


  // ----------------------------------------
  // Save Cloudinary Image Information
  // ----------------------------------------

  newListing.image = {
    url,
    filename,
  };


  // ----------------------------------------
  // Save Mapbox Geometry
  // ----------------------------------------

  newListing.geometry =
    response.body.features[0].geometry;


  // ----------------------------------------
  // Save Listing to MongoDB
  // ----------------------------------------

  await newListing.save();


  // ----------------------------------------
  // Success Message
  // ----------------------------------------

  req.flash(
    "success",
    "New Listing Created!"
  );


  // ----------------------------------------
  // Redirect to Listings
  // ----------------------------------------

  res.redirect("/listings");
};


// ============================================
// 6. SHOW SINGLE LISTING
// ============================================
//
// GET /listings/:id
//
// Also populates:
//
//     reviews
//         ↓
//     review author
//
// and:
//
//     listing owner
//

module.exports.showListings = async (
  req,
  res
) => {

  const { id } = req.params;


  // ----------------------------------------
  // Find Listing
  // ----------------------------------------

  const listing = await Listing.findById(id)

    // Populate reviews and review authors
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })

    // Populate listing owner
    .populate("owner");


  // ----------------------------------------
  // Listing Not Found
  // ----------------------------------------

  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist!"
    );

    return res.redirect(
      "/listings"
    );
  }


  // ----------------------------------------
  // Render Listing Details
  // ----------------------------------------

  res.render(
    "listings/show",
    {
      listing,
    }
  );
};


// ============================================
// 7. RENDER EDIT LISTING FORM
// ============================================
//
// GET /listings/:id/edit
//
// The route already checks:
//
//     isLoggedIn
//     isOwner
//
// before reaching this controller.
//

module.exports.renderEditForm = async (
  req,
  res
) => {

  const { id } = req.params;


  // ----------------------------------------
  // Find Listing
  // ----------------------------------------

  const listing = await Listing.findById(id);


  // ----------------------------------------
  // Listing Not Found
  // ----------------------------------------

  if (!listing) {

    req.flash(
      "error",
      "Listing you requested for does not exist!"
    );

    return res.redirect(
      "/listings"
    );
  }


  // ----------------------------------------
  // Create Smaller Preview Image
  // ----------------------------------------
  //
  // Cloudinary transformation:
  //
  //     height = 300px
  //     width  = 250px
  //

  let originalImageUrl = listing.image.url;

  originalImageUrl =
    originalImageUrl.replace(
      "/upload",
      "/upload/h_300,w_250"
    );


  // ----------------------------------------
  // Render Edit Form
  // ----------------------------------------

  res.render(
    "listings/edit",
    {
      listing,
      originalImageUrl,
    }
  );
};


// ============================================
// 8. UPDATE LISTING
// ============================================
//
// PATCH /listings/:id
//
// Flow:
//
//     Find listing
//          ↓
//     Update text information
//          ↓
//     Check for new image
//          ↓
//     Update Cloudinary image if provided
//          ↓
//     Save changes
//

module.exports.updateListing = async (
  req,
  res
) => {

  const { id } = req.params;


  // ----------------------------------------
  // Update Listing Information
  // ----------------------------------------

  const listing =
    await Listing.findByIdAndUpdate(
      id,
      {
        ...req.body.listing,
      },
      {
        new: true,
      }
    );


  // ----------------------------------------
  // Check for New Image
  // ----------------------------------------

  if (req.file) {

    const url = req.file.path;

    const filename =
      req.file.filename;


    // Update image information
    listing.image = {
      url,
      filename,
    };


    // Save updated image
    await listing.save();
  }


  // ----------------------------------------
  // Success Message
  // ----------------------------------------

  req.flash(
    "success",
    "Listing Updated!"
  );


  // ----------------------------------------
  // Redirect to Updated Listing
  // ----------------------------------------

  res.redirect(
    `/listings/${id}`
  );
};


// ============================================
// 9. DELETE LISTING
// ============================================
//
// DELETE /listings/:id
//
// The route already checks:
//
//     isLoggedIn
//     isOwner
//
// before deleting the listing.
//

module.exports.deleteListing = async (
  req,
  res
) => {

  const { id } = req.params;


  // ----------------------------------------
  // Delete Listing
  // ----------------------------------------

  await Listing.findByIdAndDelete(id);


  // ----------------------------------------
  // Success Message
  // ----------------------------------------

  req.flash(
    "success",
    "Listing Deleted!"
  );


  // ----------------------------------------
  // Redirect
  // ----------------------------------------

  res.redirect("/listings");
};


