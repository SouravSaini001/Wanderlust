const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const {
    renderBookingForm,
    createBooking,
    checkAvailability,
    showBookingConfirmation,
    createPaymentOrder,
    verifyPayment,
    showBookingSuccess,
    renderEditBooking,
    updateBooking,
    cancelBooking,
} = require("../controllers/bookings.js");

const { isLoggedIn } = require("../middleware.js");

// ============================================
// CHECK ROOM AVAILABILITY
// ============================================

router.get(
    "/:id/availability",
    isLoggedIn,
    wrapAsync(checkAvailability)
);

// ============================================
// SHOW BOOKING FORM
// ============================================

router.get(
    "/:id",
    isLoggedIn,
    wrapAsync(renderBookingForm)
);

// ============================================
// CREATE PENDING BOOKING
// ============================================

router.post(
    "/:id",
    isLoggedIn,
    wrapAsync(createBooking)
);

// ============================================
// SHOW BOOKING CONFIRMATION
// ============================================

router.get(
    "/:id/confirm",
    isLoggedIn,
    wrapAsync(showBookingConfirmation)
);

// ============================================
// CREATE RAZORPAY ORDER
// ============================================

router.post(
    "/:id/pay",
    isLoggedIn,
    wrapAsync(createPaymentOrder)
);

// ============================================
// VERIFY RAZORPAY PAYMENT
// ============================================

router.post(
    "/:id/payment/verify",
    isLoggedIn,
    wrapAsync(verifyPayment)
);

// ============================================
// BOOKING SUCCESS PAGE
// ============================================

router.get(
    "/:id/success",
    isLoggedIn,
    wrapAsync(showBookingSuccess)
);

// ============================================
// SHOW EDIT BOOKING FORM
// ============================================

router.get(
    "/:id/edit",
    isLoggedIn,
    wrapAsync(renderEditBooking)
);

// ============================================
// UPDATE PENDING BOOKING
// ============================================

router.put(
    "/:id",
    isLoggedIn,
    wrapAsync(updateBooking)
);

// ============================================
// CANCEL / DELETE PENDING BOOKING
// ============================================

router.delete(
    "/:id",
    isLoggedIn,
    wrapAsync(cancelBooking)
);

module.exports = router;