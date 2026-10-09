/**
 * YouTube helper utilities
 */

/**
 * Returns the best-available YouTube thumbnail URL.
 *   "max" → maxresdefault (1280×720, native 16:9) — highest quality
 *   "hq720" → hq720 (1280×720 / 720p HD)
 *   "hq"  → hqdefault (480×360, 100% guaranteed on all YouTube videos)
 *   "mq"  → mqdefault (320×180, small 16:9)
 */
export function getYouTubeThumbnailUrl(
  youtubeId: string,
  quality: "max" | "hq720" | "hq" | "mq" = "max",
): string {
  if (quality === "hq720") {
    return `https://i.ytimg.com/vi/${youtubeId}/hq720.jpg`;
  }
  if (quality === "hq") {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  if (quality === "mq") {
    return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
  }
  // "max" — default attempt
  return `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
}
