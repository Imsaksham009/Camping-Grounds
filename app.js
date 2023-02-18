const express = require("express");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const AppError = require("./utils/Error"); //Apperror class

const app = express();
const PORT = 5000;

const mongoose = require("mongoose");

const userRoutes = require("./routes/user");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

//mongoose connection
mongoose
	.set("strictQuery", false)
	.connect("mongodb://127.0.0.1:27017/camp-grounds")
	.then(() => {
		console.log("Database Connected");
	})
	.catch((e) => console.log(e));

//middleware and setters
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", __dirname + "/templateEJS");

app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

//session & cookie
app.use(
	session({
		secret: "IAMASECRETEHICHISVERYMUCHABIGSECRET",
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		},
	})
);

//flash Messages
app.use(flash());
app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

//user model for passport
const User = require("./model/user");

//passport middlewares
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
app.use("/user", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//Page not found error
app.all("*", (req, res, next) => {
	next(new AppError("PAGE NOT FOUND", 404));
});

//error middleware
app.use((err, req, res, next) => {
	if (!err.status) err.status = 404;
	res.status(err.status).render("campgrounds/error", { err });
});

//listener
app.listen(PORT, () => {
	console.log("Server is running on PORT:- ", PORT);
});
