import { Router } from "express";

import {
  createStory,
  getStoriesFeed,
  getUserStories,
  markStoryViewed,
  reactToStory,
  deleteStory,
} from "../controllers/story.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { injectAds } from "../middlewares/premium.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", upload.single("media"), createStory);
router.get("/feed", injectAds, getStoriesFeed);
router.get("/:userId", getUserStories);
router.post("/:id/view", markStoryViewed);
router.post("/:id/react", reactToStory);
router.delete("/:id", deleteStory);

export default router;
