/**
 * ============================================
 * WANDERLUST - USER MODEL
 * ============================================
 *
 * This file defines the MongoDB schema for users
 * and configures Passport authentication.
 */

// ============================================
// 1. IMPORT REQUIRED PACKAGES
// ============================================

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;


// ============================================
// 2. USER SCHEMA
// ============================================

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
    },

    username: {
        type: String,
        required: true,
        unique: true,
    },
});






// ============================================
// 3. PASSPORT LOCAL MONGOOSE PLUGIN
// ============================================
//
// passport-local-mongoose automatically adds
// authentication-related fields and methods.
//
// It handles:
// - username
// - password hashing
// - password salt
// - authentication methods
// - serializeUser()
// - deserializeUser()
// - authenticate()
//
// In this project, Passport uses the email as
// the username during authentication.
//

userSchema.plugin(passportLocalMongoose, {
    usernameField: "email",   // login ke liye email hi use hoga, ye theek hai
});


// ============================================
// 4. CREATE & EXPORT USER MODEL
// ============================================

module.exports = mongoose.model("User", userSchema);