// utils/deleteFromCloudinary.js
import { v2 as cloudinary } from "cloudinary";

/**
 * Deletes a single asset from Cloudinary using its URL.
 * @param {string} url - Cloudinary image or video URL
 */
async function deleteFromCloudinary(url) {
  console.log("Attempting to delete from Cloudinary:", url);
  try {
    const publicIdMatch = url.match(/\/([^/]+)\.\w+$/);
    if (!publicIdMatch || !publicIdMatch[1]) {
      console.warn("Could not extract public ID from URL:", url);
      return;
    }

    const publicId = publicIdMatch[1];
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Error deleting from Cloudinary: ${error.message}`, {
      url,
      error,
    });
  }
}

export default deleteFromCloudinary;
