const express = require("express");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const AppError = require("./utils/Error"); //Apperror class

const app = express();
const PORT = 5000;

const mongoose = require("mongoose");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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

//session cookie
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

app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	next();
});

//get routes
app.use("/campgrounds", campgrounds);

// Review Routes
app.use("/campgrounds/:id/reviews", reviews);

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
