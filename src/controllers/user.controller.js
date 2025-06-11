import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import Sequelize from "sequelize";
import crypto from "crypto";
import nodemailer from "nodemailer";

// In-memory store for reset tokens (for demo; use DB in production)
const passwordResetTokens = {};

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error -------------->", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    if (
      [fullName, email, username, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      where: { [Sequelize.Op.or]: [{ username }, { email }] },
    });

    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      console.error("Avatar file is missing");
      throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImageUrl = "";
    if (coverImageLocalPath) {
      const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
      coverImageUrl = uploadedCoverImage?.url || "";
    }

    const user = await User.create({
      fullName,
      avatar: avatar?.url || "",
      coverImage: coverImageUrl || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const token = jwt.sign({ id: user.id }, accessTokenSecret, {
      expiresIn: accessTokenExpiry,
    });

    const createdUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdUser, "User registered successfully", token)
      );
  } catch (error) {
    console.error("Registration Error:", error.message || error);
    throw error;
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    console.error("Missing username or email"); // Log missing fields
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    where: { [Sequelize.Op.or]: [{ username }, { email }] },
  });

  if (!user) {
    console.error("User not found for:", { email, username }); // Log missing user
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    console.error("Invalid password for user:", { email, username }); // Log invalid password
    throw new ApiError(401, "Invalid user credentials");
  }

  try {
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id
    );

    const loggedInUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, { secure: false })
      .cookie("refreshToken", refreshToken, { secure: false })
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
            token: accessToken,
          },
          "User logged In Successfully"
        )
      );
  } catch (error) {
    console.error("Error generating tokens:", error.message || error); // Log token generation errors
    throw new ApiError(500, "Failed to generate tokens");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.update(
    { refreshToken: null },
    {
      where: { id: req.user.id },
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findByPk(decodedToken?.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: No user data found in request");
  }

  const user = await User.findByPk(req.user.id, {
    attributes: ["id", "fullName", "username", "email", "avatar", "coverImage"],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.update(
    { fullName, email },
    {
      where: { id: req.user?.id },
      returning: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[1][0], "Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.update(
    { avatar: avatar.url },
    {
      where: { id: req.user?.id },
      returning: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[1][0], "Avatar image updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const user = await User.update(
    { coverImage: coverImage.url },
    {
      where: { id: req.user?.id },
      returning: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user[1][0], "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.findOne({
    where: { username: username?.toLowerCase() },
    attributes: [
      "fullName",
      "username",
      "avatar",
      "coverImage",
      "email",
      [
        Sequelize.literal(
          `(SELECT COUNT(*) FROM subscriptions WHERE subscriptions.channel = User.id)`
        ),
        "subscribersCount",
      ],
      [
        Sequelize.literal(
          `(SELECT COUNT(*) FROM subscriptions WHERE subscriptions.subscriber = User.id)`
        ),
        "channelsSubscribedToCount",
      ],
      [
        Sequelize.literal(
          `(SELECT EXISTS (SELECT 1 FROM subscriptions WHERE subscriptions.channel = User.id AND subscriptions.subscriber = '${req.user?.id}'))`
        ),
        "isSubscribed",
      ],
    ],
  });

  if (!channel) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      {
        model: Video,
        as: "watchHistory",
        include: [
          {
            model: User,
            as: "owner",
            attributes: ["fullName", "username", "avatar"],
          },
        ],
      },
    ],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(404, "No user found with this email");

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  passwordResetTokens[token] = {
    userId: user.id,
    expires: Date.now() + 1000 * 60 * 30,
  };
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  // Send email using nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your email password or app password
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password:</p><p><a href='${resetUrl}'>Reset Password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send reset email:", err);
    throw new ApiError(
      500,
      "Failed to send reset email. Please try again later."
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Reset link sent to your email (check spam too)."
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    throw new ApiError(400, "Token and new password are required");
  const data = passwordResetTokens[token];
  if (!data || data.expires < Date.now())
    throw new ApiError(400, "Invalid or expired reset token");
  const user = await User.findByPk(data.userId);
  if (!user) throw new ApiError(404, "User not found");
  user.password = password;
  await user.save();
  delete passwordResetTokens[token];
  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Password reset successful. You can now log in.")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  forgotPassword,
  resetPassword,
};
