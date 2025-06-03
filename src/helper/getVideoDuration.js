import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";

// Function to get video duration in seconds
export function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration; // in seconds
        resolve(duration);
      }
    });
  });
}
