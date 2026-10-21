const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[Cloudinary] Configured for cloud asset storage.');
} else {
  console.log('[Cloudinary] Credentials not set. Operating in local filesystem storage mode (/uploads).');
}

/**
 * Upload a local file to Cloudinary or return local static path
 * @param {string} localFilePath - Path to file on disk
 * @param {string} folder - Destination folder name
 * @returns {Promise<string>} - Public URL of image
 */
const uploadImage = async (localFilePath, folder = 'lavanya-collections') => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'image'
      });
      // Safely delete temp local file after successful Cloudinary upload
      fs.unlink(localFilePath, () => {});
      return result.secure_url;
    } catch (err) {
      console.error('[Cloudinary Upload Error]:', err.message);
      // Fallback to local path if Cloudinary API call fails
      const filename = localFilePath.split(/[\/\\]/).pop();
      return `/uploads/${filename}`;
    }
  }

  // Local filesystem fallback
  const filename = localFilePath.split(/[\/\\]/).pop();
  return `/uploads/${filename}`;
};

module.exports = { uploadImage, isCloudinaryConfigured };
