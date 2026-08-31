
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const port = 3000;

const dbURL = process.env.ATLASDB_URL;


// ===============================
// DATABASE CONNECTION
// ===============================

async function main() {
    await mongoose.connect(dbURL);
}


// ===============================
// VIEW ENGINE
// ===============================

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);


// ===============================
// MONGODB SESSION STORE
// ===============================

const store = MongoStore.create({
    mongoUrl: dbURL,

    crypto: {
        secret: process.env.SECRET,
    },

    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE:", err);
});


// ===============================
// SESSION
// ===============================

const sessionOptions = {

    store,

    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,

        maxAge: 1000 * 60 * 60 * 24 * 7,

        httpOnly: true,
    },
};

app.use(session(sessionOptions));


// ===============================
// FLASH
// ===============================

app.use(flash());


// ===============================
// PASSPORT
// ===============================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// ===============================
// GLOBAL VARIABLES
// ===============================

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    // Current logged-in user
    res.locals.currUser = req.user || null;

    res.locals.MAP_TOKEN = process.env.MAP_TOKEN;

    next();
});


// ===============================
// ROUTES
// ===============================

// Listings
app.use("/listings", listingsRouter);

// Reviews
app.use("/listings/:id/reviews", reviewsRouter);

// Homepage
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// User routes
app.use("/", userRouter);


// ===============================
// 404 ERROR
// ===============================

app.use((req, res, next) => {

    next(
        new ExpressError(
            404,
            "Page not found!"
        )
    );
});


// ===============================
// ERROR HANDLING
// ===============================

app.use((err, req, res, next) => {

    const {
        statusCode = 500,
        message = "Something went wrong!",
    } = err;

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).render(
        "listings/error",
        { message }
    );
});


// ===============================
// START SERVER AFTER DB CONNECTION
// ===============================

main()
    .then(() => {

        console.log("Connection Formed...");

        app.listen(port, () => {

            console.log(
                `App is listening on http://localhost:${port}`
            );

        });

    })
    .catch((err) => {

        console.log(
            "MongoDB Connection Error:",
            err
        );

    });

