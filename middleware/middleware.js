const Joi = require("Joi");
const AppError = require("../utils/Error");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../model/campground");

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

module.exports.needValidationForUser = function (req, res, next) {
	const schema = Joi.object({
		username: Joi.string().alphanum().min(3).max(30).required(),
		email: Joi.string().required(),
		password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
	}).validate(req.body);

	if (schema.error) {
		const msg = schema.error.details.map((er) => {
			return er.message;
		});
		throw new AppError(msg, 400);
	}
	next();
};

module.exports.validateNewCampground = function (req, res, next) {
	const schema = Joi.object({
		title: Joi.string().required(),
		price: Joi.number().min(0).required(),
		description: Joi.string().required(),
		location: Joi.string().required(),
	}).validate(req.body);

	if (schema.error) {
		const msg = schema.error.details.map((er) => {
			return er.message;
		});
		throw new AppError(msg, 400);
	}
	next();
};
