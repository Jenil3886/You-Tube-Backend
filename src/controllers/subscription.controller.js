// import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
// import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized: No user id found"));
  }

  if (parseInt(channelId) === userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "You cannot subscribe to yourself"));
  }

  const existingSubscription = await Subscription.findOne({
    where: { channelId, subscriberId: userId },
  });

  let subscribed;
  if (existingSubscription) {
    await existingSubscription.destroy();
    subscribed = false;
  } else {
    await Subscription.create({ channelId, subscriberId: userId });
    subscribed = true;
  }

  // Get the new subscriber count for the channel
  const subscriberCount = await Subscription.count({ where: { channelId } });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed, subscriberCount },
        subscribed ? "Subscribed" : "Unsubscribed"
      )
    );
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
  const userId = req.user?.id;
  if (!userId) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized: No user id found"));
  }

  const channels = await Subscription.findAll({
    where: { subscriberId: userId },
    include: ["Channel"],
  });

  res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
