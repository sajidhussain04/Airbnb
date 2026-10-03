const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image:{ 
        type: String,
        set: (v) => v === "" ? "default link" : v,
        default: "default link"
    },
    price: Number,
    location: String,
    country: String,
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;
