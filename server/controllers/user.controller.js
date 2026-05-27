import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const pickUserProfile = (user, viewerId) => {
  const isOwner = viewerId && user._id.toString() === viewerId.toString();
  return {
    id: user._id,
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
    website: user.website,
    avatar: user.avatar,
    isPrivate: user.isPrivate,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    isPremium: user.isPremium,
    premiumBadge: user.premiumBadge,
    isOwner,
    isFollowing: viewerId ? user.followers.some((id) => id.toString() === viewerId.toString()) : false,
  };
};

export const getProfileByUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  res.json(pickUserProfile(user, req.user?._id));
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["fullName", "bio", "website", "avatar", "isPrivate", "hideLikeCounts"];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });

  res.json(pickUserProfile(updatedUser, req.user._id));
});

export const toggleFollow = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    const error = new Error("Target user not found");
    error.status = 404;
    throw error;
  }

  const currentUserId = req.user._id;
  const isFollowing = targetUser.followers.some((id) => id.toString() === currentUserId.toString());

  if (isFollowing) {
    await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUser._id } });
  } else {
    await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUser._id } });
  }

  res.json({ following: !isFollowing });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("followers", "username fullName avatar");
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  res.json(user.followers);
});

export const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("following", "username fullName avatar");
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  res.json(user.following);
});

export const toggleBlock = asyncHandler(async (req, res) => {
  const exists = req.user.blockedUsers.some((id) => id.toString() === req.params.id);

  await User.findByIdAndUpdate(req.user._id, {
    [exists ? "$pull" : "$addToSet"]: { blockedUsers: req.params.id },
  });

  res.json({ blocked: !exists });
});

export const toggleRestrict = asyncHandler(async (req, res) => {
  const exists = req.user.restrictedUsers.some((id) => id.toString() === req.params.id);

  await User.findByIdAndUpdate(req.user._id, {
    [exists ? "$pull" : "$addToSet"]: { restrictedUsers: req.params.id },
  });

  res.json({ restricted: !exists });
});

export const getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await User.find({ _id: { $ne: req.user._id } })
    .select("username fullName avatar followers")
    .limit(10)
    .sort({ createdAt: -1 });

  res.json(
    suggestions.map((user) => ({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      followersCount: user.followers.length,
    })),
  );
});

export const searchUsers = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) {
    res.json([]);
    return;
  }

  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const searchPattern = new RegExp(escapedQuery, "i");

  const users = await User.find({
    isDeactivated: false,
    $or: [
      { username: searchPattern },
      { fullName: searchPattern },
      { email: searchPattern },
    ],
  })
    .select("username fullName avatar email")
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(
    users.map((user) => ({
      id: user._id,
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      email: user.email,
    })),
  );
});

export const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { isDeactivated: true } });
  res.json({ message: "Account deactivated" });
});
