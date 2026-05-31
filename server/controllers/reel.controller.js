import { Reel } from "../models/Reel.model.js";
import { Ad } from "../models/Ad.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { injectAdsInFeed } from "../utils/adInjector.js";

export const createReel = asyncHandler(async (req, res) => {
  const { videoUrl, coverUrl = "", caption = "", audio = {} } = req.body;

  if (!videoUrl) {
    const error = new Error("videoUrl is required");
    error.status = 400;
    throw error;
  }

  const reel = await Reel.create({
    author: req.user._id,
    videoUrl,
    coverUrl,
    caption,
    audio,
  });

  const populated = await Reel.findById(reel._id).populate("author", "username fullName avatar");
  res.status(201).json(populated);
});

export const getReelFeed = asyncHandler(async (req, res) => {
  const reels = await Reel.find()
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 })
    .limit(30);

  let items = reels;
  if (req.showAds) {
    const ads = await Ad.find({ placement: "reel", isActive: true }).limit(5);
    items = injectAdsInFeed(reels, ads, 4);
  }

  res.json(items);
});

export const getReelById = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id).populate("author", "username fullName avatar");

  if (!reel) {
    const error = new Error("Reel not found");
    error.status = 404;
    throw error;
  }

  res.json(reel);
});

export const toggleLikeReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);

  if (!reel) {
    const error = new Error("Reel not found");
    error.status = 404;
    throw error;
  }

  const liked = reel.likes.some((id) => id.toString() === req.user._id.toString());

  if (liked) {
    reel.likes = reel.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    reel.likes.push(req.user._id);
  }

  await reel.save();

  res.json({ liked: !liked, likesCount: reel.likes.length });
});

export const deleteReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);

  if (!reel) {
    const error = new Error("Reel not found");
    error.status = 404;
    throw error;
  }

  if (reel.author.toString() !== req.user._id.toString()) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  await Reel.deleteOne({ _id: req.params.id });
  res.json({ message: "Reel deleted" });
});

export const getReelsByUser = asyncHandler(async (req, res) => {
  const reels = await Reel.find({ author: req.params.userId })
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 });

  res.json(reels);
});