const express = require("express");
const wrapSync = require("../utils/catchAsync"); //WrapAsync function
const AppError = require("../utils/Error"); //Apperror class

const Campground = require("../model/campground");
const Review = require("../model/reviews");

const { isLoggedin, isReviewAuthor, validateReviewBody } = require("../middleware/middleware");

const router = express.Router({ mergeParams: true });



router.post(
	"/",
	isLoggedin,
	validateReviewBody,
	wrapSync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		const newReview = new Review(req.body);
		newReview.author = req.user._id;
		campground.reviews.push(newReview);
		await newReview.save();
		const d = await campground.save();
		// console.log(d);
		req.flash("success", "Thanks for the review");
		res.redirect(`/campgrounds/${id}`);
	})
);

router.delete(
	"/:reviewId",
	isLoggedin,
	isReviewAuthor,
	wrapSync(async (req, res, next) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash("success", "Deleted your review");
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
