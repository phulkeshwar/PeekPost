import { Story } from "../models/Story.model.js";
import { Ad } from "../models/Ad.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { injectAdsInFeed } from "../utils/adInjector.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const plus24Hours = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

export const createStory = asyncHandler(async (req, res) => {
  const { media: bodyMedia, text = "", stickers = [], audience = "public" } = req.body;

  let media = bodyMedia;
  if (req.file) {
    media = await uploadToCloudinary(req.file, "peekpost/stories");
  }

  if (!media?.url || !media?.type) {
    const error = new Error("media.url and media.type are required");
    error.status = 400;
    throw error;
  }

  const story = await Story.create({
    author: req.user._id,
    media,
    text,
    stickers,
    audience,
    expiresAt: plus24Hours(),
  });

  const populatedStory = await Story.findById(story._id).populate("author", "username avatar");
  res.status(201).json(populatedStory);
});

export const getStoriesFeed = asyncHandler(async (req, res) => {
  const followingSet = new Set(req.user.following.map((id) => id.toString()));
  followingSet.add(req.user._id.toString());

  const users = await User.find({ _id: { $in: [...followingSet] } }).select("_id closeFriends");

  const closeFriendsByUserId = new Map(users.map((user) => [user._id.toString(), user.closeFriends.map((id) => id.toString())]));

  const stories = await Story.find({
    author: { $in: [...followingSet] },
    expiresAt: { $gt: new Date() },
  })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });

  const visibleStories = stories.filter((story) => {
    if (story.audience === "public") return true;
    const closeFriends = closeFriendsByUserId.get(story.author._id.toString()) || [];
    return closeFriends.includes(req.user._id.toString());
  });

  let items = visibleStories;
  if (req.showAds) {
    const ads = await Ad.find({ placement: "story", isActive: true }).limit(3);
    items = injectAdsInFeed(visibleStories, ads, 3);
  }

  res.json(items);
});

export const getUserStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({
    author: req.params.userId,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  res.json(stories);
});

export const markStoryViewed = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    const error = new Error("Story not found");
    error.status = 404;
    throw error;
  }

  const alreadyViewed = story.viewers.some((viewer) => viewer.user.toString() === req.user._id.toString());
  if (!alreadyViewed) {
    story.viewers.push({ user: req.user._id, viewedAt: new Date() });
    await story.save();
  }

  res.json({ viewed: true });
});

export const reactToStory = asyncHandler(async (req, res) => {
  const { emoji = "??" } = req.body;

  const story = await Story.findById(req.params.id);
  if (!story) {
    const error = new Error("Story not found");
    error.status = 404;
    throw error;
  }

  story.reactions = story.reactions.filter((reaction) => reaction.user.toString() !== req.user._id.toString());
  story.reactions.push({ user: req.user._id, emoji });

  await story.save();
  res.json({ reacted: true, emoji });
});

export const deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    const error = new Error("Story not found");
    error.status = 404;
    throw error;
  }

  if (story.author.toString() !== req.user._id.toString()) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  await Story.deleteOne({ _id: req.params.id });
  res.json({ message: "Story deleted" });
});
