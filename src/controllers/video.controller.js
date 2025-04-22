import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  });

  res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;

  const videoFile = req.files?.videoFile?.[0]?.path;
  const thumbnail = req.files?.thumbnail?.[0]?.path;

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoFile);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnail);

  const video = await Video.create({
    title,
    description,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    ownerId: userId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByPk(videoId, {
    include: [
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
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
