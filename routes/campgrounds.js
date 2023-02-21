if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });


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
	newGround.author = req.user.id;
	newGround.image.url = req.file.path;
	newGround.image.filename = req.file.filename;
	await newGround.save();
	req.flash("success", "Added a new Campground");
	res.redirect("/campgrounds");
})
);

// router.post("/new", upload.single('image'), (req, res) => {
// 	console.log(req.body, req.file);
// 	res.send("req.body, req.file");
// });

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
