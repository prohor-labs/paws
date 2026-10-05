/**
 * Bulletproof clipboard copy utility supporting:
 * - Modern navigator.clipboard (HTTPS/localhost)
 * - iOS Safari (WebKit selection ranges without readonly restriction)
 * - Android Chrome / WebView
 * - Desktop Chrome / Firefox / Edge
 * - Plain HTTP IP contexts
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof window === "undefined") {
    return false;
  }

  // 1. Try modern Async Clipboard API
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // 2. Cross-browser execCommand fallback
  try {
    const isIos = navigator.userAgent.match(/ipad|iphone/i);
    const textarea = document.createElement("textarea");
    textarea.value = text;

    // Prevent zooming and scrolling on mobile
    textarea.style.fontSize = "12pt";
    textarea.style.border = "0";
    textarea.style.padding = "0";
    textarea.style.margin = "0";
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";

    // Critical for iOS: do not set readonly
    if (!isIos) {
      textarea.setAttribute("readonly", "");
    }

    document.body.appendChild(textarea);

    if (isIos) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textarea.setSelectionRange(0, 999999);
    } else {
      textarea.focus();
      textarea.select();
    }

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error("ExecCommand copy failed:", err);
    return false;
  }
}
