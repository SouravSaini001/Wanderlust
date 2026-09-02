const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const {
    renderBookingForm,
    createBooking,
    checkAvailability
} = require("../controllers/bookings.js");

const {
    isLoggedIn
} = require("../middleware.js");


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
// CREATE BOOKING
// ============================================

router.post(
    "/:id",
    isLoggedIn,
    wrapAsync(createBooking)
);


module.exports = router;