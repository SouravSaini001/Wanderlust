const User = require("../Models/user")

// Render Signup Form 

module.exports.renderSignupForm = async (req, res) => {
    res.render("users/signup.ejs");
}

// Signup User 
module.exports.createUser = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
        if (err) {
            next(err);
        }
        req.flash("success", "Welcome to Wonderlist!");
        res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}


// Render Login form 
module.exports.renderLoginForm = async (req, res) => {
    res.render("users/login.ejs");
}


// Login User 
module.exports.loginUser = async (req, res) => {
    req.flash("success", "Welcome to Wonderlust! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";

    // Remove query string
    redirectUrl = redirectUrl.split("?")[0];

    // Remove everything after `/reviews`
    if (redirectUrl.includes("/reviews")) {
      redirectUrl = redirectUrl.split("/reviews")[0];
    }
    
    res.redirect(redirectUrl);
}

// Logout user 

module.exports.logoutUser = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged You Out!");
    res.redirect("/listings");
  });
}