import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import Channel from "../models/Channel.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { getVideoDuration } from "../helper/getVideoDuration.js";
import streamUploadHLS from "../utils/ffmpegHelpers/streamUploadHLS.js";
import Ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { rimraf } from "rimraf";
import { v4 as uuidv4 } from "uuid";
import { io } from "../app.js";
import Comment from "../models/comment.model.js";
import { generateVTTFile } from "../helper/generateVTTFile.js";

// Helper function to generate VTT content

const uploadVideo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const socketId = req.body.socketId;

  if (!userId) throw new ApiError(400, "User ID is required");

  const channel = await Channel.findOne({ where: { ownerId: userId } });
  if (!channel) throw new ApiError(400, "Channel not found");

  const { title, description } = req.body;
  const videoFile = req.files?.videoFile?.[0]?.path;
  let thumbnail = req.files?.thumbnail?.[0]?.path;

  if (!videoFile) throw new ApiError(400, "Video is required");

  let duration;
  try {
    duration = await getVideoDuration(videoFile);
  } catch (err) {
    throw new ApiError(500, "Failed to get video duration");
  }

  const tempDir = path.join(os.tmpdir(), uuidv4());
  const cloudinaryFolder = `hls_videos/${uuidv4()}`;
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    io.to(socketId).emit("uploadProgress", {
      percent: 0,
      status: "Starting upload...",
    });

    const uploadedFiles = await streamUploadHLS(
      videoFile,
      tempDir,
      cloudinaryFolder,
      socketId
    );

    const playlistUrl = uploadedFiles.find((f) => f.file === "index.m3u8")?.url;

    // Generate and upload segment screenshots
    const segmentScreenshots = [];
    const segmentFiles = fs
      .readdirSync(tempDir)
      .filter((f) => f.endsWith(".ts"))
      .sort();

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
        `segment_screenshots`
      );
      segmentScreenshots.push({
        segment: segmentFile,
        screenshotUrl: uploaded.secure_url,
      });
    }

    // 🆕 Generate VTT file
    const vttContent = generateVTTFile(segmentScreenshots, 10); // each segment = 10s
    const vttPath = path.join(tempDir, "preview.vtt");
    fs.writeFileSync(vttPath, vttContent);

    const uploadedVtt = await uploadOnCloudinary(vttPath, `vtt_files`);
    const vttUrl = uploadedVtt.secure_url;

    // Upload thumbnail
    let uploadedThumbnail;
    if (thumbnail) {
      uploadedThumbnail = await uploadOnCloudinary(thumbnail, `thumbnails`);
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
        `thumbnails`
      );
    }

    // Save to DB
    const video = await Video.create({
      title,
      description,
      duration,
      videoFile: playlistUrl,
      thumbnail: uploadedThumbnail.secure_url,
      ownerId: userId,
      channelId: channel.id,
    });

    res.status(201).json(
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
    io.to(socketId).emit("uploadError", {
      error: "Upload failed",
      details: error.message,
    });
    throw new ApiError(500, "Video upload failed", error);
  } finally {
    // rimraf.sync(tempDir);
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

  const whereClause = query
    ? {
        title: {
          [Sequelize.Op.iLike]: `%${query}%`,
        },
      }
    : {};

  const videos = await Video.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: (page - 1) * limit,
    order: [[sortBy, sortType]],
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["id", "name", "handle", "profilePicture"],
      },
    ],
  });

  // Add comment count for each video
  const videoRowsWithCommentCount = await Promise.all(
    videos.rows.map(async (video) => {
      const commentCount = await Comment.count({
        where: { videoId: video.id },
      });
      return { ...video.toJSON(), commentCount };
    })
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...videos, rows: videoRowsWithCommentCount },
        "Videos fetched successfully"
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
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
  if (!video) throw new ApiError(404, "Video not found");

  // Increment view count
  video.views = (video.views || 0) + 1;
  await video.save();

  // Add this line for easier access
  video.dataValues.streamUrl = video.videoFile?.[0]; // You can later replace with .m3u8 file
  video.dataValues.vttUrl = video.vttUrl;
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findByPk(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (req.file) {
    const thumbnailPath = req.file.path;
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);
    video.thumbnail = uploadedThumbnail.url;
  }

  video.title = title || video.title;
  video.description = description || video.description;

  await video.save();

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

  await video.destroy();

  res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByPk(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

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
