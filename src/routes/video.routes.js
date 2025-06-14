import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  uploadVideo,
  togglePublishStatus,
  updateVideo,
  incrementView,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    verifyJWT, // Ensure this middleware is applied
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    (req, res, next) => {
      const videoFile = req.files?.videoFile?.[0];
      const thumbnail = req.files?.thumbnail?.[0];

      if (videoFile && videoFile.size > 50000000) {
        return res
          .status(400)
          .json({ error: "Video file size exceeds limit of 50MB" });
      }

      if (thumbnail && thumbnail.size > 5000000) {
        return res
          .status(400)
          .json({ error: "Thumbnail file size exceeds limit of 5MB" });
      }

      next();
    },
    uploadVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/like/:videoId").post(verifyJWT, toggleVideoLike);
router.post("/:videoId/increment-view", incrementView);

export default router;
