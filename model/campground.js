const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./reviews");
// const User = require("./user");
const campgroundSchema = new Schema({
	title: String,
	price: Number,
	image: {
		url: String,
		filename: String
	},
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: "Review",
		},
	],
});

campgroundSchema.post("findOneAndDelete", async (d) => {
	if (d) {
		await Review.deleteMany({
			_id: {
				$in: d.reviews,
			},
		}).catch((e) => {
			console.log(e);
		});
	}
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
