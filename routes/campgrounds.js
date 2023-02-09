const express = require("express");
const Joi = require("joi");
const axios = require("axios");
const wrapSync = require("../utils/catchAsync"); //WrapAsync function
const AppError = require("../utils/Error"); //Apperror class

const Campground = require("../model/campground");

const router = express.Router();

const validateReqBody = function (req, res, next) {
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

router.get(
	"/",
	wrapSync(async (req, res, next) => {
		const foundGrounds = await Campground.find({});
		// if (!foundGrounds) {
		// 	req.flash("error", "Campground Not found");
		// 	return res.redirect("/campgrounds");
		// }
		res.render("campgrounds/index", { foundGrounds });
	})
);

router.get("/new", (req, res) => {
	res.render("campgrounds/new");
});

router.get(
	"/:id/edit",
	wrapSync(async (req, res) => {
		const { id } = req.params;
		const foundGround = await Campground.findById(id);
		if (!foundGround) {
			req.flash("error", "Campground Not found");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/edit", foundGround);
	})
);

//id
router.get(
	"/:id",
	wrapSync(async (req, res) => {
		const { id } = req.params;
		const foundGround = await Campground.findById(id).populate("reviews");
		if (!foundGround) {
			req.flash("error", "Campground Not found");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/show", foundGround);
	})
);

//post routes
router.post(
	"/",
	validateReqBody,
	wrapSync(async (req, res, next) => {
		const params = {
			client_id: "D-IBhFeMwleCj-DJ-hZyNuLvXthxeMuh3ooDrXZyOv0",
			collections: 483251,
		};

		const getImg = async function () {
			try {
				const res = await axios.get("https://api.unsplash.com/photos/random", {
					params,
				});
				return res.data.urls.regular;
			} catch (e) {
				throw new AppError(e.code, 404);
			}
		};

		const newGround = new Campground(req.body);
		newGround.image = await getImg();
		await newGround.save();
		req.flash("success", "Added a new Campground");
		res.redirect("/campgrounds");
	})
);

router.put(
	"/:id",
	validateReqBody,
	wrapSync(async (req, res) => {
		await Campground.findByIdAndUpdate(req.params.id, req.body);
		res.redirect(`/campgrounds/${req.params.id}`);
	})
);

router.delete(
	"/:id",
	wrapSync(async (req, res) => {
		await Campground.findByIdAndDelete(req.params.id);
		req.flash("success", "Deleted the Campground");
		res.redirect(`/campgrounds`);
	})
);

module.exports = router;
