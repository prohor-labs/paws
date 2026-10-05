/**
 * YouTube helper utilities
 */

/**
 * Returns the best-available YouTube thumbnail URL.
 *   "max" → maxresdefault (1280×720, native 16:9) — highest quality, may 404 on older videos
 *   "hq"  → hqdefault    (480×360, 4:3 with black bars)
 *   "mq"  → mqdefault    (320×180, native 16:9) — low-res fallback
 */
export function getYouTubeThumbnailUrl(
  youtubeId: string,
  quality: "max" | "hq" | "mq" = "max",
): string {
  if (quality === "hq") {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  if (quality === "mq") {
    return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
  }
  // "max" — default
  return `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
}

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  if (urlOrId.length === 11 && !urlOrId.includes("/")) return urlOrId;
  const match = urlOrId.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return match ? match[1] : urlOrId;
}
