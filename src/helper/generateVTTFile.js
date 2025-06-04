// export const generateVTTFile = (segmentScreenshots, segmentDuration = 10) => {
//   const vttLines = ["WEBVTT", ""];

//   segmentScreenshots.forEach((screenshot, index) => {
//     const start = index * segmentDuration;
//     const end = (index + 1) * segmentDuration;

//     const formatTime = (seconds) => {
//       const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
//       const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//       const s = String(seconds % 60).padStart(2, "0");
//       return `${h}:${m}:${s}.000`;
//     };

//     vttLines.push(`${formatTime(start)} --> ${formatTime(end)}`);
//     vttLines.push(screenshot.screenshotUrl);
//     vttLines.push(""); // blank line
//   });

//   return vttLines.join("\n");
// };

////////////////////////

// export const generateVTTFile = (segmentScreenshots, segmentDuration = 10) => {
//   const vttLines = ["WEBVTT", ""];
//   segmentScreenshots.forEach((screenshot, index) => {
//     const start = index * segmentDuration;
//     const end = (index + 1) * segmentDuration;
//     const formatTime = (seconds) => {
//       const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
//       const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//       const s = String(seconds % 60).padStart(2, "0");
//       return `${h}:${m}:${s}.000`;
//     };
//     vttLines.push(`${formatTime(start)} --> ${formatTime(end)}`);
//     vttLines.push(screenshot.screenshotUrl);
//     vttLines.push("");
//   });
//   return vttLines.join("\n");
// };

/////////////////////////

export const generateVTTFile = (segmentScreenshots, segmentDuration = 10) => {
  const vttLines = ["WEBVTT", ""];
  segmentScreenshots.forEach((screenshot, index) => {
    const start = index * segmentDuration;
    const end = (index + 1) * segmentDuration;
    const formatTime = (seconds) => {
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      return `${h}:${m}:${s}.000`;
    };
    vttLines.push(`${formatTime(start)} --> ${formatTime(end)}`);
    vttLines.push(screenshot.screenshotUrl);
    vttLines.push("");
  });
  return vttLines.join("\n");
};
