const Joi = require("Joi");

module.exports.isLoggedin = function (req, res, next) {
	if (!req.isAuthenticated()) {
		req.flash("error", "User must be signed in");
		return res.redirect("/user/login");
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
