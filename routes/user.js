const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");

const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");


// ===============================
// SIGNUP
// ===============================

router.route("/signup")
    .get(
        wrapAsync(userController.renderSignupForm)
    )
    .post(
        wrapAsync(userController.createUser)
    );


// ===============================
// VERIFY SIGNUP OTP
// ===============================

router.route("/verify-otp")
    .get(
        wrapAsync(userController.renderVerifyOTPForm)
    )
    .post(
        wrapAsync(userController.verifyOTP)
    );


// ===============================
// FORGOT PASSWORD
// ===============================

// Step 1: Enter username/email
router.get(
    "/forgot-password",
    wrapAsync(userController.renderForgotPasswordForm)
);

// Step 2: Find user + send OTP
router.post(
    "/forgot-password",
    wrapAsync(userController.sendForgotPasswordOTP)
);


// ===============================
// VERIFY RESET PASSWORD OTP
// ===============================

// Step 3: Enter OTP
router.get(
    "/verify-reset-otp",
    wrapAsync(userController.renderResetOTPForm)
);

router.post(
    "/verify-reset-otp",
    wrapAsync(userController.verifyResetOTP)
);


// ===============================
// RESET PASSWORD
// ===============================

// Step 4: Enter new password
router.get(
    "/reset-password",
    wrapAsync(userController.renderResetPasswordForm)
);

router.post(
    "/reset-password",
    wrapAsync(userController.resetPassword)
);


// ===============================
// RESEND RESET OTP
// ===============================

router.post(
    "/resend-reset-otp",
    wrapAsync(userController.resendResetOTP)
);


// ===============================
// LOGIN
// ===============================

router.route("/login")
    .get(
        wrapAsync(userController.renderLoginForm)
    )
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        wrapAsync(userController.loginUser)
    );


// ===============================
// RESEND SIGNUP OTP
// ===============================

router.post(
    "/resend-otp",
    wrapAsync(userController.resendOTP)
);


// ===============================
// LOGOUT
// ===============================

router.get(
    "/logout",
    userController.logoutUser
);


module.exports = router;