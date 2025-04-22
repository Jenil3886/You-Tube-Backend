import Comment from "../models/comment.model.js";
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
  });

  res.status(200).json(new ApiResponse(200, comments));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const { userId } = req.user;

  const comment = await Comment.create({ content, videoId, ownerId: userId });

  res.status(201).json(new ApiResponse(201, comment));
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
