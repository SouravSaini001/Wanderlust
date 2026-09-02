/**
 * ============================================
 * WANDERLUST - LISTING MODEL
 * ============================================
 *
 * This file defines the MongoDB schema for a
 * property/listing in the Wanderlust application.
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;


// ============================================
// 1. IMPORT REVIEW MODEL
// ============================================

// Required because reviews need to be deleted
// when their parent listing is deleted.
const Review = require("./review.js");


// ============================================
// 2. LISTING SCHEMA
// ============================================

const listingSchema = new Schema({

    // ----------------------------------------
    // Listing Title
    // ----------------------------------------

    title: {
        type: String,
        required: true,
    },


    // ----------------------------------------
    // Listing Description
    // ----------------------------------------

    description: {
        type: String,
    },


    // ----------------------------------------
    // Listing Image
    // ----------------------------------------
    //
    // Image information is stored as an object
    // because Cloudinary provides both:
    // 1. Image URL
    // 2. Image filename
    //

    image: {
        url: String,
        filename: String,
    },


    // ----------------------------------------
    // Listing Price
    // ----------------------------------------

    price: {
        type: Number,
    },


    // ----------------------------------------
    // Listing Location
    // ----------------------------------------

    location: {
        type: String,
    },


    // ----------------------------------------
    // Listing Country
    // ----------------------------------------

    country: {
        type: String,
    },


    // ----------------------------------------
    // Listing Category
    // ----------------------------------------
    //
    // enum restricts category to the values
    // defined below.
    //

    category: {
        type: String,

        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Surfing",
            "Beach",
            "Amazing Pools",
            "Mountain",
            "Farms",
            "Camping",
            "Castles",
        ],
    },


    // ----------------------------------------
    // Reviews
    // ----------------------------------------
    //
    // A listing can have multiple reviews.
    //
    // Instead of storing complete review
    // objects here, we store their ObjectIds.
    //

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],


    // ----------------------------------------
    // Listing Owner
    // ----------------------------------------
    //
    // Stores the ObjectId of the User who
    // created the listing.
    //

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },


    // ----------------------------------------
    // Location Geometry
    // ----------------------------------------
    //
    // Used by Mapbox/GeoJSON for displaying
    // the listing location on the map.
    //

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },

        // GeoJSON coordinates:
        // [longitude, latitude]
        coordinates: {
            type: [Number],
            required: true,
        },
    },

    rooms: {
        type: Number,
        required: true,
        min: 1
    },
});


// ============================================
// 3. POST DELETE MIDDLEWARE
// ============================================
//
// When a listing is deleted, its associated
// reviews should also be deleted.
//
// Example:
//
// Listing
//    │
//    ├── Review ID
//    ├── Review ID
//    └── Review ID
//
// Delete Listing
//      ↓
// Delete all associated Reviews
//

listingSchema.post("findOneAndDelete", async (listing) => {

    // Make sure the listing actually exists
    // before trying to delete its reviews.
    if (listing) {

        await Review.deleteMany({
            _id: {
                $in: listing.reviews,
            },
        });
    }
});


// ============================================
// 4. CREATE MONGOOSE MODEL
// ============================================

const Listing = mongoose.model("Listing", listingSchema);


// ============================================
// 5. EXPORT MODEL
// ============================================

module.exports = Listing;