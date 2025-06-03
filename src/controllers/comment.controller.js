import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.findAll({
    where: { videoId },
    limit: parseInt(limit),
    offset: (page - 1) * limit,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "avatar"],
      },
    ],
  });

  // Get total count for this video
  const totalCount = await Comment.count({ where: { videoId } });

  res.status(200).json(new ApiResponse(200, { comments, count: totalCount }));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const { id: userId } = req.user;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.create({ content, videoId, ownerId: userId });
  // Fetch with user info
  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "username", "avatar"],
      },
    ],
  });

  res.status(201).json(new ApiResponse(201, commentWithUser));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  comment.content = content;
  await comment.save();

  res.status(200).json(new ApiResponse(200, comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  await comment.destroy();

  res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
