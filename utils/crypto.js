/**
 * ============================================
 * WANDERLUST - CRYPTO UTILITY
 * ============================================
 *
 * This file provides functions to:
 *
 * 1. Encrypt text
 * 2. Decrypt encrypted text
 *
 * It is currently used for temporarily protecting
 * the user's password during the OTP signup process.
 */

const crypto = require("crypto");


// ============================================
// 1. ENCRYPTION CONFIGURATION
// ============================================

// AES-256-CBC encryption algorithm
const algorithm = "aes-256-cbc";


// ============================================
// 2. ENCRYPTION KEY
// ============================================
//
// Create a 32-byte encryption key from the
// SECRET stored in the .env file.
//
// SHA-256 produces 32 bytes (256 bits),
// which is required by AES-256.
//

const key = crypto
    .createHash("sha256")
    .update(process.env.SECRET)
    .digest();


// ============================================
// 3. ENCRYPT FUNCTION
// ============================================

/**
 * Encrypts plain text.
 *
 * @param {string} text - Text that needs encryption
 * @returns {object} Encrypted text and IV
 */

const encrypt = (text) => {

    // Generate a new random Initialization Vector
    // for every encryption operation.
    const iv = crypto.randomBytes(16);


    // Create encryption cipher
    const cipher = crypto.createCipheriv(
        algorithm,
        key,
        iv
    );


    // Encrypt the text
    let encrypted = cipher.update(
        text,
        "utf8",
        "hex"
    );


    // Finish the encryption process
    encrypted += cipher.final("hex");


    // Return encrypted data and IV
    return {
        encrypted,
        iv: iv.toString("hex"),
    };
};


// ============================================
// 4. DECRYPT FUNCTION
// ============================================

/**
 * Decrypts previously encrypted text.
 *
 * @param {string} encrypted - Encrypted text
 * @param {string} iv - Initialization Vector
 * @returns {string} Original decrypted text
 */

const decrypt = (encrypted, iv) => {

    // Create decryption cipher using the same
    // algorithm, key and IV.
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, "hex")
    );


    // Decrypt the encrypted text
    let decrypted = decipher.update(
        encrypted,
        "hex",
        "utf8"
    );


    // Finish the decryption process
    decrypted += decipher.final("utf8");


    // Return original text
    return decrypted;
};


// ============================================
// 5. EXPORT FUNCTIONS
// ============================================

module.exports = {
    encrypt,
    decrypt,
};