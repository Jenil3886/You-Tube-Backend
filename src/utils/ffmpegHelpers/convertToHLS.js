// import Ffmpeg from "fluent-ffmpeg";

// export default function convertToHLS(videoPath, outputDir) {
// return new Promise((resolve, reject) => {
//     Ffmpeg(videoPath)
//     .output(`${outputDir}/index.m3u8`)
//     .outputFormat("hls")
//     .addOutputOption("-hls_time", "10") // 10 sec per segment
//     .addOutputOption("-hls_list_size", "0")
//     .addOutputOption("-hls_segment_filename", `${outputDir}/segment_%03d.ts`)
//     .on("progress", (progress) => {
//         console.log(`Segmenting progress: ${progress.percent.toFixed(2)}%`);

//     })
//     .on("end", resolve)
//     .on("error", reject)
//     .run();
// });
// }

// import Ffmpeg from "fluent-ffmpeg";
// import { io } from "../../app.js";

// export default function convertToHLS(videoPath, outputDir, socketId) {
//   return new Promise((resolve, reject) => {
//     Ffmpeg(videoPath)
//       .output(`${outputDir}/index.m3u8`)
//       .outputFormat("hls")
//       .addOutputOption("-hls_time", "10")
//       .addOutputOption("-hls_list_size", "0")
//       .addOutputOption("-hls_segment_filename", `${outputDir}/segment_%03d.ts`)
//       .on("progress", (progress) => {
//         const percent = progress.percent?.toFixed(2);
//         if (percent && !isNaN(percent)) {
//           console.log(`Segmenting progress: ${percent}%`);

//           // Send to client using socket
//           io.to(socketId).emit("uploadProgress", {
//             percent,
//             status: `Processing video: ${percent}%`,
//           });
//         }
//       })
//       .on("end", () => {
//         console.log(socketId, " socket id ");
//         io.to(socketId).emit("uploadProgress", {
//           percent: 100,
//           status: "Video processing completed",
//         });
//         resolve();
//       })
//       .on("error", (err) => {
//         io.to(socketId).emit("uploadError", {
//           error: "Video conversion failed",
//           details: err.message,
//         });
//         reject(err);
//       })
//       .run();
//   });
// }

//////////////////////////////

// import Ffmpeg from "fluent-ffmpeg";
// import { io } from "../../app.js";

// export default function convertToHLS(videoPath, outputDir, socketId) {
//   return new Promise((resolve, reject) => {
//     Ffmpeg(videoPath)
//       .output(`${outputDir}/index.m3u8`)
//       .outputFormat("hls")
//       .addOutputOption("-hls_time", "10")
//       .addOutputOption("-hls_list_size", "0")
//       .addOutputOption("-hls_segment_filename", `${outputDir}/segment_%03d.ts`)
//       .on("progress", (progress) => {
//         const percent = progress.percent?.toFixed(2);
//         if (percent && !isNaN(percent)) {
//           io.to(socketId)?.emit("uploadProgress", {
//             percent,
//             status: `Processing video: ${percent}%`,
//           });
//         }
//       })
//       .on("end", () => {
//         io.to(socketId)?.emit("uploadProgress", {
//           percent: 95,
//           status: "Finishing up...",
//         });
//         resolve();
//       })
//       .on("error", (err) => {
//         io.to(socketId)?.emit("uploadError", {
//           error: "Video conversion failed",
//           details: err.message,
//         });
//         reject(err);
//       })
//       .run();
//   });
// }

//////////////////////
// import Ffmpeg from "fluent-ffmpeg";
// import { io } from "../../app.js";

// export default function convertToHLS(videoPath, outputDir, socketId) {
//   return new Promise((resolve, reject) => {
//     Ffmpeg(videoPath)
//       .output(`${outputDir}/index.m3u8`)
//       .outputFormat("hls")
//       .addOutputOption("-hls_time", "10")
//       .addOutputOption("-hls_list_size", "0")
//       .addOutputOption("-hls_segment_filename", `${outputDir}/segment_%03d.ts`)
//       .on("progress", (progress) => {
//         const percent = progress.percent?.toFixed(2);
//         if (percent && !isNaN(percent)) {
//           io.to(socketId).emit("uploadProgress", {
//             percent,
//             status: `Processing video: ${percent}%`,
//           });
//         }
//       })
//       .on("end", () => {
//         io.to(socketId).emit("uploadProgress", {
//           percent: 95,
//           status: "Finishing up...",
//         });
//         resolve();
//       })
//       .on("error", (err) => {
//         io.to(socketId).emit("uploadError", {
//           error: "Video conversion failed",
//           details: err.message,
//         });
//         reject(err);
//       })
//       .run();
//   });
// }

////////////////////////////

import Ffmpeg from "fluent-ffmpeg";
import { io } from "../../app.js";

export default function convertToHLS(videoPath, outputDir, socketId) {
  return new Promise((resolve, reject) => {
    Ffmpeg(videoPath)
      .output(`${outputDir}/index.m3u8`)
      .outputFormat("hls")
      .addOutputOption("-hls_time", "10")
      .addOutputOption("-hls_list_size", "0")
      .addOutputOption("-hls_segment_filename", `${outputDir}/segment_%03d.ts`)
      .on("progress", (progress) => {
        const percent = progress.percent?.toFixed(2);
        if (percent && !isNaN(percent)) {
          io.to(socketId).emit("uploadProgress", {
            percent,
            status: `Processing video: ${percent}%`,
          });
        }
      })
      .on("end", () => {
        io.to(socketId).emit("uploadProgress", {
          percent: 95,
          status: "Finishing up...",
        });
        resolve();
      })
      .on("error", (err) => {
        io.to(socketId).emit("uploadError", {
          error: "Video conversion failed",
          details: err.message,
        });
        reject(err);
      })
      .run();
  });
}
