import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { db } from "../src/db";
import {
  watchChannels,
  watchCommentLikes,
  watchComments,
  watchInteractions,
  watchPlaylists,
  watchProgress,
  watchVideos,
} from "../src/db/schema/watch";

interface RawVideoItem {
  "Channel Title": string;
  "Channel URL": string;
  "Channel ID": string;
  Position: string;
  "Video Title": string;
  "Video URL": string;
  "Video ID": string;
  "Publish Date": string;
  Duration: string;
  Views: string;
  Description: string;
  "Thumbnail URL": string;
  "Availability Status": string;
}

function parseDurationToSeconds(durStr: string): number {
  if (!durStr) return 0;
  const parts = durStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  return parts[0] || 0;
}

function parseRelativeDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return "Recently";
  }
}

function determineCategory(title: string, desc: string): string {
  const combined = (title + " " + desc).toLowerCase();
  if (
    combined.includes("madrasa") ||
    combined.includes("culprit") ||
    combined.includes("investigat") ||
    combined.includes("su*cide") ||
    combined.includes("brutal system")
  ) {
    return "Investigative";
  }
  if (
    combined.includes("polymath") ||
    combined.includes("learn") ||
    combined.includes("education") ||
    combined.includes("edtech")
  ) {
    return "Education";
  }
  if (
    combined.includes("money") ||
    combined.includes("business") ||
    combined.includes("scam") ||
    combined.includes("unemployment") ||
    combined.includes("ai 2027") ||
    combined.includes("world cup") ||
    combined.includes("fifa")
  ) {
    return "Tech";
  }
  return "Documentary";
}

function extractTags(desc: string, title: string): string[] {
  const matches = desc.match(/#(\w+)/g);
  const tags: string[] = [];
  if (matches) {
    for (const m of matches) {
      const tag = m.replace("#", "").trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }
  if (tags.length === 0) {
    tags.push("thethinker", "documentary", "bangla", "essay");
  }
  return tags.slice(0, 8);
}

async function run() {
  console.log("1. Pruning all existing watch tables...");
  await db.execute(
    sql`TRUNCATE TABLE watch_comment_likes, watch_comments, watch_interactions, watch_progress, watch_playlists, watch_videos, watch_channels CASCADE;`,
  );
  console.log("   Done pruning.");

  // Read the JSON parsed from Excel
  const rawData: RawVideoItem[] = JSON.parse(readFileSync("/tmp/the-thinker.json", "utf-8"));
  console.log(`2. Read ${rawData.length} video rows for The Thinker.`);

  // Channel details
  const channelHandle = "@TheThinkerNetwork";
  const channelName = "The Thinker";
  const channelAvatar =
    "https://yt3.ggpht.com/7MWudNV-3gnQS76tMrAeXhW_gArzzZI6HrRX5kNkmDh5cMklZzMhmcLN3gW5ChfUZs-hZOuc=s800-c-k-c0x00ffffff-no-rj";
  const channelBanner =
    "https://yt3.googleusercontent.com/7bMeDjZJPvRQsdCcNgHEiV74Vc_WEdRODFn5eiD2roV-yl6TxBf0tcuE1U9_itgFEcDQejvFSQ";

  console.log("3. Inserting The Thinker channel...");
  await db.insert(watchChannels).values({
    handle: channelHandle,
    name: channelName,
    avatar: channelAvatar,
    banner: channelBanner,
    subscribers: "450K subscribers",
    videoCount: `${rawData.length} videos`,
    verified: true,
    description:
      "Documentaries on psychology, social phenomena, philosophy, polymath learning, critical thinking, and investigative stories.",
    joinedDate: "Joined Oct 2024",
  });

  console.log("4. Inserting videos...");
  const insertedVideoIds: string[] = [];
  const investigativeVideoIds: string[] = [];
  const polymathVideoIds: string[] = [];

  for (const item of rawData) {
    let vidId = item["Video ID"].trim();
    if (vidId.startsWith("'")) {
      vidId = vidId.substring(1);
    }
    const title = item["Video Title"].trim();
    const desc = item.Description || "";
    const durationStr = item.Duration || "00:00";
    const durationSec = parseDurationToSeconds(durationStr);
    const viewsStr = (item.Views || "0").replace(/,/g, "").trim();
    const viewsCount = parseInt(viewsStr, 10) || 0;
    const likesCount = Math.floor(viewsCount * 0.08) || 120;
    const commentsCount = Math.floor(viewsCount * 0.015) || 25;
    const publishedAt = parseRelativeDate(item["Publish Date"]);
    const category = determineCategory(title, desc);
    const tags = extractTags(desc, title);
    const customThumbnail = item["Thumbnail URL"] || null;

    await db.insert(watchVideos).values({
      id: vidId,
      youtubeId: vidId,
      title,
      description: desc,
      channelHandle,
      category,
      duration: durationStr,
      durationSeconds: durationSec,
      viewsCount,
      likesCount,
      commentsCount,
      publishedAt,
      tags,
      customThumbnail,
    });

    insertedVideoIds.push(vidId);
    if (category === "Investigative") {
      investigativeVideoIds.push(vidId);
    }
    if (category === "Education" || category === "Documentary") {
      polymathVideoIds.push(vidId);
    }
  }
  console.log(`   Inserted ${insertedVideoIds.length} videos.`);

  console.log("5. Creating curated playlists for The Thinker...");
  // Playlists
  const playlists = [
    {
      id: "pl-thinker-investigative",
      slug: "catch-the-culprit-investigative-documentaries",
      title: "Catch the Culprit & Investigative Series",
      description:
        "Deep-dive investigative documentaries exploring hidden realities, systemic issues, and dark beliefs.",
      customCover:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
      category: "Investigative",
      channelName,
      channelHandle,
      videoIds: investigativeVideoIds.slice(0, 6),
      createdDate: "Updated recently",
    },
    {
      id: "pl-thinker-polymath",
      slug: "polymath-learning-and-mindset",
      title: "Polymath Learning & Mindset Transformation",
      description:
        "Mastering skills, deep work, the polymath philosophy, and breaking out of average limits.",
      customCover:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format&fit=crop&q=80",
      category: "Education",
      channelName,
      channelHandle,
      videoIds: polymathVideoIds.slice(0, 6),
      createdDate: "Updated recently",
    },
  ];

  for (const pl of playlists) {
    await db.insert(watchPlaylists).values(pl);
  }
  console.log(`   Inserted ${playlists.length} curated playlists.`);

  console.log("All done! Successfully pruned old data and added The Thinker channel and videos.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
