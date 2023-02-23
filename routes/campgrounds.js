if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary/index");
const upload = multer({ storage });

//mapbox
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoding = mbxgeocoding({ accessToken: process.env.MAPBOX_TOKEN });


//utils
const wrapSync = require("../utils/catchAsync"); //WrapAsync function
const AppError = require("../utils/Error"); //Apperror class

//model
const Campground = require("../model/campground");


const router = express.Router();

const { isLoggedin, validateNewCampground: validateReqBody, isAuthor, validateNewCampground } = require("../middleware/middleware");



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
router.post("/new", isLoggedin, upload.single('image'), wrapSync(async (req, res, next) => {
	const newGround = new Campground(req.body);
	const geoCode = await geocoding.forwardGeocode({
		query: req.body.location,
		limit: 1
	}).send();
	newGround.geometry = geoCode.body.features[0].geometry;
	newGround.author = req.user.id;
	if (req.file) {
		newGround.image.url = req.file.path;
		newGround.image.filename = req.file.filename;
	}
	await newGround.save();
	req.flash("success", "Added a new Campground");
	res.redirect("/campgrounds");
})
);

router.put("/:id", isLoggedin, isAuthor, upload.single('image'), validateReqBody, wrapSync(async (req, res) => {
	const found = await Campground.findById(req.params.id);
	if (found.image.url) {
		cloudinary.uploader.destroy(found.image.filename);
	}
	const geoCode = await geocoding.forwardGeocode({
		query: req.body.location,
		limit: 1
	}).send();
	found.geometry = geoCode.body.features[0].geometry;
	found.image.url = req.file.path;
	found.image.filename = req.file.filename;
	await found.updateOne(req.body);
	await found.save();
	res.redirect(`/campgrounds/${req.params.id}`);
})
);

router.delete("/:id", isLoggedin, isAuthor, wrapSync(async (req, res) => {
	const camp = await Campground.findByIdAndDelete(req.params.id);
	cloudinary.uploader.destroy(camp.image.filename);
	req.flash("success", "Deleted the Campground");
	res.redirect(`/campgrounds`);
})
);

module.exports = router;
