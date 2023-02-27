if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require('express-mongo-sanitize');
const AppError = require("./utils/Error"); //Apperror class
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const MongoStore = require('connect-mongo');



const app = express();
const PORT = process.env.PORT || 5000;


//mongoose connection   mongodb://127.0.0.1:27017/camp-grounds
const dbURL = "mongodb://127.0.0.1:27017/camp-grounds" || process.env.DB_URL;
mongoose
	.set("strictQuery", false)
	.connect(dbURL)
	.then(() => {
		console.log("Database Connected");
	})
	.catch((e) => console.log(e));

//middleware and setters
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

//session & cookie
app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		maxAge: 7 * 24 * 60 * 60 * 1000,
	},
	store: MongoStore.create({
		mongoUrl: dbURL,
		secret: process.env.SECRET,
		collectionName: 'session',
		touchAfter: 24 * 3600,
	})
})
);

//flash Messages
app.use(flash());

//user model for passport
const User = require("./model/user");

//passport middlewares
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for locals
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use(mongoSanitize());




//Routes
app.use("/user", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
	res.render("home");
});

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
