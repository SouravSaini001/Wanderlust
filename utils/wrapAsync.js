/**
 * ============================================
 * WANDERLUST - WRAP ASYNC UTILITY
 * ============================================
 *
 * This utility catches errors from asynchronous
 * Express route handlers and passes them to the
 * global error-handling middleware.
 *
 * Without wrapAsync:
 *
 * router.get("/", async (req, res, next) => {
 *     try {
 *         // async code
 *     } catch (err) {
 *         next(err);
 *     }
 * });
 *
 * With wrapAsync:
 *
 * router.get("/", wrapAsync(async (req, res) => {
 *     // async code
 * }));
 */


// ============================================
// 1. WRAP ASYNC FUNCTION
// ============================================

module.exports = (fn) => {

    // Return an Express middleware function
    return (req, res, next) => {

        // Execute the original async function.
        //
        // Promise.resolve() converts the result
        // into a Promise if necessary.
        //
        // If the Promise rejects, the error is
        // automatically passed to Express's
        // error-handling middleware.

        Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
};