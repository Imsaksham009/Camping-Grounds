const express = require("express");
const axios = require("axios");
const wrapSync = require("../utils/catchAsync"); //WrapAsync function
const AppError = require("../utils/Error"); //Apperror class

const Campground = require("../model/campground");
const Review = require("../model/reviews");

const router = express.Router();

const { isLoggedin, validateNewCampground: validateReqBody, isAuthor } = require("../middleware/middleware");


router.get("/", wrapSync(async (req, res, next) => {
	const foundGrounds = await Campground.find({});
	res.render("campgrounds/index", { foundGrounds });
})
);

router.get("/new", isLoggedin, (req, res) => {
	res.render("campgrounds/new");
});

router.get("/:id/edit", isLoggedin, isAuthor, wrapSync(async (req, res) => {
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
router.get("/:id", wrapSync(async (req, res) => {
	const { id } = req.params;
	const foundGround = await Campground.findById(id).populate("reviews").populate("author");
	if (!foundGround) {
		req.flash("error", "Campground Not found");
		return res.redirect("/campgrounds");
	}
	for (let review of foundGround.reviews) {
		await review.populate("author");
	}

	res.render("campgrounds/show", foundGround);
})
);

//post routes
router.post("/new", isLoggedin, validateReqBody, wrapSync(async (req, res, next) => {
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
	newGround.author = req.user.id;
	newGround.image = await getImg();
	console.log(newGround);
	await newGround.save();
	req.flash("success", "Added a new Campground");
	res.redirect("/campgrounds");
})
);

router.put("/:id", isLoggedin, isAuthor, validateReqBody, wrapSync(async (req, res) => {
	const found = await Campground.findById(req.params.id);
	await found.updateOne(req.body);
	res.redirect(`/campgrounds/${req.params.id}`);
})
);

router.delete("/:id", isLoggedin, isAuthor, wrapSync(async (req, res) => {
	await Campground.findByIdAndDelete(req.params.id);
	req.flash("success", "Deleted the Campground");
	res.redirect(`/campgrounds`);
})
);

module.exports = router;
