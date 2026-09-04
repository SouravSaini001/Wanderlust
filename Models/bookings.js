const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ============================================
    // LISTING
    // ============================================

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    // ============================================
    // USER
    // ============================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ============================================
    // BOOKING DATES
    // ============================================

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    // ============================================
    // GUESTS & ROOMS
    // ============================================

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    rooms: {
      type: Number,
      required: true,
      min: 1,
    },

    // ============================================
    // TOTAL PRICE
    // ============================================

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ============================================
    // BOOKING STATUS
    // ============================================

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "expired",
      ],
      default: "pending",
    },

    // ============================================
    // PENDING BOOKING EXPIRATION
    // ============================================

    // Pending booking will temporarily hold rooms
    // until this time.

    expiresAt: {
      type: Date,
      default: null,
    },

    // ============================================
    // PAYMENT STATUS
    // ============================================

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // ============================================
    // RAZORPAY DETAILS
    // ============================================

    razorpayOrderId: {
      type: String,
      default: null,
    },

    paymentId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
