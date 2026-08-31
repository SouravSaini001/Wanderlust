const User = require("../Models/user");
const sendOTP = require("../utils/sendOTP.js");
const PendingUser = require("../Models/pendingUser.js");
const crypto = require("crypto");

const {
    encrypt,
    decrypt
} = require("../utils/crypto.js");

const {
    generateOTP,
    hashOTP
} = require("../utils/otp.js");

// Render Signup Form
module.exports.renderSignupForm = async (req, res) => {
    res.render("users/signup.ejs");
};


// Sign Up user
module.exports.createUser = async (req, res, next) => {

    try {

        const { username, email, password } = req.body;

        // Check whether username already exists
        const existingUsername = await User.findOne({
            username
        });

        if (existingUsername) {

            req.flash(
                "error",
                "Username already exists."
            );

            return res.redirect("/signup");
        }


        // Check whether email already exists
        const existingEmail = await User.findOne({
            email
        });

        if (existingEmail) {

            req.flash(
                "error",
                "Email already registered."
            );

            return res.redirect("/signup");
        }


        // Generate OTP
        const otp = generateOTP();

        // Hash OTP before storing
        const otpHash = hashOTP(otp);


        // Encrypt password temporarily
        const encryptedPassword = encrypt(password);


        // Delete old pending registration
        await PendingUser.deleteMany({
            email
        });


        // Create pending user
        await PendingUser.create({

            username,

            email,

            password: {
                encrypted: encryptedPassword.encrypted,
                iv: encryptedPassword.iv
            },

            otpHash,

            otpExpires:
                new Date(
                    Date.now() + 5 * 60 * 1000
                ),

            otpAttempts: 0
        });


        // Store ONLY email in session
        req.session.otpEmail = email;


        // Send OTP
        await sendOTP(email, otp);


        req.flash(
            "success",
            "OTP sent to your email. Please verify your email."
        );


        res.redirect("/verify-otp");

    } catch (err) {

        next(err);

    }
};

//Render Verify Otp form
module.exports.renderVerifyOTPForm = async (req, res) => {

    if (!req.session.otpEmail) {

        req.flash(
            "error",
            "Please signup first."
        );

        return res.redirect("/signup");
    }

    res.render("users/verify-otp.ejs");
};

// Render Reset OTP Form

module.exports.renderResetOTPForm = (req, res) => {

    if (!req.session.passwordReset) {

        req.flash(
            "error",
            "Password reset session expired. Please try again."
        );

        return res.redirect("/forgot-password");
    }

    res.render("users/verify-reset-otp");
};

// Render Reset Password Form

module.exports.renderResetPasswordForm = (req, res) => {

    const reset = req.session.passwordReset;

    if (!reset || !reset.verified) {

        req.flash(
            "error",
            "Please verify the OTP first."
        );

        return res.redirect("/forgot-password");
    }

    res.render("users/reset-password");
};

// Reset Password

module.exports.resetPassword = async (req, res, next) => {

    const { password, confirmPassword } = req.body;

    const reset = req.session.passwordReset;


    // Check reset session

    if (!reset || !reset.verified) {

        req.flash(
            "error",
            "Please verify the OTP first."
        );

        return res.redirect("/forgot-password");
    }


    // Check passwords

    if (password !== confirmPassword) {

        req.flash(
            "error",
            "Passwords do not match."
        );

        return res.redirect("/reset-password");
    }


    // Find user

    const user = await User.findById(reset.userId);


    if (!user) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "User account not found."
        );

        return res.redirect("/forgot-password");
    }


    // Change password using Passport Local Mongoose

    await user.setPassword(password);

    await user.save();


    // Delete reset session

    delete req.session.passwordReset;


    req.flash(
        "success",
        "Password changed successfully! Please login with your new password."
    );

    res.redirect("/login");
};

// Resend Password Reset OTP

module.exports.resendResetOTP = async (req, res) => {

    const reset = req.session.passwordReset;


    // No reset session

    if (!reset) {

        req.flash(
            "error",
            "Password reset session expired. Please start again."
        );

        return res.redirect("/forgot-password");
    }


    // Maximum 3 resends

    if (reset.resendCount >= 3) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "Maximum resend limit reached. Please start again."
        );

        return res.redirect("/forgot-password");
    }


    // 60 second cooldown

    const now = Date.now();

    const timeSinceLastOTP =
        now - reset.lastSentAt;

    const cooldown = 60 * 1000;


    if (timeSinceLastOTP < cooldown) {

        const remainingSeconds = Math.ceil(
            (cooldown - timeSinceLastOTP) / 1000
        );

        req.flash(
            "error",
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        );

        return res.redirect("/verify-reset-otp");
    }


    // Find user

    const user = await User.findById(reset.userId);


    if (!user) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "User account not found."
        );

        return res.redirect("/forgot-password");
    }


    // Generate new OTP

    const otp = crypto
        .randomInt(100000, 1000000)
        .toString();


    // Update session

    reset.otp = otp;

    reset.expiresAt =
        Date.now() + 5 * 60 * 1000;

    reset.lastSentAt = Date.now();

    reset.resendCount++;

    reset.attempts = 0;

    reset.verified = false;


    // Send new OTP

    await sendOTP(user.email, otp);


    req.flash(
        "success",
        "A new OTP has been sent to your registered email."
    );

    res.redirect("/verify-reset-otp");
};

// Verify Password Reset OTP

module.exports.verifyResetOTP = async (req, res) => {

    const { otp } = req.body;

    const reset = req.session.passwordReset;


    // No reset session

    if (!reset) {

        req.flash(
            "error",
            "Password reset session expired. Please try again."
        );

        return res.redirect("/forgot-password");
    }


    // Maximum 5 attempts

    if (reset.attempts >= 5) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "Too many incorrect attempts. Please request a new OTP."
        );

        return res.redirect("/forgot-password");
    }


    // OTP expired

    if (Date.now() > reset.expiresAt) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "OTP expired. Please request a new OTP."
        );

        return res.redirect("/forgot-password");
    }


    // Wrong OTP

    if (otp !== reset.otp) {

        reset.attempts++;

        req.flash(
            "error",
            `Invalid OTP. ${5 - reset.attempts} attempts remaining.`
        );

        return res.redirect("/verify-reset-otp");
    }


    // Correct OTP

    reset.verified = true;

    // OTP should not be usable again

    reset.otp = null;

    reset.expiresAt = null;

    reset.attempts = 0;


    req.flash(
        "success",
        "OTP verified successfully. You can now create a new password."
    );

    res.redirect("/reset-password");
};

// Verify OTP
module.exports.verifyOTP = async (req, res, next) => {

    try {

        const { otp } = req.body;


        // Check session
        if (!req.session.otpEmail) {

            req.flash(
                "error",
                "Please signup first."
            );

            return res.redirect("/signup");
        }


        // Find pending user
        const pendingUser =
            await PendingUser.findOne({
                email: req.session.otpEmail
            });


        if (!pendingUser) {

            req.flash(
                "error",
                "Registration expired. Please signup again."
            );

            req.session.otpEmail = null;

            return res.redirect("/signup");
        }


        // Check OTP expiry
        if (
            Date.now() >
            pendingUser.otpExpires.getTime()
        ) {

            await PendingUser.deleteOne({
                _id: pendingUser._id
            });

            req.session.otpEmail = null;

            req.flash(
                "error",
                "OTP expired. Please signup again."
            );

            return res.redirect("/signup");
        }


        // Maximum attempts
        if (pendingUser.otpAttempts >= 5) {

            await PendingUser.deleteOne({
                _id: pendingUser._id
            });

            req.session.otpEmail = null;

            req.flash(
                "error",
                "Too many incorrect attempts. Please signup again."
            );

            return res.redirect("/signup");
        }


        // Hash entered OTP
        const enteredOTPHash =
            hashOTP(otp);


        // Compare OTP
        if (
            enteredOTPHash !==
            pendingUser.otpHash
        ) {

            pendingUser.otpAttempts += 1;

            await pendingUser.save();

            req.flash(
                "error",
                `Invalid OTP. ${5 - pendingUser.otpAttempts} attempts remaining.`
            );

            return res.redirect("/verify-otp");
        }


        // =========================
        // OTP CORRECT
        // =========================


        // Decrypt temporary password
        const password = decrypt(
            pendingUser.password.encrypted,
            pendingUser.password.iv
        );


        // Create actual user
        const newUser = new User({

            username: pendingUser.username,

            email: pendingUser.email

        });


        // Passport Local Mongoose
        const registeredUser =
            await User.register(
                newUser,
                password
            );


        // Delete pending registration
        await PendingUser.deleteOne({
            _id: pendingUser._id
        });


        // Clear session
        req.session.otpEmail = null;


        // Login
        req.login(
            registeredUser,
            (err) => {

                if (err) {
                    return next(err);
                }


                req.flash(
                    "success",
                    "Email verified successfully! Welcome to Wanderlust."
                );


                res.redirect("/listings");

            }
        );

    } catch (err) {

        next(err);

    }
};

//Resend OTP
module.exports.resendOTP = async (req, res, next) => {

    try {

        const email = req.session.otpEmail;

        if (!email) {

            req.flash(
                "error",
                "Please signup first."
            );

            return res.redirect("/signup");
        }


        const pendingUser =
            await PendingUser.findOne({
                email
            });


        if (!pendingUser) {

            req.flash(
                "error",
                "Registration expired. Please signup again."
            );

            req.session.otpEmail = null;

            return res.redirect("/signup");
        }


        // Generate new OTP
        const otp = generateOTP();


        // Hash new OTP
        pendingUser.otpHash =
            hashOTP(otp);


        // New expiry
        pendingUser.otpExpires =
            new Date(
                Date.now() + 5 * 60 * 1000
            );


        // Reset attempts
        pendingUser.otpAttempts = 0;


        await pendingUser.save();


        // Send new OTP
        await sendOTP(email, otp);


        req.flash(
            "success",
            "A new OTP has been sent to your email."
        );


        res.redirect("/verify-otp");

    } catch (err) {

        next(err);

    }
};


// Render Login form
module.exports.renderLoginForm = async (req, res) => {
    res.render("users/login.ejs");
};

// Render Forgot Password Form

// Render Forgot Password Form
module.exports.renderForgotPasswordForm = (req, res) => {
    console.log("GET /forgot-password");

    return res.render("users/forgot-password");
};

// Send Forgot Password OTP

module.exports.sendForgotPasswordOTP = async (req, res) => {

    try {

        let { identifier } = req.body;

        identifier = identifier.trim();

        let user;


        // Check whether input looks like an email
        if (identifier.includes("@")) {

            user = await User.findOne({
                email: identifier.toLowerCase()
            });

        } else {

            // Otherwise treat it as username
            user = await User.findOne({
                username: identifier
            });

        }


        console.log("Identifier:", identifier);
        console.log("User:", user);


        // User not found
        if (!user) {

            req.flash(
                "error",
                "No account found with these details."
            );

            return res.redirect("/forgot-password");
        }


        // Generate 6 digit OTP
        const otp = crypto
            .randomInt(100000, 1000000)
            .toString();

        console.log("Generated OTP:", otp);


        // Store reset information in session
        req.session.passwordReset = {

            userId: user._id.toString(),

            otp: otp,

            expiresAt: Date.now() + 5 * 60 * 1000,

            attempts: 0,

            resendCount: 0,

            lastSentAt: Date.now(),

            verified: false
        };


        // Send OTP to registered email
        await sendOTP(user.email, otp);


        req.flash(
            "success",
            "OTP sent to your registered email."
        );


        return res.redirect("/verify-reset-otp");


    } catch (err) {

        console.error("Forgot Password Error:", err);

        req.flash(
            "error",
            "Unable to send OTP. Please try again later."
        );

        return res.redirect("/forgot-password");
    }
};


module.exports.loginUser = async (req, res) => {
    req.flash(
        "success",
        "Welcome to Wanderlust! You are logged in!"
    );

    let redirectUrl = res.locals.redirectUrl || "/listings";

    redirectUrl = redirectUrl.split("?")[0];

    if (redirectUrl.includes("/reviews")) {
        redirectUrl = redirectUrl.split("/reviews")[0];
    }

    res.redirect(redirectUrl);
};


// Logout user
module.exports.logoutUser = (req, res, next) => {

    req.logOut((err) => {

        if (err) {
            return next(err);
        }

        req.flash("success", "Logged You Out!");
        res.redirect("/listings");
    });
};