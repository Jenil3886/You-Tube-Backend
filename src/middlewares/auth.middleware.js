import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // console.log("verifyJWT middleware called");

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.error("No token provided in cookies or Authorization header");
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // Validate token format
    if (token.split(".").length < 0) {
      throw new ApiError(401, "Unauthorized request: Malformed token");
    }

    const decodedToken = jwt.verify(token, accessTokenSecret);

    // Fetch the user from the database
    const user = await User.findByPk(decodedToken?.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      console.error("User not found for token:", decodedToken);
      throw new ApiError(401, "Unauthorized request: User not found");
    }

    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
