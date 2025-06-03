import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import convertToHLS from "./convertToHLS.js";
import uploadOnCloudinary from "./uploadOnCloudinary.js";

const streamUploadHLS = (videoPath, outputDir, socketId) => {
  return new Promise((resolve, reject) => {
    const uploaded = [];
    const watcher = chokidar.watch(outputDir, { persistent: true });
    let m3u8Uploaded = false;

    watcher.on("add", async (filePath) => {
      const ext = path.extname(filePath);
      const fileName = path.basename(filePath);

      try {
        const result = await uploadOnCloudinary(filePath);
        uploaded.push({ file: fileName, url: result.secure_url });

        if (fileName === "index.m3u8") m3u8Uploaded = true;

        // Resolve when m3u8 is uploaded and at least 1 .ts is uploaded
        const tsUploaded = uploaded.some((f) => f.file.endsWith(".ts"));
        if (m3u8Uploaded && tsUploaded) {
          watcher.close();
          resolve(uploaded);
        }
      } catch (err) {
        watcher.close();
        reject(err);
      }
    });

    // Kick off HLS conversion
    convertToHLS(videoPath, outputDir, socketId).catch((err) => {
      watcher.close();
      reject(err);
    });
  });
};

export default streamUploadHLS;
