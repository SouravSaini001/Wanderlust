/**
 * ============================================
 * WANDERLUST - SEND OTP UTILITY
 * ============================================
 *
 * This file is responsible for sending OTP
 * emails to users during email verification.
 */

const nodemailer = require("nodemailer");


// ============================================
// 1. CREATE EMAIL TRANSPORTER
// ============================================
//
// Nodemailer uses this transporter to connect
// to Gmail and send emails.
//

const transporter = nodemailer.createTransport({

    // Gmail email service
    service: "gmail",

    // Gmail authentication credentials
    // are stored in the .env file.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});


// ============================================
// 2. SEND OTP FUNCTION
// ============================================

/**
 * Sends an OTP verification email.
 *
 * @param {string} email - Recipient's email address
 * @param {string} otp - OTP to send
 */

const sendOTP = async (email, otp) => {

    await transporter.sendMail({

        // Sender email
        from: process.env.EMAIL_USER,

        // Recipient email
        to: email,

        // Email subject
        subject: "Wanderlust Email Verification OTP",

        // Email body
        html: `
            <h2>Welcome to Wanderlust 🏕️</h2>

            <p>Your email verification OTP is:</p>

            <h1>${otp}</h1>

            <p>This OTP is valid for 5 minutes.</p>
        `,
    });
};


// ============================================
// 3. EXPORT FUNCTION
// ============================================

module.exports = sendOTP;