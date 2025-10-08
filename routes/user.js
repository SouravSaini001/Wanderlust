const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../Models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");

// Signup route
router.route("/signup")
.get(
  wrapAsync(userController.renderSignupForm)
)
.post(
  wrapAsync(userController.createUser)
);

//Login Route 
router.route("/login")
.get(
  wrapAsync(userController.renderLoginForm)
)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(userController.loginUser)
);

//Logout Route
router.get("/logout", userController.logoutUser);

module.exports = router;
