const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


main()
.then((res)=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// ------------------------------ middlewares -----------------------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOption = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOption));
app.use(flash());
// a middleware that initialize the passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ---------------------------------------------------------------------------------------------

app.get("/", (req, res)=>{
    res.send("hiii i am root ");
});

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get("/demouser", async (req, res)=>{
    let fakeUser = new User({
        email: "pavan@123gmail.com",
        username: "pavan"
    });

    let registerUser = await User.register(fakeUser, "pavan@123");
    res.send(registerUser);
})


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// ----------------------------------------------------------------------------------------------

// agar upar koi bhi request match nhi to ye execute hoga baki saree request ke liye
app.all("*", (req,res,next) => {
    next(new ExpressError(404, "page not found!"));
});

// error handling middleware
app.use((err, req, res, next)=>{
    let {statusCode=500, message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
});



// --------------------------------------------------------------------------------------------------
app.listen(8080, ()=>{
    console.log("server is listening on port 8080");
});