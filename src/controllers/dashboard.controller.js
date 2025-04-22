import Video from "../models/video.model.js";
import Subscription from "../models/subscription.model.js";
import Like from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const totalVideos = await Video.count({ where: { ownerId: userId } });
  const totalViews = await Video.sum("views", { where: { ownerId: userId } });
  const totalSubscribers = await Subscription.count({
    where: { channelId: userId },
  });
  const totalLikes = await Like.count({ where: { userId } });

  res.status(200).json(
    new ApiResponse(200, {
      totalVideos,
      totalViews,
      totalSubscribers,
      totalLikes,
    })
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  const videos = await Video.findAll({
    where: { ownerId: userId },
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });

  res.status(200).json(new ApiResponse(200, videos));
});

export { getChannelStats, getChannelVideos };
