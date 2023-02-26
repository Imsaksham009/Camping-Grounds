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
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},

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
}, { toJSON: { virtuals: true } });

campgroundSchema.virtual("properties.popUpText").get(function () {
	return `<a href="/campgrounds/${this.id}"><h6>${this.title}</h6></a>`;
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
