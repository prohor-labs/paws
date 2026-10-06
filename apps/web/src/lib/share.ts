import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

export interface ShareOptions {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Resolves relative path to full absolute URL.
 */
function getAbsoluteShareUrl(pathOrUrl: string): string {
  if (typeof window === "undefined") return pathOrUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${window.location.origin}${cleanPath}`;
}

/**
 * Native Device Share with graceful clipboard fallback.
 */
export async function shareContent(options: ShareOptions): Promise<boolean> {
  const fullUrl = getAbsoluteShareUrl(options.url);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: options.title || "Paws Academy",
        text: options.text || options.title,
        url: fullUrl,
      });
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return false; // User cancelled share sheet
      }
      // If error occurs, fallback to copy
    }
  }

  // Fallback to clipboard
  const success = await copyToClipboard(fullUrl);
  if (success) {
    toast.success("লিংক কপি করা হয়েছে!");
  } else {
    toast.error("লিংক কপি করতে ব্যর্থ হয়েছে");
  }
  return success;
}

/**
 * Social share URL generators.
 */
export function getSocialShareUrl(
  platform: "whatsapp" | "telegram" | "facebook" | "x",
  options: ShareOptions,
): string {
  const fullUrl = encodeURIComponent(getAbsoluteShareUrl(options.url));
  const text = encodeURIComponent(options.text || options.title || "");

  switch (platform) {
    case "whatsapp":
      return `https://api.whatsapp.com/send?text=${text}%20${fullUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${fullUrl}&text=${text}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`;
    case "x":
      return `https://x.com/intent/tweet?url=${fullUrl}&text=${text}`;
  }
}
