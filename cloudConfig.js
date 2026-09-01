/**

* ============================================
* WANDERLUST - CLOUDINARY CONFIGURATION
* ============================================
  */

// ============================================
// 1. REQUIRED PACKAGES
// ============================================

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ============================================
// 2. CLOUDINARY CONFIGURATION
// ============================================

// Connect Cloudinary using credentials stored in .env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ============================================
// 3. CLOUDINARY STORAGE CONFIGURATION
// ============================================

// Configure Multer to upload files directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,


  params: {
    // Cloudinary folder where listing images will be stored
    folder: "wanderlust_DEV",

    // Allowed image file formats
    allowedFormats: ["png", "jpg", "jpeg"],
  },


});

// ============================================
// 4. EXPORT
// ============================================

// Export Cloudinary and storage configuration
// so they can be used in other files.
module.exports = {
  cloudinary,
  storage,
};
