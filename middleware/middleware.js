const AppError = require("../utils/Error");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../model/campground");
const Review = require("../model/reviews");
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': '{{#label}} must not include HTML!'
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if (clean !== value) return helpers.error('string.escapeHTML', { value });
				return clean;
			}
		}
	}
});

const Joi = BaseJoi.extend(extension);

module.exports.isLoggedin = function (req, res, next) {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash("error", "User must be signed in");
		return res.redirect("/user/login");
	}
	next();
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const foundGround = await Campground.findById(id);
	if (!foundGround) {
		req.flash("error", "Campground Not Found");
		return res.redirect("/campgrounds");
	}
	if (foundGround && !foundGround.author.equals(req.user._id)) {
		req.flash("error", "Not Authenticated");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();

};
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const foundReview = await Review.findById(reviewId);
	if (!foundReview) {
		req.flash("error", "Campground Not Found");
		return res.redirect("/campgrounds");
	}
	if (foundReview && !foundReview.author.equals(req.user._id)) {
		req.flash("error", "Not Authenticated");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();

};

module.exports.needValidationForUser = function (req, res, next) {
	const schema = Joi.object({
		username: Joi.string().alphanum().min(3).max(30).required().escapeHTML(),
		email: Joi.string().required().escapeHTML(),
		password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
	}).validate(req.body);

	if (schema.error) {
		const msg = schema.error.details.map((er) => {
			return er.message;
		});
		if (process.env.NODE_ENV !== 'production') {

			throw new AppError(msg, 400);
		}
		else {
			req.flash("error", msg);
			return res.redirect(`/user/register`);
		}
	}
	next();
};

module.exports.validateNewCampground = function (req, res, next) {
	const schema = Joi.object({
		title: Joi.string().required().escapeHTML(),
		price: Joi.number().min(0).required().escapeHTML(),
		description: Joi.string().required().escapeHTML(),
		location: Joi.string().required().escapeHTML(),
	}).validate(req.body);

	if (schema.error) {
		const msg = schema.error.details.map((er) => {
			return er.message;
		});
		if (process.env.NODE_ENV !== 'production') {

			throw new AppError(msg, 400);
		}
		else {
			req.flash("error", msg);
			return res.redirect(`/campgrounds/new`);
		}
	}
	next();
};


module.exports.validateReviewBody = function (req, res, next) {
	const schema = Joi.object({
		body: Joi.string().required().escapeHTML(),
		rating: Joi.number().required(),
	}).validate(req.body);

	if (schema.error) {
		const msg = schema.error.details.map((er) => {
			return er.message;
		});
		if (process.env.NODE_ENV !== 'production') {

			throw new AppError(msg, 400);
		}
		else {
			req.flash("error", msg);
			return res.redirect(`/campgrounds/${req.params.id}`);
		}
	}
	next();
};
