const mongoose = require("mongoose");
const Campground = require("../model/campground");
const cities = require(__dirname + "/seeds");
const { descriptors, places } = require(__dirname + "/seedhelper");
const axios = require("axios");
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoding = mbxgeocoding({ accessToken: 'pk.eyJ1IjoiaW1zYWtzaGFtMDA5IiwiYSI6ImNsZHp1eHIwYTA2eHEzdnA1YTZxanZlbzUifQ.ykF2XLKkNuJx2AkrEU7kKQ' });
//mongoose connection

mongoose
	.connect("mongodb+srv://imsaksham009:1tFxUnVWP182pdjo@cluster0.dufmwt6.mongodb.net/camp-grounds?retryWrites=true&w=majority")
	.then(() => {
		console.log("Database Connected");
	})
	.catch((e) => console.log(e));

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
		console.log(e);
	}
};

const saveDB = async () => {
	try {
		await Campground.deleteMany({});
		for (let i = 0; i < 50; i++) {
			const randCityNum = Math.floor(Math.random() * 1000);
			const randName1 = Math.floor(Math.random() * descriptors.length);
			const randName2 = Math.floor(Math.random() * places.length);
			const price = Math.floor(Math.random() * 20) + 10;
			const img = await getImg();
			const loc = `${cities[randCityNum].city}, ${cities[randCityNum].state}`;
			const geoCode = await geocoding.forwardGeocode({
				query: loc,
				limit: 1
			}).send();

			const id = "63fbb34249d2b4fa2154a77c";
			const newGround = new Campground({
				author: id,
				location: loc,
				geometry: geoCode.body.features[0].geometry,
				title: `${descriptors[randName1]} ${places[randName2]}`,
				image: {
					url: img
				},
				price,
				description:
					"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut, quam labore mollitia ex modi nihil perferendis perspiciatis esse rem asperiores consequatur totam consectetur cupiditate illo aspernatur voluptate laudantium recusandae nulla?			Repellat minima fuga tempore soluta quas dignissimos vel quo quis, odio corporis quod ex id sint cupiditate. Nostrum, eum. Sapiente nihil labore quod expedita itaque soluta corrupti dignissimos voluptas. Maiores!",
			});
			await newGround.save();
		}
	} catch (e) {
		console.log(e);
	}
	// console.log(save);
};

saveDB();
