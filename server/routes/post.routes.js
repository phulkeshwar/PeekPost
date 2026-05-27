import { Router } from "express";

import {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
  getPostLikes,
  getPostsByUser,
} from "../controllers/post.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { injectAds } from "../middlewares/premium.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", upload.array("media", 10), createPost);
router.get("/feed", injectAds, getFeed);
router.get("/user/:userId", getPostsByUser);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.post("/:id/like", toggleLikePost);
router.post("/:id/save", toggleSavePost);
router.get("/:id/likes", getPostLikes);

export default router;
