/**
 * ============================================
 * WANDERLUST - SEND OTP UTILITY
 * ============================================
 *
 * Sends OTP emails using Resend API.
 */

const { Resend } = require("resend");

// ============================================
// 1. CREATE RESEND CLIENT
// ============================================

const resend = new Resend(
    process.env.RESEND_API_KEY
);

// ============================================
// 2. SEND OTP FUNCTION
// ============================================

const sendOTP = async (email, otp) => {

    console.log("SEND OTP: starting Resend API");

    const start = Date.now();

    const { data, error } = await resend.emails.send({

        // Resend provides this sender for testing.
        from: "Wanderlust <onboarding@resend.dev>",

        to: [email],

        subject: "Wanderlust Email Verification OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 20px;
            ">

                <h2>Welcome to Wanderlust 🏕️</h2>

                <p>
                    Your email verification OTP is:
                </p>

                <h1 style="
                    letter-spacing: 8px;
                    font-size: 32px;
                ">
                    ${otp}
                </h1>

                <p>
                    This OTP is valid for 5 minutes.
                </p>

                <p>
                    If you did not create a Wanderlust account,
                    you can safely ignore this email.
                </p>

                <hr>

                <p style="color: #777;">
                    Wanderlust
                </p>

            </div>
        `,
    });

    console.log(
        `SEND OTP: Resend completed in ${
            Date.now() - start
        } ms`
    );

    // ========================================
    // HANDLE RESEND ERROR
    // ========================================

    if (error) {

        console.error(
            "RESEND ERROR:",
            error
        );

        throw new Error(
            error.message || "Failed to send OTP email."
        );
    }

    console.log(
        "OTP email sent successfully."
    );

    console.log(
        "Resend Email ID:",
        data?.id
    );

    return data;
};

// ============================================
// 3. EXPORT
// ============================================

module.exports = sendOTP;
