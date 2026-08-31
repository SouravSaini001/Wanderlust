const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    password: {
        encrypted: {
            type: String,
            required: true
        },

        iv: {
            type: String,
            required: true
        }
    },

    otpHash: {
        type: String,
        required: true
    },

    otpExpires: {
        type: Date,
        required: true
    },

    otpAttempts: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }
});

module.exports = mongoose.model(
    "PendingUser",
    pendingUserSchema
);