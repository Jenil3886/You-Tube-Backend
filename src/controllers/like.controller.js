import Like from "../models/like.model.js";
// import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id; // Fix: always use req.user.id

  const existingLike = await Like.findOne({ where: { videoId, userId } });

  if (existingLike) {
    await existingLike.destroy();
    return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
  }

  await Like.create({ videoId, userId });
  res.status(201).json(new ApiResponse(201, {}, "Video liked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id; // Fix: always use req.user.id

  const existingLike = await Like.findOne({ where: { commentId, userId } });

  if (existingLike) {
    await existingLike.destroy();
    return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
  }

  await Like.create({ commentId, userId });
  res.status(201).json(new ApiResponse(201, {}, "Comment liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user.id; // Fix: always use req.user.id

  const existingLike = await Like.findOne({ where: { tweetId, userId } });

  if (existingLike) {
    await existingLike.destroy();
    return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
  }

  await Like.create({ tweetId, userId });
  res.status(201).json(new ApiResponse(201, {}, "Tweet liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const likedVideos = await Like.findAll({
    where: { userId, videoId: { [Op.ne]: null } },
    include: ["Video"],
  });

  res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
