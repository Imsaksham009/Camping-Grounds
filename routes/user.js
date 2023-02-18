const express = require("express");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/Error");

const {needValidationForUser: needValidation} = require("../middleware/middleware");

const router = express.Router();

//model
const User = require("../model/user");

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
	if (req.isAuthenticated()) res.redirect("/campgrounds");
	res.render("./users/login");
});

router.post("/login", passport.authenticate("local", {failureRedirect: "/user/login", failureFlash: true,keepSessionInfo: true}), (req, res) => {
		req.flash("success","Welcome Back");
		const redirectPath = req.session.returnTo || '/campgrounds';
		console.log(redirectPath);
		res.redirect(redirectPath);
	}
);

router.get("/logout",(req,res)=>{
	req.logout((err)=>{
		if(err) console.log(err)
		req.flash("success","Logged Out Successfully");
		res.redirect("/user/login")
	});

})

module.exports = router;
