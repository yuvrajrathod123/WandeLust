const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Review = require("../models/review.js");

// here we are validating the listing (server side)
const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//------------------------ listings routes ---------------------------------------

// index route
router.get("/", wrapAsync( async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

// new route
router.get("/new", (req, res)=>{
    res.render("listings/new.ejs");
});

// show route
// router.get("/listings/:id", wrapAsync( async (req,res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", {listing});
// }));

// or
router.get("/:id", wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        // Manually fetch reviews associated with the listing
        const reviews = await Review.find({ _id: { $in: listing.reviews } });

        // if(!listing){
        //     req.flash("error", "Listing you are requested for does not exit!") 
        //     res.redirect("/listings")
        // }
        res.render("listings/show.ejs", { listing, reviews });
    } catch (err) {
        // Handle errors routerropriately
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}));


// create route
router.post(
    "/",
    validateListing,
    wrapAsync( async (req,res, next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing is Created!")
        res.redirect("/listings");
    })
);

// edit route
router.get("/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// update route
router.put(
    "/:id",
    validateListing,
    wrapAsync( async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing is Updated!")
    res.redirect(`/listings/${id}`);
}));

// delete route
router.delete("/:id",wrapAsync( async(req, res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing is Deleted!")
    res.redirect("/listings");
}));

module.exports = router;