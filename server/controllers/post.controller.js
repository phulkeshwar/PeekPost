import { Post } from "../models/Post.model.js";
import { Ad } from "../models/Ad.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { scorePosts } from "../utils/feedAlgorithm.js";
import { injectAdsInFeed } from "../utils/adInjector.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const parseTags = (caption = "") => {
  const hashtags = [...caption.matchAll(/#(\w+)/g)].map((match) => match[1].toLowerCase());
  const mentions = [...caption.matchAll(/@(\w+)/g)].map((match) => match[1].toLowerCase());
  return { hashtags, mentions };
};

export const createPost = asyncHandler(async (req, res) => {
  const { caption = "", commentsDisabled = false } = req.body;
  let { media = [] } = req.body;
  let { location = {} } = req.body;

  if (typeof media === "string") {
    try {
      media = JSON.parse(media);
    } catch (_error) {
      media = [];
    }
  }

  if (typeof location === "string") {
    try {
      location = JSON.parse(location);
    } catch (_error) {
      location = {};
    }
  }

  if (req.files?.length) {
    media = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, "peekpost/posts")),
    );
  }

  if (!Array.isArray(media) || media.length === 0) {
    const error = new Error("At least one media item is required");
    error.status = 400;
    throw error;
  }

  const { hashtags, mentions } = parseTags(caption);
  const mentionedUsers = await User.find({ username: { $in: mentions } }).select("_id");

  const post = await Post.create({
    author: req.user._id,
    media,
    caption,
    commentsDisabled,
    location,
    hashtags,
    mentions: mentionedUsers.map((user) => user._id),
  });

  const populated = await Post.findById(post._id).populate("author", "username fullName avatar isPremium premiumBadge");
  res.status(201).json(populated);
});

export const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const followedIds = req.user.following || [];
  const authorIds = [req.user._id, ...followedIds];

  const posts = await Post.find({ author: { $in: authorIds } })
    .populate("author", "username fullName avatar isPremium premiumBadge")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(false);

  const rankedPosts = scorePosts(posts);

  let items = rankedPosts;
  if (req.showAds) {
    const ads = await Ad.find({ placement: "feed", isActive: true }).limit(5);
    items = injectAdsInFeed(rankedPosts, ads, 5);
  }

  res.json({
    page,
    limit,
    items,
    hasMore: posts.length === limit,
  });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "username fullName avatar");

  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  post.views += 1;
  await post.save();

  res.json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  if (post.author.toString() !== req.user._id.toString()) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  if (typeof req.body.caption === "string") {
    post.caption = req.body.caption;
    const { hashtags } = parseTags(req.body.caption);
    post.hashtags = hashtags;
  }

  if (Array.isArray(req.body.tagged)) {
    post.tagged = req.body.tagged;
  }

  if (typeof req.body.commentsDisabled === "boolean") {
    post.commentsDisabled = req.body.commentsDisabled;
  }

  await post.save();
  res.json(post);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  if (post.author.toString() !== req.user._id.toString()) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  await Post.deleteOne({ _id: req.params.id });
  res.json({ message: "Post deleted" });
});

export const toggleLikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  const liked = post.likes.some((id) => id.toString() === req.user._id.toString());

  if (liked) {
    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();
  res.json({ liked: !liked, likesCount: post.likes.length });
});

export const toggleSavePost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const alreadySaved = user.savedPosts.some((id) => id.toString() === req.params.id);

  if (alreadySaved) {
    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== req.params.id);
  } else {
    user.savedPosts.push(req.params.id);
  }

  await user.save();

  res.json({ saved: !alreadySaved });
});

export const getPostLikes = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("likes", "username fullName avatar");

  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  res.json(post.likes);
});

export const getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.userId })
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 });

  res.json(posts);
});
