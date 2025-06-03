import express from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", getChannelStats);
dashboardRouter.get("/videos", getChannelVideos);

export { dashboardRouter };
