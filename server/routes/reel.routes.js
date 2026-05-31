import { Router } from "express";

import {
  createReel,
  getReelFeed,
  getReelById,
  toggleLikeReel,
  deleteReel,
  getReelsByUser,
} from "../controllers/reel.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { injectAds } from "../middlewares/premium.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", createReel);
router.get("/feed", injectAds, getReelFeed);
router.get("/user/:userId", getReelsByUser);
router.get("/:id", getReelById);
router.post("/:id/like", toggleLikeReel);
router.delete("/:id", deleteReel);

export default router;