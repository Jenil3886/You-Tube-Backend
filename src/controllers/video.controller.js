// import Video from "../models/video.model.js";
// import User from "../models/user.model.js";
// import Channel from "../models/Channel.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import uploadOnCloudinary from "../utils/cloudinary.js";
// import { getVideoDuration } from "../helper/getVideoDuration.js";
// import streamUploadHLS from "../utils/ffmpegHelpers/streamUploadHLS.js";
// import Ffmpeg from "fluent-ffmpeg";
// import fs from "fs";
// import path from "path";
// import os from "os";
// import { rimraf } from "rimraf";
// import { v4 as uuidv4 } from "uuid";
// import { io } from "../app.js";
// import Comment from "../models/comment.model.js";
// import { generateVTTFile } from "../helper/generateVTTFile.js";

// // Helper function to generate VTT content

// const uploadVideo = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const socketId = req.body.socketId;

//   if (!userId) throw new ApiError(400, "User ID is required");

//   const channel = await Channel.findOne({ where: { ownerId: userId } });
//   if (!channel) throw new ApiError(400, "Channel not found");

//   const { title, description } = req.body;
//   const videoFile = req.files?.videoFile?.[0]?.path;
//   let thumbnail = req.files?.thumbnail?.[0]?.path;

//   if (!videoFile) throw new ApiError(400, "Video is required");

//   let duration;
//   try {
//     duration = await getVideoDuration(videoFile);
//   } catch (err) {
//     throw new ApiError(500, "Failed to get video duration");
//   }

//   const tempDir = path.join(os.tmpdir(), uuidv4());
//   const cloudinaryFolder = `hls_videos/${uuidv4()}`;
//   fs.mkdirSync(tempDir, { recursive: true });

//   try {
//     io.to(socketId).emit("uploadProgress", {
//       percent: 0,
//       status: "Starting upload...",
//     });

//     const uploadedFiles = await streamUploadHLS(
//       videoFile,
//       tempDir,
//       cloudinaryFolder,
//       socketId
//     );

//     const playlistUrl = uploadedFiles.find((f) => f.file === "index.m3u8")?.url;

//     // Generate and upload segment screenshots
//     const segmentScreenshots = [];
//     const segmentFiles = fs
//       .readdirSync(tempDir)
//       .filter((f) => f.endsWith(".ts"))
//       .sort();

//     for (const segmentFile of segmentFiles) {
//       const segmentPath = path.join(tempDir, segmentFile);
//       const screenshotPath = path.join(tempDir, `${segmentFile}.jpg`);

//       await new Promise((resolve, reject) => {
//         Ffmpeg(segmentPath)
//           .on("end", resolve)
//           .on("error", reject)
//           .screenshots({
//             count: 1,
//             timemarks: ["1"],
//             filename: `${segmentFile}.jpg`,
//             folder: tempDir,
//           });
//       });

//       const uploaded = await uploadOnCloudinary(
//         screenshotPath,
//         `segment_screenshots`
//       );
//       segmentScreenshots.push({
//         segment: segmentFile,
//         screenshotUrl: uploaded.secure_url,
//       });
//     }

//     // 🆕 Generate VTT file
//     const vttContent = generateVTTFile(segmentScreenshots, 10); // each segment = 10s
//     const vttPath = path.join(tempDir, "preview.vtt");
//     fs.writeFileSync(vttPath, vttContent);

//     const uploadedVtt = await uploadOnCloudinary(vttPath, `vtt_files`);
//     const vttUrl = uploadedVtt.secure_url;

//     // Upload thumbnail
//     let uploadedThumbnail;
//     if (thumbnail) {
//       uploadedThumbnail = await uploadOnCloudinary(thumbnail, `thumbnails`);
//     } else {
//       const firstFramePath = path.join(tempDir, "first_frame.jpg");
//       await new Promise((resolve, reject) => {
//         Ffmpeg(videoFile)
//           .on("end", resolve)
//           .on("error", reject)
//           .screenshots({
//             count: 1,
//             timemarks: ["1"],
//             filename: "first_frame.jpg",
//             folder: tempDir,
//           });
//       });
//       uploadedThumbnail = await uploadOnCloudinary(
//         firstFramePath,
//         `thumbnails`
//       );
//     }

//     // Save to DB
//     const video = await Video.create({
//       title,
//       description,
//       duration,
//       videoFile: playlistUrl,
//       thumbnail: uploadedThumbnail.secure_url,
//       ownerId: userId,
//       channelId: channel.id,
//     });

//     res.status(201).json(
//       new ApiResponse(
//         201,
//         {
//           ...video.toJSON(),
//           segmentScreenshots,
//           vttUrl,
//         },
//         "Video uploaded successfully"
//       )
//     );
//   } catch (error) {
//     io.to(socketId).emit("uploadError", {
//       error: "Upload failed",
//       details: error.message,
//     });
//     console.error("Error during video upload:", error);
//     throw new ApiError(500, "Video upload failed", error);
//   } finally {
//     // rimraf.sync(tempDir);
//   }
// });

// const getAllVideos = asyncHandler(async (req, res) => {
//   const {
//     page = 1,
//     limit = 10,
//     query,
//     sortBy = "createdAt",
//     sortType = "DESC",
//   } = req.query;

//   const whereClause = query
//     ? {
//         title: {
//           [Sequelize.Op.iLike]: `%${query}%`,
//         },
//       }
//     : {};

//   const videos = await Video.findAndCountAll({
//     where: whereClause,
//     limit: parseInt(limit),
//     offset: (page - 1) * limit,
//     order: [[sortBy, sortType]],
//     include: [
//       {
//         model: Channel,
//         as: "channel",
//         attributes: ["id", "name", "handle", "profilePicture"],
//       },
//     ],
//   });

//   // Add comment count for each video
//   const videoRowsWithCommentCount = await Promise.all(
//     videos.rows.map(async (video) => {
//       const commentCount = await Comment.count({
//         where: { videoId: video.id },
//       });
//       return { ...video.toJSON(), commentCount };
//     })
//   );

//   res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         { ...videos, rows: videoRowsWithCommentCount },
//         "Videos fetched successfully"
//       )
//     );
// });

// const getVideoById = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;
//   const video = await Video.findByPk(videoId, {
//     include: [
//       {
//         model: Channel,
//         as: "channel",
//         attributes: ["id", "name", "profilePicture", "subscriberCount"],
//       },
//       {
//         model: User,
//         as: "owner",
//         attributes: ["id", "username", "avatar"],
//       },
//     ],
//   });
//   if (!video) throw new ApiError(404, "Video not found");

//   // Increment view count
//   video.views = (video.views || 0) + 1;
//   await video.save();

//   // Add this line for easier access
//   video.dataValues.streamUrl = video.videoFile?.[0]; // You can later replace with .m3u8 file
//   video.dataValues.vttUrl = video.vttUrl;
//   res
//     .status(200)
//     .json(new ApiResponse(200, video, "Video fetched successfully"));
// });

// const updateVideo = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;
//   const { title, description } = req.body;

//   const video = await Video.findByPk(videoId);
//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   if (req.file) {
//     const thumbnailPath = req.file.path;
//     const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);
//     video.thumbnail = uploadedThumbnail.url;
//   }

//   video.title = title || video.title;
//   video.description = description || video.description;

//   await video.save();

//   res
//     .status(200)
//     .json(new ApiResponse(200, video, "Video updated successfully"));
// });

// const deleteVideo = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;

//   const video = await Video.findByPk(videoId);
//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   await video.destroy();

//   res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
// });

// const togglePublishStatus = asyncHandler(async (req, res) => {
//   const { videoId } = req.params;

//   const video = await Video.findByPk(videoId);
//   if (!video) {
//     throw new ApiError(404, "Video not found");
//   }

//   video.isPublished = !video.isPublished;
//   await video.save();

//   res
//     .status(200)
//     .json(new ApiResponse(200, video, "Publish status toggled successfully"));
// });

import Video from "../models/video.model.js";
import Channel from "../models/Channel.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { getVideoDuration } from "../helper/getVideoDuration.js";
import streamUploadHLS from "../utils/ffmpegHelpers/streamUploadHLS.js";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { io } from "../app.js";
import { generateVTTFile } from "../helper/generateVTTFile.js";
import Comment from "../models/comment.model.js";
import { Op, Sequelize } from "sequelize";
import User from "../models/user.model.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import cloudinary from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  console.log("Request received:", req.body);
  const userId = req.user.id;
  const socketId = req.body.socketId;

  //   if (!userId || !socketId)
  if (!userId) throw new ApiError(400, "User ID or Socket ID missing");

  const channel = await Channel.findOne({ where: { ownerId: userId } });
  if (!channel) throw new ApiError(400, "Channel not found");

  const { title, description } = req.body;
  if (!title || !description)
    throw new ApiError(400, "Title and Description are required");

  const videoFile = req.files?.videoFile?.[0]?.path;
  if (!videoFile) throw new ApiError(400, "Video file is required");

  let duration;
  try {
    duration = await getVideoDuration(videoFile);
  } catch (err) {
    throw new ApiError(500, "Failed to get video duration");
  }

  const tempDir = path.join(os.tmpdir(), uuidv4());
  const cloudinaryFolder = `thumbnails/${uuidv4()}`;
  await fs.mkdir(tempDir, { recursive: true });

  try {
    io.to(socketId).emit("uploadProgress", {
      percent: 0,
      status: "Starting upload...",
    });

    const uploadedFiles = await streamUploadHLS(
      videoFile,
      tempDir,
      `hls_videos/${uuidv4()}`,
      socketId
    );

    const playlistUrl = uploadedFiles.find((f) => f.file === "index.m3u8")?.url;

    const segmentFiles = (await fs.readdir(tempDir)).filter((f) =>
      f.endsWith(".ts")
    );
    const segmentScreenshots = [];

    for (const segmentFile of segmentFiles) {
      const segmentPath = path.join(tempDir, segmentFile);
      const screenshotPath = path.join(tempDir, `${segmentFile}.jpg`);
      await new Promise((resolve, reject) => {
        Ffmpeg(segmentPath)
          .on("end", resolve)
          .on("error", reject)
          .screenshots({
            count: 1,
            timemarks: ["1"],
            filename: `${segmentFile}.jpg`,
            folder: tempDir,
          });
      });

      const uploaded = await uploadOnCloudinary(
        screenshotPath,
        cloudinaryFolder
      );
      segmentScreenshots.push({
        segment: segmentFile,
        screenshotUrl: uploaded.secure_url,
      });
    }

    const vttContent = generateVTTFile(segmentScreenshots, 10);
    const vttPath = path.join(tempDir, "preview.vtt");
    await fs.writeFile(vttPath, vttContent);
    const uploadedVtt = await uploadOnCloudinary(vttPath, cloudinaryFolder);
    const vttUrl = uploadedVtt.secure_url;

    let thumbnailPath = req.files?.thumbnail?.[0]?.path;
    let uploadedThumbnail;

    if (thumbnailPath) {
      uploadedThumbnail = await uploadOnCloudinary(
        thumbnailPath,
        cloudinaryFolder
      );
    } else {
      const firstFramePath = path.join(tempDir, "first_frame.jpg");
      await new Promise((resolve, reject) => {
        Ffmpeg(videoFile)
          .on("end", resolve)
          .on("error", reject)
          .screenshots({
            count: 1,
            timemarks: ["1"],
            filename: "first_frame.jpg",
            folder: tempDir,
          });
      });
      uploadedThumbnail = await uploadOnCloudinary(
        firstFramePath,
        cloudinaryFolder
      );
    }

    const video = await Video.create({
      title,
      description,
      duration,
      videoFile: playlistUrl,
      thumbnail: uploadedThumbnail.secure_url,
      ownerId: userId,
      channelId: channel.id,
      //   previewFolder: cloudinaryFolder,
      previewFolder: vttUrl,
    });

    await fs.rm(tempDir, { recursive: true, force: true });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          ...video.toJSON(),
          segmentScreenshots,
          vttUrl,
        },
        "Video uploaded successfully"
      )
    );
  } catch (error) {
    console.error("Video Upload Error:", error);
    io.to(socketId)?.emit("uploadError", {
      error: "Upload failed",
      details: error.message,
    });

    // Attempt cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn("Cleanup failed:", cleanupErr);
    }

    throw new ApiError(500, "Video upload failed", error);
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "DESC",
  } = req.query;

  // Validate inputs
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  if (isNaN(pageNum) || isNaN(limitNum)) {
    throw new ApiError(400, "Page and limit must be valid numbers");
  }

  const whereClause = {};
  if (query) {
    whereClause.title = {
      [Op.iLike]: `%${query}%`,
    };
  }

  // Fetch videos with pagination and sorting
  const videos = await Video.findAndCountAll({
    where: whereClause,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    order: [[sortBy, sortType]],
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["id", "name", "handle", "profilePicture"],
      },
    ],
  });

  // Efficiently get all comment counts using bulk query
  const videoIds = videos.rows.map((v) => v.id);
  const commentCounts = await Comment.findAll({
    attributes: [
      "videoId",
      [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
    ],
    where: { videoId: videoIds },
    group: "videoId",
  });

  const commentCountMap = commentCounts.reduce((acc, row) => {
    acc[row.dataValues.videoId] = parseInt(row.dataValues.count);
    return acc;
  }, {});

  const videoRowsWithCommentCount = videos.rows.map((video) => ({
    ...video.toJSON(),
    commentCount: commentCountMap[video.id] || 0,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...videos,
        rows: videoRowsWithCommentCount,
      },
      "Videos fetched successfully"
    )
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findByPk(videoId, {
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["id", "name", "profilePicture", "subscriberCount"],
      },
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "avatar"],
      },
    ],
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Increment view count safely
  await video.increment("views");

  // Attach extra fields
  const videoJson = video.toJSON();
  videoJson.streamUrl = videoJson.videoFile;
  videoJson.vttUrl = videoJson.vttUrl || null;

  res
    .status(200)
    .json(new ApiResponse(200, videoJson, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findByPk(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  let oldThumbnail = null;

  if (req.file) {
    const thumbnailPath = req.file.path;
    oldThumbnail = video.thumbnail; // Save old URL to delete later
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);
    video.thumbnail = uploadedThumbnail.secure_url;
  }

  // Only update fields if provided
  if (title) video.title = title;
  if (description) video.description = description;

  await video.save();

  // Cleanup old thumbnail from Cloudinary if changed
  if (oldThumbnail) {
    const publicIdMatch = oldThumbnail.match(/\/([^/]+)\.\w+$/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      await cloudinary.uploader.destroy(publicId); // Assuming cloudinary is imported
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByPk(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 1. Delete comments associated with this video
  await Comment.destroy({ where: { videoId } });

  // 2. Delete thumbnail from Cloudinary
  if (video.thumbnail) {
    await deleteFromCloudinary(video.thumbnail);
  }

  // 3. Delete all resources in previewFolder (e.g., .ts screenshots and VTT)
  if (video.previewFolder) {
    try {
      // Delete all files under this folder
      await cloudinary.api.delete_resources_by_prefix(video.previewFolder);

      // Optionally delete the folder itself
      await cloudinary.api.delete_folder(video.previewFolder);

      console.log(`Deleted Cloudinary folder: ${video.previewFolder}`);
    } catch (err) {
      console.error("Error deleting Cloudinary folder:", err.message);
    }
  }

  // 4. Finally delete video from DB
  await video.destroy();

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Video and related media deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findByPk(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const previousStatus = video.isPublished;
  video.isPublished = !video.isPublished;
  await video.save();

  console.log(
    `Video ID ${videoId} publish status changed from ${previousStatus} to ${video.isPublished}`
  );

  res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
