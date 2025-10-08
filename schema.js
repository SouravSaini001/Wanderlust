const Joi = require("joi");

module.exports.listingJoiSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title is required",
      "any.required": "Title is mandatory",
    }),

    description: Joi.string().required().allow("").optional(),

    image: Joi.string()
      .uri()
      .allow("")
      .default(
        "https://images.unsplash.com/photo-1756177199716-68a94b825d80?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      ),

    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
      "any.required": "Price is mandatory",
    }),

    location: Joi.string().required().messages({
      "string.empty": "Location is required",
    }),

    country: Joi.string().required().messages({
      "string.empty": "Country is required",
    }),
  }).required(),
});

module.exports.reviewJoiSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required().messages({
      "string.empty": "Comment cannot be empty",
      "any.required": "Comment is required",
    }),

    rating: Joi.number().min(1).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot be more than 5",
      "any.required": "Rating is required",
    }),

    created_at: Joi.date()
      .default(() => new Date())
      .description("current date"),
  }).required(),
});
