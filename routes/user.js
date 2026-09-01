/**
 * ============================================
 * WANDERLUST - USER ROUTES
 * ============================================
 *
 * This file handles all user-related routes:
 *
 * 1. Signup
 * 2. Email OTP verification
 * 3. Resend signup OTP
 * 4. Login
 * 5. Logout
 * 6. Forgot password
 * 7. Password reset OTP
 * 8. Password reset
 */


// ============================================
// 1. IMPORT REQUIRED MODULES
// ============================================

const express = require("express");

const router = express.Router({
    mergeParams: true,
});

const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync.js");

const {
    saveRedirectUrl,
} = require("../middleware.js");

const userController = require(
    "../controllers/users.js"
);


// ============================================
// 2. SIGNUP
// ============================================
//
// GET:
//     Display signup form
//
// POST:
//     Create temporary PendingUser
//     Generate and send OTP
//

router.route("/signup")

    // Display signup page
    .get(
        wrapAsync(
            userController.renderSignupForm
        )
    )

    // Process signup form
    .post(
        wrapAsync(
            userController.createUser
        )
    );


// ============================================
// 3. VERIFY SIGNUP OTP
// ============================================
//
// GET:
//     Display OTP verification form
//
// POST:
//     Verify OTP
//     Create permanent User
//     Login user
//

router.route("/verify-otp")

    // Display OTP form
    .get(
        wrapAsync(
            userController.renderVerifyOTPForm
        )
    )

    // Verify OTP
    .post(
        wrapAsync(
            userController.verifyOTP
        )
    );


// ============================================
// 4. RESEND SIGNUP OTP
// ============================================
//
// Sends a new OTP for the current
// pending registration.
//

router.post(
    "/resend-otp",
    wrapAsync(
        userController.resendOTP
    )
);


// ============================================
// 5. LOGIN
// ============================================
//
// GET:
//     Display login form
//
// POST:
//     Passport authenticates user
//     ↓
//     loginUser decides redirect URL
//

router.route("/login")

    // Display login page
    .get(
        wrapAsync(
            userController.renderLoginForm
        )
    )

    // Authenticate user
    .post(

        // Save the URL the user originally
        // wanted to access.
        saveRedirectUrl,

        // Passport Local authentication
        passport.authenticate(
            "local",
            {
                failureRedirect: "/login",
                failureFlash: true,
            }
        ),

        // Successful login
        wrapAsync(
            userController.loginUser
        )
    );


// ============================================
// 6. LOGOUT
// ============================================
//
// Logs out the current user and redirects
// them to the listings page.
//

router.get(
    "/logout",
    userController.logoutUser
);


// ============================================
// 7. FORGOT PASSWORD
// ============================================
//
// Step 1:
//     User enters username/email
//
// Step 2:
//     Find account
//     Generate OTP
//     Send OTP to registered email
//

// Display forgot-password form
router.get(
    "/forgot-password",
    wrapAsync(
        userController.renderForgotPasswordForm
    )
);


// Process forgot-password form
router.post(
    "/forgot-password",
    wrapAsync(
        userController.sendForgotPasswordOTP
    )
);


// ============================================
// 8. VERIFY PASSWORD RESET OTP
// ============================================
//
// User enters the OTP received in email.
//

router.get(
    "/verify-reset-otp",
    wrapAsync(
        userController.renderResetOTPForm
    )
);

router.post(
    "/verify-reset-otp",
    wrapAsync(
        userController.verifyResetOTP
    )
);


// ============================================
// 9. RESEND PASSWORD RESET OTP
// ============================================
//
// Allows the user to request another
// password-reset OTP.
//

router.post(
    "/resend-reset-otp",
    wrapAsync(
        userController.resendResetOTP
    )
);


// ============================================
// 10. RESET PASSWORD
// ============================================
//
// GET:
//     Display new-password form
//
// POST:
//     Validate new password
//     Change password
//     Clear reset session
//

router.get(
    "/reset-password",
    wrapAsync(
        userController.renderResetPasswordForm
    )
);

router.post(
    "/reset-password",
    wrapAsync(
        userController.resetPassword
    )
);




// ============================================
// 11. EXPORT ROUTER
// ============================================

module.exports = router;