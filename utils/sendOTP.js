const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    // Force IPv4
    family: 4,

    // Reduce waiting time
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTP = async (email, otp) => {

    console.log("SEND OTP: starting sendMail");

    const start = Date.now();

    await transporter.sendMail({
        from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Wanderlust Email Verification OTP",
        html: `
            <h2>Welcome to Wanderlust 🏕️</h2>
            <p>Your email verification OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
        `,
    });

    console.log(
        "SEND OTP: completed in",
        Date.now() - start,
        "ms"
    );
};

module.exports = sendOTP;
