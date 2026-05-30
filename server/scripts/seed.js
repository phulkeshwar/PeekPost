import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";
import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Ad } from "../models/Ad.model.js";
import { Reel } from "../models/Reel.model.js";

dotenv.config();

const DEMO_PASSWORD = "password123";
const USER_COUNT = 20;
const POST_COUNT = 100;
const STORY_GROUP_COUNT = 10;
const STORIES_PER_GROUP = 2;
const AD_COUNT = 5;

const avatarUrl = (index) => `https://i.pravatar.cc/300?img=${index + 1}`;
const photoUrl = (seed, width = 1080, height = 1080) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

const profiles = [
  ["Aarav Mehta", "aarav.frames", "Street frames, chai breaks, city light."],
  ["Maya Kapoor", "maya.trails", "Weekend hikes and quiet corners."],
  ["Kabir Sen", "kabir.creates", "Design notes, coffee, and motion blur."],
  ["Isha Rao", "isha.palette", "Color studies from ordinary days."],
  ["Rohan Das", "rohan.roams", "Food, travel, and tiny maps."],
  ["Naina Shah", "naina.notes", "Books, blooms, and balcony sunsets."],
  ["Vivaan Joshi", "vivaan.vibes", "Music finds and late-night edits."],
  ["Anika Verma", "anika.lens", "Portraits with too much heart."],
  ["Dev Malhotra", "dev.codes", "Building things and documenting the mess."],
  ["Tara Bose", "tara.table", "Recipes, markets, and shared plates."],
  ["Neil Arora", "neil.fit", "Training logs and recovery rituals."],
  ["Riya Nair", "riya.reads", "Margins full of notes."],
  ["Arjun Sethi", "arjun.wheels", "Cars, roads, and golden hour stops."],
  ["Kiara Menon", "kiara.calm", "Mindful mornings and soft routines."],
  ["Yash Gupta", "yash.daily", "Everyday captures from everywhere."],
  ["Meera Khanna", "meera.mode", "Personal style and textile love."],
  ["Om Patel", "om.outside", "Nature walks and weekend weather."],
  ["Sara Ali", "sara.studio", "Sketchbooks, clay, and gallery days."],
  ["Aditya Roy", "aditya.bytes", "Tech desk, clean setups, useful tools."],
  ["Zoya Thomas", "zoya.journal", "Small stories from big days."],
];

const postThemes = [
  { tag: "city", caption: "Found a quiet frame in the middle of the rush.", hashtags: ["city", "peekpost", "daily"], location: "Mumbai, India" },
  { tag: "coffee", caption: "A slow coffee before the inbox wakes up.", hashtags: ["coffee", "morning", "peekpost"], location: "Bengaluru, India" },
  { tag: "travel", caption: "Saved this view for a day that needed more sky.", hashtags: ["travel", "views", "demo"], location: "Goa, India" },
  { tag: "food", caption: "Table full, phone eats first.", hashtags: ["food", "friends", "peekpost"], location: "Delhi, India" },
  { tag: "workspace", caption: "Reset the desk and the week followed.", hashtags: ["workspace", "focus", "setup"], location: "Pune, India" },
  { tag: "nature", caption: "Proof that the long route was worth it.", hashtags: ["nature", "weekend", "trail"], location: "Munnar, India" },
  { tag: "style", caption: "Texture, contrast, and one good mirror.", hashtags: ["style", "portrait", "demo"], location: "Jaipur, India" },
  { tag: "art", caption: "Tiny experiments, loud colors.", hashtags: ["art", "studio", "peekpost"], location: "Kolkata, India" },
];

const adCampaigns = [
  {
    title: "Upgrade your workspace",
    advertiser: "Workly",
    placement: "feed",
    interests: ["productivity", "design", "technology"],
  },
  {
    title: "Capture better weekend stories",
    advertiser: "StoryBrand",
    placement: "story",
    interests: ["photography", "travel", "lifestyle"],
  },
  {
    title: "Edit reels in half the time",
    advertiser: "ReelX",
    placement: "reel",
    interests: ["creator tools", "video", "music"],
  },
  {
    title: "Find your next city escape",
    advertiser: "ExploreHub",
    placement: "explore",
    interests: ["travel", "food", "events"],
  },
  {
    title: "Fresh drops for daily fits",
    advertiser: "ModeMarket",
    placement: "feed",
    interests: ["fashion", "style", "shopping"],
  },
];

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Story.deleteMany({}), Ad.deleteMany({}), Reel.deleteMany({})]);

  const password = await bcrypt.hash(DEMO_PASSWORD, 12);

  const users = await User.insertMany(
    profiles.slice(0, USER_COUNT).map(([fullName, username, bio], index) => ({
      username,
      email: `user${index + 1}@peekpost.dev`,
      password,
      fullName,
      bio,
      website: `https://peekpost.dev/${username}`,
      avatar: avatarUrl(index),
      isPremium: index < 4,
      premiumPlan: index < 4 ? (index % 2 === 0 ? "yearly" : "monthly") : null,
      premiumExpiry: index < 4 ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : null,
      premiumBadge: index < 4,
      isVerified: index < 8,
      lastSeen: new Date(Date.now() - index * 30 * 60 * 1000),
    })),
  );

  for (const [index, user] of users.entries()) {
    const priorityFollowTargets = users.filter((_, candidateIndex) => candidateIndex < STORY_GROUP_COUNT && candidateIndex !== index);
    const rotatingFollowTargets = users
      .filter((candidate, candidateIndex) => candidateIndex !== index && (candidateIndex + index) % 3 !== 0)
      .filter((candidate) => !priorityFollowTargets.some((priority) => priority._id.equals(candidate._id)));
    const following = [...priorityFollowTargets, ...rotatingFollowTargets]
      .slice(0, 12)
      .map((candidate) => candidate._id);

    user.following = following;
    user.followers = users
      .filter((candidate, candidateIndex) => candidateIndex !== index && (candidateIndex + index) % 4 !== 0)
      .slice(0, 10)
      .map((candidate) => candidate._id);
    user.closeFriends = following.slice(0, 4);
    await user.save();
  }

  const posts = await Post.insertMany(
    Array.from({ length: POST_COUNT }).map((_, index) => {
      const author = users[index % users.length];
      const theme = postThemes[index % postThemes.length];
      const mentionedUser = users[(index + 3) % users.length];
      const taggedUser = users[(index + 7) % users.length];
      const likedBy = users
        .filter((user) => user._id.toString() !== author._id.toString())
        .slice(index % 5, (index % 5) + 6)
        .map((user) => user._id);

      return {
        author: author._id,
        media: [{ url: photoUrl(`post-${theme.tag}-${index + 1}`), type: "image", publicId: "" }],
        caption: `${theme.caption} @${mentionedUser.username} #${theme.hashtags.join(" #")}`,
        hashtags: theme.hashtags,
        mentions: [mentionedUser._id],
        tagged: [{ user: taggedUser._id, x: 48, y: 52 }],
        location: {
          name: theme.location,
          lat: 18 + (index % 12),
          lng: 72 + (index % 10),
        },
        likes: likedBy,
        views: 120 + index * 17,
        commentsDisabled: index % 17 === 0,
        createdAt: new Date(Date.now() - index * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - index * 60 * 60 * 1000),
      };
    }),
  );

  for (const user of users) {
    user.savedPosts = posts
      .filter((post) => post.author.toString() !== user._id.toString())
      .slice(0, 8)
      .map((post) => post._id);
    await user.save();
  }

  await Story.insertMany(
    users.slice(0, STORY_GROUP_COUNT).flatMap((user, groupIndex) =>
      Array.from({ length: STORIES_PER_GROUP }).map((_, storyIndex) => ({
        author: user._id,
        media: {
          url: photoUrl(`story-${groupIndex + 1}-${storyIndex + 1}`, 720, 1280),
          type: "image",
          publicId: "",
        },
        text: `Story ${storyIndex + 1} from ${user.fullName}`,
        stickers: storyIndex % 2 === 0 ? ["new-post"] : ["weekend"],
        viewers: users.slice(10, 15).map((viewer) => ({
          user: viewer._id,
          viewedAt: new Date(Date.now() - storyIndex * 45 * 60 * 1000),
        })),
        reactions: users.slice(15, 18).map((viewer) => ({
          user: viewer._id,
          emoji: storyIndex % 2 === 0 ? "heart" : "fire",
        })),
        audience: "public",
        expiresAt: new Date(Date.now() + (24 - storyIndex * 3) * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (groupIndex + storyIndex) * 40 * 60 * 1000),
        updatedAt: new Date(Date.now() - (groupIndex + storyIndex) * 40 * 60 * 1000),
      })),
    ),
  );

  await Ad.insertMany(
    adCampaigns.slice(0, AD_COUNT).map((campaign, index) => ({
      title: campaign.title,
      imageUrl: photoUrl(`ad-${index + 1}`, 1200, 900),
      linkUrl: `https://example.com/campaigns/${campaign.advertiser.toLowerCase()}`,
      advertiser: campaign.advertiser,
      targetAudience: {
        ageMin: 18 + index,
        ageMax: 45 + index * 4,
        interests: campaign.interests,
      },
      placement: campaign.placement,
      impressions: index * 250,
      clicks: index * 18,
      isActive: true,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })),
  );

  const sampleReels = [
    {
      caption: "Stunning evening lights in Bengaluru. 🏙️ #cityvibes #nightlife #peekpost",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      audio: { title: "Original Audio", artist: "aarav.frames" }
    },
    {
      caption: "Chasing sunsets along the coast. 🌊 #oceanview #travelshorts #nature",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      audio: { title: "Coastal Drift", artist: "maya.trails" }
    },
    {
      caption: "Building minimal workspace setups from scratch. 🛠️💻 #workstations #setup",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      audio: { title: "Lofi Focus Beat", artist: "dev.codes" }
    },
    {
      caption: "Mindful coffee mornings. ☕ #lofi #morningroutine #peekpost",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      audio: { title: "Mindful Morning", artist: "kiara.calm" }
    }
  ];

  const seededReels = await Reel.insertMany(
    sampleReels.map((r, index) => {
      const author = users[index % users.length];
      const likedBy = users.slice(2, 8).map((u) => u._id);
      return {
        ...r,
        author: author._id,
        likes: likedBy,
        shares: index * 14 + 18,
      };
    })
  );

  console.log("Seed complete");
  console.log(`Created ${users.length} users with profile photos`);
  console.log(`Created ${posts.length} sample posts`);
  console.log(`Created ${STORY_GROUP_COUNT} story groups (${STORY_GROUP_COUNT * STORIES_PER_GROUP} stories)`);
  console.log(`Created ${AD_COUNT} active ad campaigns`);
  console.log(`Created ${seededReels.length} sample reels`);
  console.log(`Demo login: user1@peekpost.dev / ${DEMO_PASSWORD}`);
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
