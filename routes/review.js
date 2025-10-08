const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../Models/listing.js');
const Review = require('../Models/review.js');
const {validateReview} = require("../middleware.js");
const {isLoggedIn,isAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// Adding review 
router.post("/",validateReview, isLoggedIn ,wrapAsync(reviewController.createReview));

// Deleting Review 
router.delete("/:reviewid", isLoggedIn, isAuthor ,wrapAsync(reviewController.deleteReview));


module.exports = router;