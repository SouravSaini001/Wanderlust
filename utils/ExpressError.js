/**
 * ============================================
 * WANDERLUST - CUSTOM EXPRESS ERROR
 * ============================================
 *
 * This class creates custom errors with:
 *
 * 1. HTTP status code
 * 2. Error message
 *
 * Example:
 *
 * next(new ExpressError(404, "Listing not found"));
 *
 * The error is then handled by the global
 * error-handling middleware in index.js.
 */


// ============================================
// 1. EXPRESS ERROR CLASS
// ============================================

class ExpressError extends Error {

    /**
     * Create a custom Express error.
     *
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     */

    constructor(statusCode, message) {

        // Call the parent Error constructor
        // and set the error message.
        super(message);

        // Store HTTP status code
        this.statusCode = statusCode;

        // Make sure the error name is clear
        this.name = "ExpressError";
    }
}


// ============================================
// 2. EXPORT CLASS
// ============================================

module.exports = ExpressError;