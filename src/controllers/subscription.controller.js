// import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
// import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { userId } = req.user;

  const existingSubscription = await Subscription.findOne({
    where: { channelId, subscriberId: userId },
  });

  if (existingSubscription) {
    await existingSubscription.destroy();
    return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed"));
  }

  await Subscription.create({ channelId, subscriberId: userId });
  res.status(201).json(new ApiResponse(201, {}, "Subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.findAll({
    where: { channelId },
    include: ["Subscriber"],
  });

  res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const channels = await Subscription.findAll({
    where: { subscriberId: userId },
    include: ["Channel"],
  });

  res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
