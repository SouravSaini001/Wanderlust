const Listing = require("./Models/listing")
const { listingJoiSchema  } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {  reviewJoiSchema } = require("./schema.js");
const Review = require('./Models/review.js');


module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){

        // RedirectUrl save 
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        console.log(res.locals.redirectUrl);
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to update.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports.isAuthor = async(req,res,next) => {
    let { id,reviewid } = req.params;
    let review = await Review.findById(reviewid);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","You are not author of this review.");
        return res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.validateListing = (req,res,next) => {
    let { error } = listingJoiSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg)
    } else {
        next();
    }
}

module.exports.validateReview = (req,res,next) => {
    let { error } = reviewJoiSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg)
    } else {
        next();
    }
}

