import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Channel from "../models/Channel.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// Create a new channel
// export const createChannel = async (req, res) => {
//   //   const { profilePicture, bannerPicture } = req.files;
//   const { name, handle, description } = req.body;

//   if (!name) {
//     return res
//       .status(400)
//       .json(new ApiResponse(400, null, "Channel name is required"));
//   }

//   // Check if the user already has a channel
//   const existingChannel = await Channel.findOne({
//     where: { ownerId: req.user.id },
//   });

//   if (existingChannel) {
//     return res
//       .status(400)
//       .json(
//         new ApiResponse(
//           400,
//           null,
//           "You already have a channel. You cannot create multiple channels."
//         )
//       );
//   }

//   const profilePictureLocalPath = req.files?.avatar?.[0]?.path;
//   const bannerPictureLocalPath = req.files?.coverImage?.[0]?.path;

//   const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
//   const bannerPicture = await uploadOnCloudinary(bannerPictureLocalPath);

//   const newChannel = await Channel.create({
//     name,
//     handle,
//     description,
//     profilePicture: profilePicture?.url || "",
//     bannerPicture: bannerPicture?.url || "",
//     // profilePicture,
//     // bannerPicture,
//     ownerId: req.user.id,
//   });

//   res
//     .status(201)
//     .json(new ApiResponse(201, newChannel, "Channel created successfully"));
// };

export const createChannel = async (req, res) => {
  try {
    const { name, handle, description } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Channel name is required"));
    }

    // Check if the user already has a channel
    const existingChannel = await Channel.findOne({
      where: { ownerId: req.user.id },
    });

    if (existingChannel) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "You already have a channel. You cannot create multiple channels."
          )
        );
    }

    // Get uploaded file paths (may be undefined)
    const profilePictureLocalPath = req.files?.avatar?.[0]?.path;
    const bannerPictureLocalPath = req.files?.coverImage?.[0]?.path;

    // Upload to Cloudinary (only if files exist)
    const profilePictureUpload = profilePictureLocalPath
      ? await uploadOnCloudinary(profilePictureLocalPath)
      : null;

    const bannerPictureUpload = bannerPictureLocalPath
      ? await uploadOnCloudinary(bannerPictureLocalPath)
      : null;

    // Create channel with Cloudinary URLs (or empty string fallback)
    const newChannel = await Channel.create({
      name,
      handle,
      description,
      profilePicture: profilePictureUpload?.url || "",
      bannerPicture: bannerPictureUpload?.url || "",
      ownerId: req.user.id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newChannel, "Channel created successfully"));
  } catch (error) {
    console.error("Channel Creation Error:", error.message || error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to create channel"));
  }
};

export const updateChannel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, handle, description, profilePicture, channelBanner } = req.body;

  console.log("Update Channel Request:", req.body);

  const channel = await Channel.findByPk(id);
  if (!channel) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Channel not found"));
  }
  console.log("Channel ID:", channel);
  console.log("Channel found:", channel.ownerId, req.user.id);

  if (channel.ownerId != req.user.id) {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          null,
          "You are not authorized to update this channel"
        )
      );
  }

  channel.name = name || channel.name;
  channel.handle = handle || channel.handle;
  channel.description = description || channel.description;
  channel.profilePicture = profilePicture || channel.profilePicture;
  channel.channelBanner = channelBanner || channel.channelBanner;

  await channel.save();

  res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel updated successfully"));
});

// Get the current user's channel
export const getMyChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findOne({
    where: { ownerId: req.user.id },
  });

  if (!channel) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Channel not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel fetched successfully"));
});

// Delete a channel
export const deleteChannel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const channel = await Channel.findByPk(id);
  if (!channel) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Channel not found"));
  }

  if (channel.createdBy !== req.user.id) {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          null,
          "You are not authorized to delete this channel"
        )
      );
  }

  await channel.destroy();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Channel deleted successfully"));
});

// export const getChannelById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!id) {
//     return res
//       .status(400)
//       .json(new ApiResponse(400, null, "Channel ID is required"));
//   }

//   const channel = await Channel.findByPk(id);

//   if (!channel) {
//     return res
//       .status(404)
//       .json(new ApiResponse(404, null, "Channel not found"));
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, channel, "ChannEl fetched succenssfully"));
// });

// controllers/channel.controller.js

export const getChannelByHandle = asyncHandler(async (req, res) => {
  const { handle } = req.params;

  console.log(req.params);

  if (!handle) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Channel handle is required"));
  }

  // Assuming channel.name is stored in lowercase and without spaces
  //   console.log("==================", Channel);
  //   const channel = await Channel.findOne({
  //     where: { handle: handle },
  //   });

  const channel = await Channel.findOne({
    where: { handle },
  });

  if (!channel) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Channel not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel fetched successfully"));
});
