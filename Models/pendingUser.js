/**
 * ============================================
 * WANDERLUST - PENDING USER MODEL
 * ============================================
 *
 * This model temporarily stores users who have
 * started the signup process but have not yet
 * verified their email OTP.
 *
 * Flow:
 *
 * Signup Form
 *     ↓
 * PendingUser
 *     ↓
 * Send OTP
 *     ↓
 * Verify OTP
 *     ↓
 * Create User
 *     ↓
 * Delete PendingUser
 */


const mongoose = require("mongoose");


// ============================================
// 1. PENDING USER SCHEMA
// ============================================

const pendingUserSchema = new mongoose.Schema({

    // ----------------------------------------
    // Username
    // ----------------------------------------
    //
    // Username entered during signup.
    //

    username: {
        type: String,
        required: true,
        trim: true,
    },


    // ----------------------------------------
    // Email
    // ----------------------------------------
    //
    // Email is converted to lowercase and
    // unnecessary spaces are removed.
    //

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },


    // ----------------------------------------
    // Encrypted Password
    // ----------------------------------------
    //
    // The password is temporarily stored in
    // encrypted form until OTP verification
    // is completed.
    //
    // encrypted → encrypted password data
    // iv        → initialization vector used
    //             during encryption
    //

    password: {

        encrypted: {
            type: String,
            required: true,
        },

        iv: {
            type: String,
            required: true,
        },
    },


    // ----------------------------------------
    // OTP Hash
    // ----------------------------------------
    //
    // Stores the hashed OTP instead of storing
    // the actual OTP.
    //

    otpHash: {
        type: String,
        required: true,
    },


    // ----------------------------------------
    // OTP Expiration Time
    // ----------------------------------------
    //
    // After this time, the OTP should no longer
    // be considered valid.
    //

    otpExpires: {
        type: Date,
        required: true,
    },


    // ----------------------------------------
    // OTP Attempts
    // ----------------------------------------
    //
    // Counts how many times the user has tried
    // to verify the OTP.
    //

    otpAttempts: {
        type: Number,
        default: 0,
    },


    // ----------------------------------------
    // Account Creation Time
    // ----------------------------------------
    //
    // MongoDB TTL index automatically removes
    // the PendingUser document 600 seconds
    // (10 minutes) after createdAt.
    //

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,
    },
});


// ============================================
// 2. CREATE & EXPORT MODEL
// ============================================

module.exports = mongoose.model(
    "PendingUser",
    pendingUserSchema
);