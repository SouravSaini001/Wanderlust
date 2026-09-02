/**

* ============================================
* WANDERLUST - MAIN APPLICATION FILE
* ============================================
  */

// ============================================
// 1. ENVIRONMENT CONFIGURATION
// ============================================

// Load environment variables from .env in development mode
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// ============================================
// 2. REQUIRED PACKAGES
// ============================================

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

// ============================================
// 3. LOCAL FILES
// ============================================

// Error handling utility
const ExpressError = require("./utils/ExpressError.js");

// User model for Passport authentication
const User = require("./Models/user.js");

// Application routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ============================================
// 4. APP & DATABASE CONFIGURATION
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;
const dbURL = process.env.ATLASDB_URL;

// ============================================
// 5. DATABASE CONNECTION
// ============================================

async function connectDB() {
    await mongoose.connect(dbURL);
}

// ============================================
// 6. VIEW ENGINE CONFIGURATION
// ============================================

// Set the folder containing EJS files
app.set("views", path.join(__dirname, "views"));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Enable EJS-Mate for layouts
app.engine("ejs", ejsMate);

// ============================================
// 7. BASIC MIDDLEWARE
// ============================================

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON request bodies
app.use(express.json());

// Allow PUT and DELETE requests using ?_method=PUT/DELETE
app.use(methodOverride("_method"));

// ============================================
// 8. MONGODB SESSION STORE
// ============================================

// Store user sessions in MongoDB Atlas
const store = MongoStore.create({
    mongoUrl: dbURL,

    crypto: {
        secret: process.env.SECRET,
    },

    // Update session in DB only once every 24 hours
    touchAfter: 24 * 60 * 60,

});

// Handle MongoDB session store errors
store.on("error", (err) => {
    console.error("MongoDB Session Store Error:", err);
});

// ============================================
// 9. SESSION CONFIGURATION
// ============================================

const sessionOptions = {
    store,

    secret: process.env.SECRET,

    resave: false,

    // Do not save a session until something is stored in it
    saveUninitialized: false,

    cookie: {
        // Session expires after 7 days
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),

        // Session maximum lifetime: 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,

        // Prevent JavaScript from accessing the session cookie
        httpOnly: true,
    },

};

// Enable sessions
app.use(session(sessionOptions));

// ============================================
// 10. FLASH MESSAGES
// ============================================

// Enables req.flash() for success and error messages
app.use(flash());

// ============================================
// 11. PASSPORT AUTHENTICATION
// ============================================

// Initialize Passport
app.use(passport.initialize());

// Allow Passport to use Express sessions
app.use(passport.session());

// Configure local username/password authentication
passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        User.authenticate()
    )
);

// Store user information in the session
passport.serializeUser(User.serializeUser());

// Retrieve user information from the session
passport.deserializeUser(User.deserializeUser());

// ============================================
// 12. GLOBAL VARIABLES
// ============================================

// Variables available in all EJS templates
app.use((req, res, next) => {
    // Flash messages
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    // Currently logged-in user
    res.locals.currUser = req.user || null;

    // Map token for Mapbox
    res.locals.MAP_TOKEN = process.env.MAP_TOKEN;

    next();


});

// ============================================
// 13. APPLICATION ROUTES
// ============================================

// Homepage redirects to listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.get("/privacy", (req, res) => {
    res.render("pages/privacy");
});

app.get("/terms", (req, res) => {
    res.render("pages/terms");
});

// Listing routes
app.use("/listings", listingsRouter);

// Review routes
app.use("/listings/:id/reviews", reviewsRouter);

// User authentication routes
app.use("/", userRouter);

// ============================================
// 14. 404 - PAGE NOT FOUND
// ============================================

// Runs when no route matches the request
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// ============================================
// 15. GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong!",
    } = err;

    // Prevent sending headers twice
    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).render("listings/error", { message });

});

// ============================================
// 16. START SERVER
// ============================================

// Connect to MongoDB first, then start the Express server
connectDB()
    .then(() => {
        console.log("MongoDB connection successful.");


        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
    });

