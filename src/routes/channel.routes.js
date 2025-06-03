import express from "express";
import {
  createChannel,
  updateChannel,
  deleteChannel,
  getMyChannel,
  //   getChannelById,
  getChannelByHandle,
} from "../controllers/channel.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyJWT,
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
    {
      name: "bannerPicture",
      maxCount: 1,
    },
  ]),
  createChannel
);
router.put("/:id", verifyJWT, updateChannel);
router.delete("/:id", verifyJWT, deleteChannel);
router.get("/me", verifyJWT, getMyChannel);
// router.get("/:id", getChannelById);
router.get("/@:handle", getChannelByHandle);

export default router;
