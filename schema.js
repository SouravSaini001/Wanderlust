/**
 * ============================================
 * WANDERLUST - JOI VALIDATION SCHEMAS
 * ============================================
 *
 * Joi is used to validate data coming from
 * forms before saving it to MongoDB.
 */

// ============================================
// 1. IMPORT JOI
// ============================================

const Joi = require("joi");


// ============================================
// 2. LISTING VALIDATION SCHEMA
// ============================================

/**
 * Validates listing data.
 *
 * Expected structure:
 *
 * {
 *     listing: {
 *         title: "...",
 *         description: "...",
 *         image: "...",
 *         price: 1000,
 *         location: "...",
 *         country: "..."
 *     }
 * }
 */

module.exports.listingJoiSchema = Joi.object({
  listing: Joi.object({

    title: Joi.string()
      .required()
      .messages({
        "string.empty": "Title is required",
        "any.required": "Title is mandatory",
      }),

    description: Joi.string()
      .allow("")
      .optional(),

    image: Joi.string()
      .uri()
      .allow("")
      .default(
        "https://images.unsplash.com/photo-1756177199716-68a94b825d80?q=80&w=1171&auto=format&fit=crop"
      ),

    price: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "Price must be a number",
        "number.min": "Price cannot be negative",
        "any.required": "Price is mandatory",
      }),

    rooms: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        "number.base": "Number of rooms must be a number",
        "number.integer": "Number of rooms must be a whole number",
        "number.min": "There must be at least 1 room",
        "any.required": "Number of rooms is mandatory",
      }),

    location: Joi.string()
      .required()
      .messages({
        "string.empty": "Location is required",
        "any.required": "Location is mandatory",
      }),

    country: Joi.string()
      .required()
      .messages({
        "string.empty": "Country is required",
        "any.required": "Country is mandatory",
      }),

    // ⭐ CATEGORY
    category: Joi.string()
      .valid(
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Surfing",
        "Beach",
        "Amazing Pools",
        "Mountain",
        "Farms",
        "Camping",
        "Castles"
      )
      .required()
      .messages({
        "any.only": "Please select a valid category",
        "string.empty": "Category is required",
        "any.required": "Category is mandatory",
      }),

  }).required(),
});


// ============================================
// 3. REVIEW VALIDATION SCHEMA
// ============================================

/**
 * Validates review data.
 *
 * Expected structure:
 *
 * {
 *     review: {
 *         comment: "...",
 *         rating: 5,
 *         created_at: Date
 *     }
 * }
 */

module.exports.reviewJoiSchema = Joi.object({
  review: Joi.object({

    // ----------------------------
    // Review Comment
    // ----------------------------

    comment: Joi.string()
      .required()
      .messages({
        "string.empty": "Comment cannot be empty",
        "any.required": "Comment is required",
      }),


    // ----------------------------
    // Review Rating
    // ----------------------------

    rating: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot be more than 5",
        "any.required": "Rating is required",
      }),


    // ----------------------------
    // Review Creation Date
    // ----------------------------

    created_at: Joi.date()
      .default(() => new Date())
      .description("Current date"),

  }).required(),
});