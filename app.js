const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
.then((res)=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
// ---------------------------------------------------------------------------------------------

app.get("/", (req, res)=>{
    res.send("hiii i am root ");
})

// index route
app.get("/listings", async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
})

// new route
app.get("/listing/new", (req, res)=>{
    res.render("listings/new.ejs");
})

// show route
app.get("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
})

// crerate route
app.post("/listings", async (req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

// edit route
app.get("/listings/:id/edit", async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})

// update route
app.put("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
})

// delete route
app.delete("/listings/:id", async(req, res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})




// --------------------------------------------------------------------------------------------------
app.listen(8080, ()=>{
    console.log("server is listening on port 8080");
})