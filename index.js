if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");


let port = 3000;

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const wrapAsync = require('./utils/wrapAsync.js');


const dbURL = process.env.ATLASDB_URL;


// connecting to database 
main()
    .then(() => {
        console.log("Connection Formed...")
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbURL);
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

store.on("error",() => {
    console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7,
        httpOnly : true
    },
}




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.MAP_TOKEN = process.env.MAP_TOKEN;
    next();
})

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


// // Must come after all your other routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});



// Error handling middleware 
app.use((err, req, res, next) => {
    let{statusCode = 500,message = "Something went wrong!"} = err;
    res.status(statusCode).render("listings/error",{message});
});

app.listen(port, () => {
    console.log(`App is listening on http://localhost:${port}`);
});