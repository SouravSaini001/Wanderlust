const Listing = require("../Models/listing");
const Review = require("../Models/review");


module.exports.createReview = async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async(req,res) => {
    let {id,reviewid} = req.params;
    let res1 = await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewid}});
    let review = await Review.findByIdAndDelete(reviewid);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}