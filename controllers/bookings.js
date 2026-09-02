const Listing = require("../Models/listing.js");

const Booking = require("../Models/bookings.js");


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

    res.render("bookings/new.ejs", { listing });
};


// ============================================
// CREATE BOOKING
// ============================================

module.exports.createBooking = async (req, res) => {

    const { id } = req.params;

    const {
        checkIn,
        checkOut,
        guests,
        rooms
    } = req.body;


    // ============================================
    // FIND LISTING
    // ============================================

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }


    // ============================================
    // CONVERT VALUES TO NUMBERS
    // ============================================

    const numberOfGuests = Number(guests);

    const numberOfRooms = Number(rooms);


    // ============================================
    // ROOM VALIDATION
    // ============================================

    if (
        numberOfRooms < 1 ||
        numberOfRooms > listing.rooms
    ) {

        req.flash(
            "error",
            `You can book between 1 and ${listing.rooms} rooms.`
        );

        return res.redirect(`/book/${id}`);
    }


    // ============================================
    // GUEST VALIDATION
    // ============================================

    const maximumGuests =
        numberOfRooms * 2;

    if (
        numberOfGuests < 1 ||
        numberOfGuests > maximumGuests
    ) {

        req.flash(
            "error",
            `Maximum ${maximumGuests} guests allowed for ${numberOfRooms} room(s).`
        );

        return res.redirect(`/book/${id}`);
    }


    // ============================================
    // DATE VALIDATION
    // ============================================

    const checkInDate =
        new Date(checkIn);

    const checkOutDate =
        new Date(checkOut);


    // Check valid dates

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


    // Check-out must be after check-in

    if (checkInDate >= checkOutDate) {

        req.flash(
            "error",
            "Check-out date must be after check-in date."
        );

        return res.redirect(`/book/${id}`);
    }


    // ============================================
    // CHECK ROOM AVAILABILITY
    // ============================================

    const overlappingBookings =
        await Booking.find({

            listing: listing._id,

            status: "confirmed",

            checkIn: {
                $lt: checkOutDate
            },

            checkOut: {
                $gt: checkInDate
            }

        });


    // Calculate already booked rooms

    const bookedRooms =
        overlappingBookings.reduce(
            (total, booking) => {
                return total + booking.rooms;
            },
            0
        );


    // Calculate available rooms

    const availableRooms =
        listing.rooms - bookedRooms;


    // ============================================
    // CHECK IF REQUESTED ROOMS ARE AVAILABLE
    // ============================================

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
        checkOutDate - checkInDate;

    const numberOfNights =
        difference / (1000 * 60 * 60 * 24);


    // ============================================
    // CALCULATE TOTAL PRICE
    // ============================================

    const totalPrice =
        listing.price *
        numberOfRooms *
        numberOfNights;


    // ============================================
    // CREATE BOOKING
    // ============================================

    const booking = new Booking({

        listing: listing._id,

        user: req.user._id,

        checkIn: checkInDate,

        checkOut: checkOutDate,

        guests: numberOfGuests,

        rooms: numberOfRooms,

        totalPrice: totalPrice

    });


    // ============================================
    // SAVE BOOKING
    // ============================================

    await booking.save();


    // ============================================
    // SUCCESS MESSAGE
    // ============================================

    req.flash(
        "success",
        "Booking created successfully!"
    );


    // ============================================
    // REDIRECT
    // ============================================

    res.redirect(
        `/listings/${listing._id}`
    );

};

// ============================================
// CHECK ROOM AVAILABILITY
// ============================================

// CHECK ROOM AVAILABILITY
module.exports.checkAvailability = async (req, res) => {

    const { id } = req.params;

    const { checkIn, checkOut } = req.query;


    // FIND LISTING
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            error: "Listing not found"
        });
    }


    // CONVERT DATES
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);


    // VALIDATE DATES
    if (
        isNaN(checkInDate.getTime()) ||
        isNaN(checkOutDate.getTime()) ||
        checkInDate >= checkOutDate
    ) {
        return res.status(400).json({
            error: "Invalid date range"
        });
    }


    // FIND OVERLAPPING BOOKINGS
    const overlappingBookings = await Booking.find({

        listing: listing._id,

        status: "confirmed",

        checkIn: {
            $lt: checkOutDate
        },

        checkOut: {
            $gt: checkInDate
        }

    });


    // ADD ALL BOOKED ROOMS
    const bookedRooms = overlappingBookings.reduce(
        (total, booking) => {

            return total + Number(booking.rooms);

        },
        0
    );


    // CALCULATE AVAILABLE ROOMS
    const availableRooms = Math.max(
        Number(listing.rooms) - bookedRooms,
        0
    );


    // SEND RESPONSE
    res.json({

        totalRooms: Number(listing.rooms),

        bookedRooms: bookedRooms,

        availableRooms: availableRooms

    });

};