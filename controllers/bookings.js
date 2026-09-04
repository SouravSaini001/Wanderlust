const Listing = require("../Models/listing.js");
const Booking = require("../Models/bookings.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ============================================
// RAZORPAY INSTANCE
// ============================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================
// BOOKING HOLD TIME
// ============================================
// Pending bookings will hold rooms for 10 minutes.

const BOOKING_HOLD_TIME = 10 * 60 * 1000;

// ============================================
// SHOW BOOKING FORM
// ============================================

module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("bookings/new.ejs", {
        listing,
    });
};

// ============================================
// CREATE PENDING BOOKING
// ============================================

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests, rooms } = req.body;

    // --------------------------------------------
    // FIND LISTING
    // --------------------------------------------

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // --------------------------------------------
    // CONVERT VALUES TO NUMBERS
    // --------------------------------------------

    const numberOfGuests = Number(guests);
    const numberOfRooms = Number(rooms);

    // --------------------------------------------
    // VALIDATE ROOMS
    // --------------------------------------------

    if (
        !Number.isInteger(numberOfRooms) ||
        numberOfRooms < 1 ||
        numberOfRooms > Number(listing.rooms)
    ) {
        req.flash(
            "error",
            `You can book between 1 and ${listing.rooms} rooms.`
        );

        return res.redirect(`/book/${id}`);
    }

    // --------------------------------------------
    // VALIDATE GUESTS
    // --------------------------------------------

    const maximumGuests = numberOfRooms * 2;

    if (
        !Number.isInteger(numberOfGuests) ||
        numberOfGuests < 1 ||
        numberOfGuests > maximumGuests
    ) {
        req.flash(
            "error",
            `Maximum ${maximumGuests} guests allowed for ${numberOfRooms} room(s).`
        );

        return res.redirect(`/book/${id}`);
    }

    // --------------------------------------------
    // VALIDATE DATES
    // --------------------------------------------

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
        isNaN(checkInDate.getTime()) ||
        isNaN(checkOutDate.getTime())
    ) {
        req.flash(
            "error",
            "Please enter valid check-in and check-out dates."
        );

        return res.redirect(`/book/${id}`);
    }

    // --------------------------------------------
    // CHECK-OUT MUST BE AFTER CHECK-IN
    // --------------------------------------------

    if (checkInDate >= checkOutDate) {
        req.flash(
            "error",
            "Check-out date must be after check-in date."
        );

        return res.redirect(`/book/${id}`);
    }

    // ============================================
    // FIND OVERLAPPING ACTIVE BOOKINGS
    // ============================================
    //
    // CONFIRMED bookings always block rooms.
    //
    // PENDING bookings block rooms ONLY when their
    // 10-minute hold has not expired.
    //
    // EXPIRED and CANCELLED bookings do not block rooms.
    // ============================================

    const overlappingBookings = await Booking.find({
        listing: listing._id,

        $or: [
            {
                status: "confirmed",
            },
            {
                status: "pending",
                expiresAt: {
                    $gt: new Date(),
                },
            },
        ],

        checkIn: {
            $lt: checkOutDate,
        },

        checkOut: {
            $gt: checkInDate,
        },
    });

    // --------------------------------------------
    // CALCULATE BOOKED ROOMS
    // --------------------------------------------

    const bookedRooms = overlappingBookings.reduce(
        (total, booking) => {
            return total + Number(booking.rooms);
        },
        0
    );

    // --------------------------------------------
    // CALCULATE AVAILABLE ROOMS
    // --------------------------------------------

    const availableRooms = Math.max(
        Number(listing.rooms) - bookedRooms,
        0
    );

    // --------------------------------------------
    // CHECK REQUESTED ROOMS
    // --------------------------------------------

    if (numberOfRooms > availableRooms) {
        req.flash(
            "error",
            `Only ${availableRooms} room(s) are available for these dates.`
        );

        return res.redirect(`/book/${id}`);
    }

    // ============================================
    // CALCULATE NUMBER OF NIGHTS
    // ============================================

    const difference =
        checkOutDate.getTime() -
        checkInDate.getTime();

    const numberOfNights =
        difference / (1000 * 60 * 60 * 24);

    // ============================================
    // CALCULATE TOTAL PRICE
    // ============================================

    const totalPrice =
        Number(listing.price) *
        numberOfRooms *
        numberOfNights;

    // ============================================
    // CREATE 10-MINUTE BOOKING HOLD
    // ============================================

    const expiresAt = new Date(
        Date.now() + BOOKING_HOLD_TIME
    );

    // ============================================
    // CREATE PENDING BOOKING
    // ============================================

    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,

        checkIn: checkInDate,
        checkOut: checkOutDate,

        guests: numberOfGuests,
        rooms: numberOfRooms,

        totalPrice: totalPrice,

        status: "pending",

        paymentStatus: "pending",

        // Booking will stop blocking rooms
        // after 10 minutes.
        expiresAt: expiresAt,
    });

    await booking.save();

    // ============================================
    // REDIRECT TO CONFIRMATION PAGE
    // ============================================

    res.redirect(`/book/${booking._id}/confirm`);
};

// ============================================
// SHOW BOOKING CONFIRMATION
// ============================================

module.exports.showBookingConfirmation = async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id)
        .populate("listing")
        .populate("user");

    // --------------------------------------------
    // BOOKING NOT FOUND
    // --------------------------------------------

    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/listings");
    }

    // --------------------------------------------
    // AUTHORIZATION CHECK
    // --------------------------------------------

    if (!booking.user._id.equals(req.user._id)) {
        req.flash(
            "error",
            "You are not authorized to view this booking."
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // CANCELLED BOOKING
    // --------------------------------------------

    if (booking.status === "cancelled") {
        req.flash(
            "error",
            "This booking has been cancelled."
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // EXPIRED BOOKING
    // --------------------------------------------

    if (
        booking.status === "pending" &&
        booking.expiresAt &&
        booking.expiresAt <= new Date()
    ) {
        booking.status = "expired";

        await booking.save();

        req.flash(
            "error",
            "Your booking hold has expired. Please create a new booking."
        );

        return res.redirect(
            `/book/${booking.listing._id}`
        );
    }

    // --------------------------------------------
    // ALREADY PAID BOOKING
    // --------------------------------------------

    if (
        booking.status === "confirmed" &&
        booking.paymentStatus === "paid"
    ) {
        return res.redirect(
            `/book/${booking._id}/success`
        );
    }

    // ============================================
    // CALCULATE NIGHTS
    // ============================================

    const difference =
        booking.checkOut.getTime() -
        booking.checkIn.getTime();

    const numberOfNights =
        difference / (1000 * 60 * 60 * 24);

    // ============================================
    // RENDER CONFIRMATION PAGE
    // ============================================

    res.render("bookings/confirm.ejs", {
        booking,
        listing: booking.listing,
        nights: numberOfNights,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
};

// ============================================
// CREATE RAZORPAY ORDER
// ============================================

module.exports.createPaymentOrder = async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    // --------------------------------------------
    // BOOKING NOT FOUND
    // --------------------------------------------

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Booking not found.",
        });
    }

    // --------------------------------------------
    // AUTHORIZATION CHECK
    // --------------------------------------------

    if (!booking.user.equals(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized for this booking.",
        });
    }

    // --------------------------------------------
    // CANCELLED BOOKING
    // --------------------------------------------

    if (booking.status === "cancelled") {
        return res.status(400).json({
            success: false,
            message: "This booking has been cancelled.",
        });
    }

    // ============================================
    // CHECK BOOKING EXPIRATION
    // ============================================

    if (
        booking.status === "pending" &&
        booking.expiresAt &&
        booking.expiresAt <= new Date()
    ) {
        booking.status = "expired";

        await booking.save();

        return res.status(400).json({
            success: false,
            message:
                "Your booking hold has expired. Please create a new booking.",
        });
    }

    // --------------------------------------------
    // ALREADY PAID
    // --------------------------------------------

    if (
        booking.status === "confirmed" &&
        booking.paymentStatus === "paid"
    ) {
        return res.status(400).json({
            success: false,
            message: "This booking has already been paid.",
        });
    }

    // ============================================
    // RETURN EXISTING RAZORPAY ORDER
    // ============================================

    if (booking.razorpayOrderId) {
        return res.json({
            success: true,

            orderId: booking.razorpayOrderId,

            amount: Math.round(
                booking.totalPrice * 100
            ),

            currency: "INR",

            keyId: process.env.RAZORPAY_KEY_ID,
        });
    }

    // ============================================
    // CALCULATE PAYMENT AMOUNT
    // ============================================

    const amountInPaise = Math.round(
        Number(booking.totalPrice) * 100
    );

    // --------------------------------------------
    // VALIDATE PAYMENT AMOUNT
    // --------------------------------------------

    if (
        !Number.isInteger(amountInPaise) ||
        amountInPaise <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid booking amount.",
        });
    }

    // ============================================
    // RAZORPAY ORDER OPTIONS
    // ============================================

    const options = {
        amount: amountInPaise,

        currency: "INR",

        receipt: `booking_${booking._id}`,

        notes: {
            bookingId: booking._id.toString(),
        },
    };

    // ============================================
    // CREATE RAZORPAY ORDER
    // ============================================

    try {
        const order = await razorpay.orders.create(
            options
        );

        // ----------------------------------------
        // SAVE RAZORPAY ORDER ID
        // ----------------------------------------

        booking.razorpayOrderId = order.id;

        await booking.save();

        // ----------------------------------------
        // SEND ORDER DETAILS
        // ----------------------------------------

        res.json({
            success: true,

            orderId: order.id,

            amount: order.amount,

            currency: order.currency,

            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error(
            "Razorpay Order Creation Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to create payment order.",
        });
    }
};

// ============================================
// VERIFY RAZORPAY PAYMENT
// ============================================

module.exports.verifyPayment = async (req, res) => {
    const { id } = req.params;

    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
    } = req.body;

    // --------------------------------------------
    // VALIDATE PAYMENT DATA
    // --------------------------------------------

    if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature
    ) {
        return res.status(400).json({
            success: false,
            message: "Incomplete payment information.",
        });
    }

    // --------------------------------------------
    // FIND BOOKING
    // --------------------------------------------

    const booking = await Booking.findById(id);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Booking not found.",
        });
    }

    // --------------------------------------------
    // AUTHORIZATION CHECK
    // --------------------------------------------

    if (!booking.user.equals(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized for this booking.",
        });
    }

    // --------------------------------------------
    // ALREADY CONFIRMED
    // --------------------------------------------

    if (
        booking.status === "confirmed" &&
        booking.paymentStatus === "paid"
    ) {
        return res.json({
            success: true,
            message: "Booking already confirmed.",
            bookingId: booking._id,
            redirect: `/book/${booking._id}/success`,
        });
    }

    // ============================================
    // VERIFY RAZORPAY ORDER ID
    // ============================================

    if (
        !booking.razorpayOrderId ||
        booking.razorpayOrderId !== razorpay_order_id
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid Razorpay order.",
        });
    }

    // ============================================
    // GENERATE RAZORPAY SIGNATURE
    // ============================================

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${booking.razorpayOrderId}|${razorpay_payment_id}`
            )
            .digest("hex");

    // ============================================
    // VERIFY SIGNATURE
    // ============================================

    if (
        generatedSignature !==
        razorpay_signature
    ) {
        booking.paymentStatus = "failed";

        await booking.save();

        return res.status(400).json({
            success: false,
            message: "Payment verification failed.",
        });
    }

    // ============================================
    // PAYMENT VERIFIED SUCCESSFULLY
    // ============================================

    booking.paymentStatus = "paid";

    booking.status = "confirmed";

    booking.paymentId =
        razorpay_payment_id;

    booking.paidAt = new Date();

    // Once payment is successful, expiration
    // is no longer needed.
    booking.expiresAt = null;

    await booking.save();

    // ============================================
    // SEND SUCCESS RESPONSE
    // ============================================

    res.json({
        success: true,

        message:
            "Payment successful. Booking confirmed.",

        bookingId: booking._id,

        redirect:
            `/book/${booking._id}/success`,
    });
};

// ============================================
// CHECK ROOM AVAILABILITY
// ============================================

module.exports.checkAvailability = async (
    req,
    res
) => {
    const { id } = req.params;

    const {
        checkIn,
        checkOut,
    } = req.query;

    // --------------------------------------------
    // FIND LISTING
    // --------------------------------------------

    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            error: "Listing not found",
        });
    }

    // --------------------------------------------
    // CONVERT DATES
    // --------------------------------------------

    const checkInDate = new Date(checkIn);

    const checkOutDate = new Date(checkOut);

    // --------------------------------------------
    // VALIDATE DATES
    // --------------------------------------------

    if (
        isNaN(checkInDate.getTime()) ||
        isNaN(checkOutDate.getTime()) ||
        checkInDate >= checkOutDate
    ) {
        return res.status(400).json({
            error: "Invalid date range",
        });
    }

    // ============================================
    // FIND ACTIVE OVERLAPPING BOOKINGS
    // ============================================

    const overlappingBookings = await Booking.find({
        listing: listing._id,

        $or: [
            {
                status: "confirmed",
            },
            {
                status: "pending",
                expiresAt: {
                    $gt: new Date(),
                },
            },
        ],

        checkIn: {
            $lt: checkOutDate,
        },

        checkOut: {
            $gt: checkInDate,
        },
    });

    // --------------------------------------------
    // CALCULATE BOOKED ROOMS
    // --------------------------------------------

    const bookedRooms = overlappingBookings.reduce(
        (total, booking) => {
            return total + Number(booking.rooms);
        },
        0
    );

    // --------------------------------------------
    // CALCULATE AVAILABLE ROOMS
    // --------------------------------------------

    const availableRooms = Math.max(
        Number(listing.rooms) - bookedRooms,
        0
    );

    // ============================================
    // SEND AVAILABILITY
    // ============================================

    res.json({
        totalRooms: Number(listing.rooms),

        bookedRooms: bookedRooms,

        availableRooms: availableRooms,
    });
};

// ============================================
// EXPIRE OLD PENDING BOOKINGS
// ============================================
// This function can be called periodically from
// index.js.
//
// Example:
// setInterval(() => {
//     expirePendingBookings();
// }, 60 * 1000);
//
// ============================================

module.exports.expirePendingBookings = async () => {
    try {
        const result =
            await Booking.updateMany(
                {
                    status: "pending",

                    paymentStatus: "pending",

                    expiresAt: {
                        $lte: new Date(),
                    },
                },

                {
                    $set: {
                        status: "expired",
                    },
                }
            );

        if (result.modifiedCount > 0) {
            console.log(
                `${result.modifiedCount} pending booking(s) expired.`
            );
        }
    } catch (error) {
        console.error(
            "Booking expiration error:",
            error
        );
    }
};

// ============================================
// SHOW BOOKING SUCCESS PAGE
// ============================================

module.exports.showBookingSuccess = async (
    req,
    res
) => {
    const { id } = req.params;

    // --------------------------------------------
    // FIND BOOKING
    // --------------------------------------------

    const booking = await Booking.findById(id)
        .populate("listing")
        .populate("user");

    // --------------------------------------------
    // BOOKING NOT FOUND
    // --------------------------------------------

    if (!booking) {
        req.flash("error", "Booking not found!");

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // AUTHORIZATION CHECK
    // --------------------------------------------

    if (!booking.user._id.equals(req.user._id)) {
        req.flash(
            "error",
            "You are not authorized to view this booking."
        );

        return res.redirect("/listings");
    }

    // ============================================
    // BOOKING MUST BE CONFIRMED + PAID
    // ============================================

    if (
        booking.status !== "confirmed" ||
        booking.paymentStatus !== "paid"
    ) {
        req.flash(
            "error",
            "This booking has not been confirmed yet."
        );

        return res.redirect(
            `/book/${booking._id}/confirm`
        );
    }

    // ============================================
    // CALCULATE NIGHTS
    // ============================================

    const difference =
        booking.checkOut.getTime() -
        booking.checkIn.getTime();

    const numberOfNights =
        difference / (1000 * 60 * 60 * 24);

    // ============================================
    // RENDER SUCCESS PAGE
    // ============================================

    res.render("bookings/success.ejs", {
        booking,
        listing: booking.listing,
        nights: numberOfNights,
    });
};

// ============================================
// SHOW EDIT BOOKING FORM
// ============================================

module.exports.renderEditBooking = async (
    req,
    res
) => {
    const { id } = req.params;

    const booking = await Booking.findById(id)
        .populate("listing");

    if (!booking) {
        req.flash(
            "error",
            "Booking not found!"
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // AUTHORIZATION
    // --------------------------------------------

    if (
        !booking.user.equals(req.user._id)
    ) {
        req.flash(
            "error",
            "You are not authorized to edit this booking."
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // ONLY PENDING BOOKINGS CAN BE EDITED
    // --------------------------------------------

    if (booking.status !== "pending") {
        req.flash(
            "error",
            "Only pending bookings can be edited."
        );

        return res.redirect(
            `/listings/${booking.listing._id}`
        );
    }

    // --------------------------------------------
    // CHECK EXPIRATION
    // --------------------------------------------

    if (
        booking.expiresAt &&
        booking.expiresAt <= new Date()
    ) {
        booking.status = "expired";

        await booking.save();

        req.flash(
            "error",
            "Your booking hold has expired. Please create a new booking."
        );

        return res.redirect(
            `/listings/${booking.listing._id}`
        );
    }

    // --------------------------------------------
    // RENDER EDIT PAGE
    // --------------------------------------------

    res.render("bookings/edit.ejs", {
        booking,
        listing: booking.listing,
    });
};

// ============================================
// UPDATE PENDING BOOKING
// ============================================

module.exports.updateBooking = async (
    req,
    res
) => {
    const { id } = req.params;

    const {
        checkIn,
        checkOut,
        guests,
        rooms,
    } = req.body;

    const booking = await Booking.findById(id)
        .populate("listing");

    if (!booking) {
        req.flash(
            "error",
            "Booking not found!"
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // AUTHORIZATION
    // --------------------------------------------

    if (
        !booking.user.equals(req.user._id)
    ) {
        req.flash(
            "error",
            "You are not authorized to edit this booking."
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // ONLY PENDING BOOKINGS
    // --------------------------------------------

    if (booking.status !== "pending") {
        req.flash(
            "error",
            "Only pending bookings can be edited."
        );

        return res.redirect(
            `/listings/${booking.listing._id}`
        );
    }

    // --------------------------------------------
    // CHECK EXPIRATION
    // --------------------------------------------

    if (
        booking.expiresAt &&
        booking.expiresAt <= new Date()
    ) {
        booking.status = "expired";

        await booking.save();

        req.flash(
            "error",
            "Your booking hold has expired. Please create a new booking."
        );

        return res.redirect(
            `/listings/${booking.listing._id}`
        );
    }

    // --------------------------------------------
    // CONVERT VALUES
    // --------------------------------------------

    const numberOfGuests = Number(guests);
    const numberOfRooms = Number(rooms);

    // --------------------------------------------
    // VALIDATE ROOMS
    // --------------------------------------------

    if (
        !Number.isInteger(numberOfRooms) ||
        numberOfRooms < 1 ||
        numberOfRooms >
            Number(booking.listing.rooms)
    ) {
        req.flash(
            "error",
            `You can book between 1 and ${booking.listing.rooms} rooms.`
        );

        return res.redirect(
            `/book/${booking._id}/edit`
        );
    }

    // --------------------------------------------
    // VALIDATE GUESTS
    // --------------------------------------------

    const maximumGuests =
        numberOfRooms * 2;

    if (
        !Number.isInteger(numberOfGuests) ||
        numberOfGuests < 1 ||
        numberOfGuests > maximumGuests
    ) {
        req.flash(
            "error",
            `Maximum ${maximumGuests} guests allowed for ${numberOfRooms} room(s).`
        );

        return res.redirect(
            `/book/${booking._id}/edit`
        );
    }

    // --------------------------------------------
    // VALIDATE DATES
    // --------------------------------------------

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
        isNaN(checkInDate.getTime()) ||
        isNaN(checkOutDate.getTime())
    ) {
        req.flash(
            "error",
            "Please enter valid check-in and check-out dates."
        );

        return res.redirect(
            `/book/${booking._id}/edit`
        );
    }

    if (checkInDate >= checkOutDate) {
        req.flash(
            "error",
            "Check-out date must be after check-in date."
        );

        return res.redirect(
            `/book/${booking._id}/edit`
        );
    }

    // ============================================
    // FIND OTHER ACTIVE BOOKINGS
    // ============================================
    //
    // IMPORTANT:
    // Exclude the current booking itself.
    // Otherwise it would count its own rooms.
    // ============================================

    const overlappingBookings =
        await Booking.find({
            _id: {
                $ne: booking._id,
            },

            listing: booking.listing._id,

            $or: [
                {
                    status: "confirmed",
                },
                {
                    status: "pending",
                    expiresAt: {
                        $gt: new Date(),
                    },
                },
            ],

            checkIn: {
                $lt: checkOutDate,
            },

            checkOut: {
                $gt: checkInDate,
            },
        });

    // --------------------------------------------
    // CALCULATE BOOKED ROOMS
    // --------------------------------------------

    const bookedRooms =
        overlappingBookings.reduce(
            (total, existingBooking) => {
                return (
                    total +
                    Number(existingBooking.rooms)
                );
            },
            0
        );

    // --------------------------------------------
    // AVAILABLE ROOMS
    // --------------------------------------------

    const availableRooms = Math.max(
        Number(booking.listing.rooms) -
            bookedRooms,
        0
    );

    // --------------------------------------------
    // CHECK ROOM AVAILABILITY
    // --------------------------------------------

    if (
        numberOfRooms >
        availableRooms
    ) {
        req.flash(
            "error",
            `Only ${availableRooms} room(s) are available for these dates.`
        );

        return res.redirect(
            `/book/${booking._id}/edit`
        );
    }

    // ============================================
    // CALCULATE NIGHTS
    // ============================================

    const difference =
        checkOutDate.getTime() -
        checkInDate.getTime();

    const numberOfNights =
        difference /
        (1000 * 60 * 60 * 24);

    // ============================================
    // RECALCULATE PRICE
    // ============================================

    const totalPrice =
        Number(booking.listing.price) *
        numberOfRooms *
        numberOfNights;

    // ============================================
    // UPDATE BOOKING
    // ============================================

    booking.checkIn = checkInDate;

    booking.checkOut = checkOutDate;

    booking.guests = numberOfGuests;

    booking.rooms = numberOfRooms;

    booking.totalPrice = totalPrice;

    // Keep the same expiration time.
    // Editing does NOT give another 10 minutes.

    await booking.save();

    req.flash(
        "success",
        "Booking updated successfully!"
    );

    // --------------------------------------------
    // GO BACK TO CONFIRMATION
    // --------------------------------------------

    res.redirect(
        `/book/${booking._id}/confirm`
    );
};

// ============================================
// CANCEL / DELETE PENDING BOOKING
// ============================================

module.exports.cancelBooking = async (
    req,
    res
) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
        req.flash(
            "error",
            "Booking not found!"
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // AUTHORIZATION
    // --------------------------------------------

    if (
        !booking.user.equals(req.user._id)
    ) {
        req.flash(
            "error",
            "You are not authorized to cancel this booking."
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // ONLY PENDING BOOKINGS
    // --------------------------------------------

    if (booking.status !== "pending") {
        req.flash(
            "error",
            "Only pending bookings can be cancelled."
        );

        return res.redirect("/listings");
    }

    // --------------------------------------------
    // CANCEL BOOKING
    // --------------------------------------------

    booking.status = "cancelled";

    await booking.save();

    req.flash(
        "success",
        "Booking cancelled successfully. The rooms are now available."
    );

    // --------------------------------------------
    // RETURN TO LISTING
    // --------------------------------------------

    res.redirect(
        `/listings/${booking.listing}`
    );
};