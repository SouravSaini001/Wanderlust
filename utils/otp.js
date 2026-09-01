/**
 * ============================================
 * WANDERLUST - OTP UTILITY
 * ============================================
 *
 * This file provides functions to:
 *
 * 1. Generate a 6-digit OTP
 * 2. Hash the OTP before storing it
 *
 * OTPs are used during email verification.
 */

const crypto = require("crypto");


// ============================================
// 1. GENERATE OTP
// ============================================

/**
 * Generates a secure 6-digit OTP.
 *
 * @returns {string} Six-digit OTP
 */

const generateOTP = () => {
    // Generate a random number between 100000 and 999999.
    //
    // crypto.randomInt() is used instead of Math.random()
    // because OTPs are security-sensitive values.

    return crypto.randomInt(100000, 1000000).toString();
};


// ============================================
// 2. HASH OTP
// ============================================

/**
 * Creates a SHA-256 hash of the OTP.
 *
 * The actual OTP is not stored in the database.
 * Only its hash is stored.
 *
 * @param {string} otp - The OTP to hash
 * @returns {string} SHA-256 hash of the OTP
 */

const hashOTP = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};


// ============================================
// 3. EXPORT FUNCTIONS
// ============================================

module.exports = {
    generateOTP,
    hashOTP,
};