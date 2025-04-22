import Playlist from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { userId } = req.user;

  const playlist = await Playlist.create({
    name,
    description,
    ownerId: userId,
  });

  res.status(201).json(new ApiResponse(201, playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const playlists = await Playlist.findAll({ where: { ownerId: userId } });

  res.status(200).json(new ApiResponse(200, playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  res.status(200).json(new ApiResponse(200, playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  await playlist.addVideo(videoId);

  res.status(200).json(new ApiResponse(200, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  await playlist.removeVideo(videoId);

  res.status(200).json(new ApiResponse(200, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  await playlist.destroy();

  res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const playlist = await Playlist.findByPk(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  playlist.name = name;
  playlist.description = description;
  await playlist.save();

  res.status(200).json(new ApiResponse(200, playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
