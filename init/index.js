require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const initDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to DB");

        await Listing.deleteMany({});
        console.log("old listings cleared");

        await Listing.insertMany(initData.data);
        console.log(`data was initialized: ${initData.data.length} listings`);

    } catch (err) {
        console.error("Database initialization failed:", err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

initDB();

