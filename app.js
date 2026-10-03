require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const { clear } = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

async function main(){
   await mongoose.connect(process.env.MONGODB_URI);
}

main()
.then((res)=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});



app.get("/", (req, res)=>{
    res.send("working");
});



const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404, errMsg);
    }else{
        next();
    }
};





// INDEX ROUTE (CREATE ROUTE)
app.get("/listings",wrapAsync ( async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));
// SHOW ROUTE (READ ROUTE)
app.get("/listings/:id",wrapAsync ( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
   res.render("listings/show.ejs", { listing });
}));


// NEW ROUTE
app.get("/listing/new", (req, res)=>{
    res.render("listings/new.ejs")
})

// CREATE ROUTE
app.post("/listings",validateListing, wrapAsync(async (req, res, next)=>{ 
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));



// EDIT ROUTE
app.get("/listings/:id/edit",wrapAsync ( async (req, res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// UPDATE ROUTE
app.put("/listings/:id",validateListing, wrapAsync ( async (req, res)=>{
   let { id } = req.params; 
   await Listing.findByIdAndUpdate(id, {...req.body.listing});
   res.redirect(`/listings/${id}`);
}));

// DELETE ROUTE
app.delete("/listings/:id", wrapAsync ( async (req, res)=>{
    let { id } = req.params; 
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
}));


// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new listing({
//         title: "My New Villa",
//         description: "by the beach",
//         price: 200,
//         location: "Nashik",
//         country: "india",
//     });
//  await sampleListing.save();
//         console.log("sample was saved");
//         res.send("successful testing");
// });



app.all("/*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"))
});

app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);    
});
app.listen(8080);




