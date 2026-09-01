/**
 * ============================================
 * WANDERLUST - USER CONTROLLER
 * ============================================
 *
 * This controller handles:
 *
 * 1. User signup
 * 2. Email OTP verification
 * 3. OTP resend
 * 4. User login
 * 5. User logout
 * 6. Forgot password
 * 7. Password reset OTP verification
 * 8. Password reset
 */


// ============================================
// 1. IMPORT REQUIRED MODULES
// ============================================

const User = require("../Models/user.js");
const PendingUser = require("../Models/pendingUser.js");

const sendOTP = require("../utils/sendOTP.js");

const {
    encrypt,
    decrypt,
} = require("../utils/crypto.js");

const {
    generateOTP,
    hashOTP,
} = require("../utils/otp.js");


// ============================================
// 2. RENDER SIGNUP FORM
// ============================================

/**
 * Display the signup page.
 */

module.exports.renderSignupForm = async (req, res) => {

    res.render("users/signup.ejs");
};


// ============================================
// 3. CREATE PENDING USER
// ============================================
//
// The user is NOT immediately created in the
// User collection.
//
// Instead:
//     Signup data
//          ↓
//     Generate OTP
//          ↓
//     Encrypt password
//          ↓
//     Store in PendingUser
//          ↓
//     Send OTP
//          ↓
//     Verify OTP
//          ↓
//     Create actual User
//

module.exports.createUser = async (req, res, next) => {

    try {

        const {
            username,
            email,
            password,
        } = req.body;


        // ----------------------------------------
        // Check whether username already exists
        // ----------------------------------------

        const existingUsername = await User.findOne({
            username,
        });

        if (existingUsername) {

            req.flash(
                "error",
                "Username already exists."
            );

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Check whether email already exists
        // ----------------------------------------

        const existingEmail = await User.findOne({
            email,
        });

        if (existingEmail) {

            req.flash(
                "error",
                "Email already registered."
            );

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Generate OTP
        // ----------------------------------------

        const otp = generateOTP();


        // ----------------------------------------
        // Hash OTP
        // ----------------------------------------
        //
        // The actual OTP is never stored in
        // the database.
        //

        const otpHash = hashOTP(otp);


        // ----------------------------------------
        // Encrypt Password
        // ----------------------------------------
        //
        // Password is temporarily encrypted
        // because the user has not completed
        // email verification yet.
        //

        const encryptedPassword = encrypt(password);


        // ----------------------------------------
        // Delete Previous Pending Registration
        // ----------------------------------------
        //
        // Prevent multiple pending registrations
        // for the same email.
        //

        await PendingUser.deleteMany({
            email,
        });


        // ----------------------------------------
        // Create Pending User
        // ----------------------------------------

        await PendingUser.create({

            username,

            email,

            password: {
                encrypted: encryptedPassword.encrypted,
                iv: encryptedPassword.iv,
            },

            otpHash,

            // OTP valid for 5 minutes
            otpExpires: new Date(
                Date.now() + 5 * 60 * 1000
            ),

            otpAttempts: 0,
        });


        // ----------------------------------------
        // Store Email in Session
        // ----------------------------------------
        //
        // Only the email is stored in the session.
        // The password and OTP are NOT stored
        // in the session.
        //

        req.session.otpEmail = email;


        // ----------------------------------------
        // Send OTP Email
        // ----------------------------------------

        await sendOTP(email, otp);


        req.flash(
            "success",
            "OTP sent to your email. Please verify your email."
        );


        // Go to OTP verification page
        res.redirect("/verify-otp");

    } catch (err) {

        next(err);
    }
};


// ============================================
// 4. RENDER VERIFY OTP FORM
// ============================================

module.exports.renderVerifyOTPForm = async (req, res) => {

    // User must have started signup first.
    if (!req.session.otpEmail) {

        req.flash(
            "error",
            "Please signup first."
        );

        return res.redirect("/signup");
    }

    res.render("users/verify-otp.ejs");
};


// ============================================
// 5. VERIFY SIGNUP OTP
// ============================================
//
// This verifies the OTP entered by the user.
//
// If correct:
//     PendingUser
//          ↓
//     Decrypt password
//          ↓
//     Create User
//          ↓
//     Delete PendingUser
//          ↓
//     Login user
//

module.exports.verifyOTP = async (req, res, next) => {

    try {

        const { otp } = req.body;


        // ----------------------------------------
        // Check Signup Session
        // ----------------------------------------

        if (!req.session.otpEmail) {

            req.flash(
                "error",
                "Please signup first."
            );

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Find Pending User
        // ----------------------------------------

        const pendingUser = await PendingUser.findOne({
            email: req.session.otpEmail,
        });


        // ----------------------------------------
        // Pending Registration Not Found
        // ----------------------------------------

        if (!pendingUser) {

            req.flash(
                "error",
                "Registration expired. Please signup again."
            );

            req.session.otpEmail = null;

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Check OTP Expiration
        // ----------------------------------------

        if (
            Date.now() >
            pendingUser.otpExpires.getTime()
        ) {

            await PendingUser.deleteOne({
                _id: pendingUser._id,
            });

            req.session.otpEmail = null;

            req.flash(
                "error",
                "OTP expired. Please signup again."
            );

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Check Maximum OTP Attempts
        // ----------------------------------------

        if (pendingUser.otpAttempts >= 5) {

            await PendingUser.deleteOne({
                _id: pendingUser._id,
            });

            req.session.otpEmail = null;

            req.flash(
                "error",
                "Too many incorrect attempts. Please signup again."
            );

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Hash Entered OTP
        // ----------------------------------------

        const enteredOTPHash = hashOTP(otp);


        // ----------------------------------------
        // Compare OTP
        // ----------------------------------------

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


        // ========================================
        // OTP IS CORRECT
        // ========================================


        // ----------------------------------------
        // Decrypt Temporary Password
        // ----------------------------------------

        const password = decrypt(
            pendingUser.password.encrypted,
            pendingUser.password.iv
        );


        // ----------------------------------------
        // Create New User
        // ----------------------------------------

        const newUser = new User({
            username: pendingUser.username,
            email: pendingUser.email,
        });


        // ----------------------------------------
        // Register User Using Passport
        // ----------------------------------------
        //
        // passport-local-mongoose handles the
        // password hashing for the permanent user.
        //

        const registeredUser = await User.register(
            newUser,
            password
        );


        // ----------------------------------------
        // Delete Pending Registration
        // ----------------------------------------

        await PendingUser.deleteOne({
            _id: pendingUser._id,
        });


        // ----------------------------------------
        // Clear Signup Session
        // ----------------------------------------

        req.session.otpEmail = null;


        // ----------------------------------------
        // Automatically Login User
        // ----------------------------------------

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


// ============================================
// 6. RESEND SIGNUP OTP
// ============================================

module.exports.resendOTP = async (req, res, next) => {

    try {

        const email = req.session.otpEmail;


        // ----------------------------------------
        // Check Signup Session
        // ----------------------------------------

        if (!email) {

            req.flash(
                "error",
                "Please signup first."
            );

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Find Pending User
        // ----------------------------------------

        const pendingUser = await PendingUser.findOne({
            email,
        });


        if (!pendingUser) {

            req.flash(
                "error",
                "Registration expired. Please signup again."
            );

            req.session.otpEmail = null;

            return res.redirect("/signup");
        }


        // ----------------------------------------
        // Generate New OTP
        // ----------------------------------------

        const otp = generateOTP();


        // ----------------------------------------
        // Hash New OTP
        // ----------------------------------------

        pendingUser.otpHash = hashOTP(otp);


        // ----------------------------------------
        // Reset OTP Expiration
        // ----------------------------------------

        pendingUser.otpExpires = new Date(
            Date.now() + 5 * 60 * 1000
        );


        // ----------------------------------------
        // Reset OTP Attempts
        // ----------------------------------------

        pendingUser.otpAttempts = 0;


        await pendingUser.save();


        // ----------------------------------------
        // Send New OTP
        // ----------------------------------------

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


// ============================================
// 7. RENDER LOGIN FORM
// ============================================

module.exports.renderLoginForm = async (req, res) => {

    res.render("users/login.ejs");
};


// ============================================
// 8. LOGIN USER
// ============================================
//
// Passport handles authentication before this
// controller is called.
//
// This controller decides where the user should
// be redirected after successful login.
//

module.exports.loginUser = async (req, res) => {

    req.flash(
        "success",
        "Welcome to Wanderlust! You are logged in!"
    );


    // Use saved URL or default to listings.
    let redirectUrl =
        res.locals.redirectUrl || "/listings";


    // Remove query parameters
    redirectUrl = redirectUrl.split("?")[0];


    // Prevent redirecting back to review routes.
    if (redirectUrl.includes("/reviews")) {

        redirectUrl =
            redirectUrl.split("/reviews")[0];
    }


    res.redirect(redirectUrl);
};


// ============================================
// 9. LOGOUT USER
// ============================================

module.exports.logoutUser = (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash(
            "success",
            "Logged You Out!"
        );

        res.redirect("/listings");
    });
};


// ============================================
// 10. RENDER FORGOT PASSWORD FORM
// ============================================

module.exports.renderForgotPasswordForm = (
    req,
    res
) => {

    res.render(
        "users/forgot-password.ejs"
    );
};


// ============================================
// 11. SEND FORGOT PASSWORD OTP
// ============================================
//
// User can enter either:
//
//     Email
//       OR
//     Username
//
// If the account exists:
//     Generate OTP
//          ↓
//     Store reset data in session
//          ↓
//     Send OTP to registered email
//

module.exports.sendForgotPasswordOTP = async (
    req,
    res
) => {

    try {

        let { identifier } = req.body;

        identifier = identifier.trim();

        let user;


        // ----------------------------------------
        // Check Whether Identifier Is Email
        // ----------------------------------------

        if (identifier.includes("@")) {

            user = await User.findOne({
                email: identifier.toLowerCase(),
            });

        } else {

            // Treat identifier as username
            user = await User.findOne({
                username: identifier,
            });
        }


        // ----------------------------------------
        // User Not Found
        // ----------------------------------------

        if (!user) {

            req.flash(
                "error",
                "No account found with these details."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        // ----------------------------------------
        // Generate OTP
        // ----------------------------------------

        const otp = generateOTP();


        // ----------------------------------------
        // Store Reset Information in Session
        // ----------------------------------------

        req.session.passwordReset = {

            userId: user._id.toString(),

            otp,

            // OTP valid for 5 minutes
            expiresAt:
                Date.now() + 5 * 60 * 1000,

            // Maximum incorrect attempts
            attempts: 0,

            // Number of OTP resends
            resendCount: 0,

            // Used for 60-second resend cooldown
            lastSentAt: Date.now(),

            // OTP has not been verified yet
            verified: false,
        };


        // ----------------------------------------
        // Send OTP to Registered Email
        // ----------------------------------------

        await sendOTP(
            user.email,
            otp
        );


        req.flash(
            "success",
            "OTP sent to your registered email."
        );

        return res.redirect(
            "/verify-reset-otp"
        );

    } catch (err) {

        console.error(
            "Forgot Password Error:",
            err
        );

        req.flash(
            "error",
            "Unable to send OTP. Please try again later."
        );

        return res.redirect(
            "/forgot-password"
        );
    }
};


// ============================================
// 12. RENDER RESET OTP FORM
// ============================================

module.exports.renderResetOTPForm = (
    req,
    res
) => {

    if (!req.session.passwordReset) {

        req.flash(
            "error",
            "Password reset session expired. Please try again."
        );

        return res.redirect(
            "/forgot-password"
        );
    }

    res.render(
        "users/verify-reset-otp.ejs"
    );
};


// ============================================
// 13. VERIFY PASSWORD RESET OTP
// ============================================

module.exports.verifyResetOTP = async (
    req,
    res
) => {

    const { otp } = req.body;

    const reset =
        req.session.passwordReset;


    // ----------------------------------------
    // Check Reset Session
    // ----------------------------------------

    if (!reset) {

        req.flash(
            "error",
            "Password reset session expired. Please try again."
        );

        return res.redirect(
            "/forgot-password"
        );
    }


    // ----------------------------------------
    // Maximum 5 Attempts
    // ----------------------------------------

    if (reset.attempts >= 5) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "Too many incorrect attempts. Please request a new OTP."
        );

        return res.redirect(
            "/forgot-password"
        );
    }


    // ----------------------------------------
    // Check OTP Expiration
    // ----------------------------------------

    if (Date.now() > reset.expiresAt) {

        delete req.session.passwordReset;

        req.flash(
            "error",
            "OTP expired. Please request a new OTP."
        );

        return res.redirect(
            "/forgot-password"
        );
    }


    // ----------------------------------------
    // Compare OTP
    // ----------------------------------------

    if (otp !== reset.otp) {

        reset.attempts++;

        req.flash(
            "error",
            `Invalid OTP. ${5 - reset.attempts} attempts remaining.`
        );

        return res.redirect(
            "/verify-reset-otp"
        );
    }


    // ========================================
    // OTP IS CORRECT
    // ========================================

    reset.verified = true;


    // OTP cannot be reused.
    reset.otp = null;
    reset.expiresAt = null;
    reset.attempts = 0;


    req.flash(
        "success",
        "OTP verified successfully. You can now create a new password."
    );

    res.redirect(
        "/reset-password"
    );
};


// ============================================
// 14. RENDER RESET PASSWORD FORM
// ============================================

module.exports.renderResetPasswordForm = (
    req,
    res
) => {

    const reset =
        req.session.passwordReset;


    // User must verify OTP first.
    if (!reset || !reset.verified) {

        req.flash(
            "error",
            "Please verify the OTP first."
        );

        return res.redirect(
            "/forgot-password"
        );
    }


    res.render(
        "users/reset-password.ejs"
    );
};


// ============================================
// 15. RESET PASSWORD
// ============================================
//
// After successful OTP verification:
//
//     New Password
//          ↓
//     setPassword()
//          ↓
//     Passport hashes password
//          ↓
//     Save User
//

module.exports.resetPassword = async (
    req,
    res,
    next
) => {

    try {

        const {
            password,
            confirmPassword,
        } = req.body;

        const reset =
            req.session.passwordReset;


        // ----------------------------------------
        // Check Reset Session
        // ----------------------------------------

        if (!reset || !reset.verified) {

            req.flash(
                "error",
                "Please verify the OTP first."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        // ----------------------------------------
        // Check Password Confirmation
        // ----------------------------------------

        if (password !== confirmPassword) {

            req.flash(
                "error",
                "Passwords do not match."
            );

            return res.redirect(
                "/reset-password"
            );
        }


        // ----------------------------------------
        // Find User
        // ----------------------------------------

        const user = await User.findById(
            reset.userId
        );


        if (!user) {

            delete req.session.passwordReset;

            req.flash(
                "error",
                "User account not found."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        // ----------------------------------------
        // Change Password
        // ----------------------------------------
        //
        // passport-local-mongoose provides
        // setPassword(), which safely hashes
        // the new password.
        //

        await user.setPassword(password);

        await user.save();


        // ----------------------------------------
        // Clear Reset Session
        // ----------------------------------------

        delete req.session.passwordReset;


        req.flash(
            "success",
            "Password changed successfully! Please login with your new password."
        );

        res.redirect("/login");

    } catch (err) {

        next(err);
    }
};


// ============================================
// 16. RESEND PASSWORD RESET OTP
// ============================================
//
// Rules:
//
//     Maximum 3 resends
//     60-second cooldown
//     New OTP valid for 5 minutes
//     Attempts reset to 0
//

module.exports.resendResetOTP = async (
    req,
    res
) => {

    try {

        const reset =
            req.session.passwordReset;


        // ----------------------------------------
        // Check Reset Session
        // ----------------------------------------

        if (!reset) {

            req.flash(
                "error",
                "Password reset session expired. Please start again."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        // ----------------------------------------
        // Maximum Resend Limit
        // ----------------------------------------

        if (reset.resendCount >= 3) {

            delete req.session.passwordReset;

            req.flash(
                "error",
                "Maximum resend limit reached. Please start again."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        // ----------------------------------------
        // 60-Second Cooldown
        // ----------------------------------------

        const now = Date.now();

        const timeSinceLastOTP =
            now - reset.lastSentAt;

        const cooldown =
            60 * 1000;


        if (timeSinceLastOTP < cooldown) {

            const remainingSeconds =
                Math.ceil(
                    (cooldown - timeSinceLastOTP) /
                    1000
                );

            req.flash(
                "error",
                `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            );

            return res.redirect(
                "/verify-reset-otp"
            );
        }


        // ----------------------------------------
        // Find User
        // ----------------------------------------

        const user = await User.findById(
            reset.userId
        );


        if (!user) {

            delete req.session.passwordReset;

            req.flash(
                "error",
                "User account not found."
            );

            return res.redirect(
                "/forgot-password"
            );
        }


        // ----------------------------------------
        // Generate New OTP
        // ----------------------------------------

        const otp = generateOTP();


        // ----------------------------------------
        // Update Reset Session
        // ----------------------------------------

        reset.otp = otp;

        reset.expiresAt =
            Date.now() + 5 * 60 * 1000;

        reset.lastSentAt =
            Date.now();

        reset.resendCount++;

        reset.attempts = 0;

        reset.verified = false;


        // ----------------------------------------
        // Send New OTP
        // ----------------------------------------

        await sendOTP(
            user.email,
            otp
        );


        req.flash(
            "success",
            "A new OTP has been sent to your registered email."
        );

        res.redirect(
            "/verify-reset-otp"
        );

    } catch (err) {

        console.error(
            "Resend Reset OTP Error:",
            err
        );

        req.flash(
            "error",
            "Unable to resend OTP. Please try again."
        );

        res.redirect(
            "/verify-reset-otp"
        );
    }
};