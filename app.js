const express = require("express");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const axios = require("axios");
const Joi = require("joi");
const wrapSync = require("./utils/catchAsync"); //WrapAsync function
const AppError = require("./utils/Error"); //Apperror class

const app = express();
const PORT = 5000;

const mongoose = require("mongoose");
const Campground = require(__dirname + "/model/campground");
const Review = require(__dirname + "/model/reviews");

//mongoose connection
mongoose
	.set("strictQuery", false)
	.connect("mongodb://127.0.0.1:27017/camp-grounds")
	.then(() => {
		console.log("Database Connected");
	})
	.catch((e) => console.log(e));

app.engine("ejs", ejsmate);
//middleware and setters
app.set("view engine", "ejs");
app.set("views", __dirname + "/templateEJS");

app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

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

const validateReviewBody = function (req, res, next) {
	const schema = Joi.object({
		body: Joi.string().required(),
		rating: Joi.number().required(),
	}).validate(req.body);

	if (schema.error) {
		const msg = schema.error.details.map((er) => {
			return er.message;
		});
		throw new AppError(msg, 400);
	}
	next();
};

//get routes

app.get(
	"/campgrounds",
	wrapSync(async (req, res, next) => {
		const foundGrounds = await Campground.find({});
		if (!foundGrounds) throw new AppError("NOT FOUND", 500);
		res.render("campgrounds/index", { foundGrounds });
	})
);

app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

app.get(
	"/campgrounds/:id/edit",
	wrapSync(async (req, res) => {
		const { id } = req.params;
		const foundGround = await Campground.findById(id);
		if (!foundGround) throw new AppError("Id NOT FOUND", 404);
		res.render("campgrounds/edit", foundGround);
	})
);

//id
app.get(
	"/campgrounds/:id",
	wrapSync(async (req, res) => {
		const { id } = req.params;
		const foundGround = await Campground.findById(id).populate("reviews");
		if (!foundGround) throw new AppError("Id NOT FOUND", 404);
		res.render("campgrounds/show", foundGround);
	})
);

//post routes

app.post(
	"/campgrounds",
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
		res.redirect("/campgrounds");
	})
);

app.post(
	"/campgrounds/:id/reviews",
	validateReviewBody,
	wrapSync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		const newReview = new Review(req.body);
		campground.reviews.push(newReview);
		await newReview.save();
		const d = await campground.save();
		// console.log(d);
		res.redirect(`/campgrounds/${id}`);
	})
);

app.put(
	"/campgrounds/:id",
	validateReqBody,
	wrapSync(async (req, res) => {
		await Campground.findByIdAndUpdate(req.params.id, req.body);
		res.redirect(`/campgrounds/${req.params.id}`);
	})
);

app.delete(
	"/campgrounds/:id",
	wrapSync(async (req, res) => {
		await Campground.findByIdAndDelete(req.params.id);
		res.redirect(`/campgrounds`);
	})
);

app.delete(
	"/campgrounds/:campid/reviews/:id",
	wrapSync(async (req, res, next) => {
		const { campid, id } = req.params;
		await Campground.findByIdAndUpdate(campid, { $pull: { reviews: id } });
		await Review.findByIdAndDelete(id);
		res.redirect(`/campgrounds/${campid}`);
	})
);

app.all("*", (req, res, next) => {
	next(new AppError("PAGE NOT FOUND", 404));
});

app.use((err, req, res, next) => {
	if (!err.status) err.status = 404;
	res.status(err.status).render("campgrounds/error", { err });
});

//listener
app.listen(PORT, () => {
	console.log("Server is running on PORT:- ", PORT);
});
