const express = require("express");
const Joi = require("joi");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/Error");

const router = express.Router();

//model
const User = require("../model/user");

const needValidation = function (req, res, next) {
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

router.get("/register", (req, res) => {
	res.render("./users/newUser");
});

router.post("/register", needValidation, async (req, res) => {
	try {
		const user = new User({
			email: req.body.email,
			username: req.body.username,
		});
		const d = await User.register(user, req.body.password);
		req.flash("success", "User is Registered");
		res.redirect("/campgrounds");
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("/user/register");
	}
});

router.get("/login", (req, res) => {
	res.render("./users/login");
});

module.exports = router;
