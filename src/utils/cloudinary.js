// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     console.log(localFilePath, "local file path");

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "raw",
//       folder: "hls_segments",
//       // format: 'm3u8'
//     });

//     // fs.unlinkSync(localFilePath); // Remove the local file after upload
//     return response;
//   } catch (error) {
//     console.error("Cloudinary upload failed:", error);
//     // if (fs.existsSync(localFilePath)) {
//     //   fs.unlinkSync(localFilePath); // Remove the local file if upload fails
//     // }
//     throw new Error("Failed to upload file to Cloudinary");
//   }
// };

// export default uploadOnCloudinary;

// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// src/utils/cloudinary.js
const uploadOnCloudinary = async (
  localFilePath,
  folderName = "videos",
  fileName
) => {
  try {
    console.log(localFilePath, "local file path ===============");

    if (!localFilePath || !fs.existsSync(localFilePath)) {
      throw new Error(`File does not exist at path: ${localFilePath}`);
    }

    const ext = path.extname(localFilePath).toLowerCase();
    // const resourceType = ext === ".m3u8" ? "raw" : "auto";

    let resourceType = "auto";
    if (ext === ".m3u8" || ext === ".ts") {
      resourceType = "raw"; // required for HLS files
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder: folderName, // Dynamic folder
      ...(fileName && { public_id: fileName }),
    });

    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};
export default uploadOnCloudinary;
