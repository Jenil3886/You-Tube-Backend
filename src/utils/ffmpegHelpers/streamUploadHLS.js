// import fs from "fs/promises";
// import path from "path";
// import chokidar from "chokidar";
// import { promisify } from "util";
// import sleep from "sleep-promise";
// import convertToHLS from "./convertToHLS.js";
// import uploadOnCloudinary from "../cloudinary.js";

// const waitUntilFileSizeStable = async (
//   filePath,
//   timeout = 10000,
//   interval = 500
// ) => {
//   let lastSize = -1;
//   const start = Date.now();
//   while (Date.now() - start < timeout) {
//     const stat = await fs.stat(filePath);
//     if (stat.isDirectory()) {
//       console.log("File is a directory, skipping:", filePath);
//       return false;
//     }
//     if (stat.size === lastSize && stat.size > 0) {
//       return true;
//     }
//     lastSize = stat.size;
//     await sleep(interval);
//   }
//   console.warn(`File did not stabilize within ${timeout}ms:`, filePath);
//   return false;
// };

// export default function streamUploadHLS(videoPath, outputDir, folderName) {
//   return new Promise(async (resolve, reject) => {
//     const uploadedFiles = [];
//     const uploadedTsFiles = new Set();
//     const tsQueue = new Set();
//     let m3u8Path = null;
//     let watcherClosed = false;

//     const watcher = chokidar.watch(outputDir, { persistent: true });

//     const handleTSUpload = async (filePath, fileName) => {
//       const fileNameWithoutExt = path.parse(filePath).name;
//       const result = await uploadOnCloudinary(
//         filePath,
//         folderName,
//         fileNameWithoutExt
//       );
//       uploadedFiles.push({ file: fileName, url: result.secure_url });
//       uploadedTsFiles.add(fileName);
//       console.log("✅ Uploaded .ts segment:", fileName);
//     };

//     const maybeUploadM3U8 = async () => {
//       if (!m3u8Path || tsQueue.size > 0 || !watcherClosed) return;

//       const isStable = await waitUntilFileSizeStable(m3u8Path);
//       if (!isStable) {
//         console.warn("⚠️ index.m3u8 not stable.");
//         return;
//       }

//       const fileNameWithoutExt = path.parse(m3u8Path).name;
//       const result = await uploadOnCloudinary(
//         m3u8Path,
//         folderName,
//         fileNameWithoutExt
//       );
//       uploadedFiles.push({ file: "index.m3u8", url: result.secure_url });
//       console.log("✅ Uploaded index.m3u8");

//       resolve(uploadedFiles);
//     };

//     watcher.on("add", async (filePath) => {
//       try {
//         const fileName = path.basename(filePath);
//         if (fileName.endsWith(".ts") && !uploadedTsFiles.has(fileName)) {
//           tsQueue.add(fileName);
//           const isStable = await waitUntilFileSizeStable(filePath);
//           if (isStable) {
//             await handleTSUpload(filePath, fileName);
//           }
//           tsQueue.delete(fileName);
//           maybeUploadM3U8();
//         } else if (fileName === "index.m3u8") {
//           m3u8Path = filePath;
//           maybeUploadM3U8();
//         }
//       } catch (err) {
//         watcher.close();
//         reject(err);
//       }
//     });

//     try {
//       await convertToHLS(videoPath, outputDir); // Starts segmenting
//       await sleep(1000); // Small wait for final ts segments to flush
//       watcher.close();
//       watcherClosed = true;
//       maybeUploadM3U8();
//     } catch (err) {
//       watcher.close();
//       reject(err);
//     }
//   });
// }

////////////////////////////////////////////////////////////

import fs from "fs/promises";
import path from "path";
import chokidar from "chokidar";
import { promisify } from "util";
import sleep from "sleep-promise";
import convertToHLS from "./convertToHLS.js";
import uploadOnCloudinary from "../cloudinary.js";
import { io } from "../../app.js";

const waitUntilFileSizeStable = async (
  filePath,
  timeout = 10000,
  interval = 500
) => {
  let lastSize = -1;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) return false;
    if (stat.size === lastSize && stat.size > 0) return true;
    lastSize = stat.size;
    await sleep(interval);
  }
  console.warn(`File did not stabilize within ${timeout}ms:`, filePath);
  return false;
};

export default function streamUploadHLS(
  videoPath,
  outputDir,
  folderName,
  socketId
) {
  return new Promise(async (resolve, reject) => {
    const uploadedFiles = [];
    const uploadedTsFiles = new Set();
    const tsQueue = new Set();
    let m3u8Path = null;
    let watcherClosed = false;

    const watcher = chokidar.watch(outputDir, { persistent: true });

    const handleTSUpload = async (filePath, fileName) => {
      const fileNameWithoutExt = path.parse(filePath).name;
      const result = await uploadOnCloudinary(
        filePath,
        folderName,
        fileNameWithoutExt
      );
      uploadedFiles.push({ file: fileName, url: result.secure_url });
      uploadedTsFiles.add(fileName);
      console.log("✅ Uploaded .ts segment:", fileName);
    };

    const maybeUploadM3U8 = async () => {
      if (!m3u8Path || tsQueue.size > 0 || !watcherClosed) return;

      const isStable = await waitUntilFileSizeStable(m3u8Path);
      if (!isStable) {
        console.warn("⚠️ index.m3u8 not stable.");
        return;
      }

      const fileNameWithoutExt = path.parse(m3u8Path).name;
      const result = await uploadOnCloudinary(
        m3u8Path,
        folderName,
        fileNameWithoutExt
      );
      uploadedFiles.push({ file: "index.m3u8", url: result.secure_url });

      io.to(socketId).emit("uploadProgress", {
        percent: 100,
        status: "Upload complete",
      });

      console.log("✅ Uploaded index.m3u8");
      resolve(uploadedFiles);
    };

    watcher.on("add", async (filePath) => {
      try {
        const fileName = path.basename(filePath);
        if (fileName.endsWith(".ts") && !uploadedTsFiles.has(fileName)) {
          tsQueue.add(fileName);
          const isStable = await waitUntilFileSizeStable(filePath);
          if (isStable) {
            await handleTSUpload(filePath, fileName);
          }
          tsQueue.delete(fileName);
          maybeUploadM3U8();
        } else if (fileName === "index.m3u8") {
          m3u8Path = filePath;
          maybeUploadM3U8();
        }
      } catch (err) {
        watcher.close();
        reject(err);
      }
    });

    try {
      await convertToHLS(videoPath, outputDir, socketId);
      await sleep(1000);
      watcher.close();
      watcherClosed = true;
      maybeUploadM3U8();
    } catch (err) {
      watcher.close();
      reject(err);
    }
  });
}
