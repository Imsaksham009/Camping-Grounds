const mongoose = require("mongoose");
const { Schema } = mongoose;

const campgroundSchema = new Schema({
	title: String,
	price: Number,
	image: String,
	description: String,
	location: String,
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: "Review",
		},
	],
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
