const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const { route } = require("./listing.js");
const passport = require("passport");

router.get("/signup", (req,res)=>{
    res.render("user/signup.ejs");
});

router.post("/signup", wrapAsync( async(req,res)=>{
    try{
        const {username, email, password} = req.body;
        let newUser = new User({email,username});
        await User.register(newUser, password);
        req.flash("success", "Welcome to Wanderlust");
        res.redirect("/listings"); 
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
}));

router.get("/login", (req,res)=>{
    res.render("user/login.ejs");
});

router.post(
    "/login", 
    passport.authenticate("local",{
        failureRedirect: "/login",
        failureFlash: true,
    }),
    wrapAsync( async(req,res)=>{
    try{
        req.flash("success","Welcome to Wanderlust, you are logged in!"); 
        res.redirect("/listings");   
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/login");
    }
    
}));

module.exports = router;