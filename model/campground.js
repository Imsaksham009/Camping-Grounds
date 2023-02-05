const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./reviews");

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
