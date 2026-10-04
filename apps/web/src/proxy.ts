import { type NextRequest, NextResponse } from "next/server";

// 1. Explicitly Allowed Search Engine Indexers & User-Initiated AI Browsers (for live chat citation)
const ALLOWED_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  // Live Chat AI User-Browsing (User pasted link in ChatGPT / Claude / Perplexity to quote)
  /chatgpt-user/i,
  /claude-web/i,
  /perplexitybot/i,
];

// 2. Blocked Automated Scrapers, Bulk AI Training Crawlers & CLI/Headless Tools
const BLOCKED_SCRAPER_PATTERNS = [
  // CLI & Script Scrapers
  /curl/i,
  /wget/i,
  /python-requests/i,
  /aiohttp/i,
  /scrapy/i,
  /axios/i,
  /node-fetch/i,
  /undici/i,
  /go-http-client/i,
  /http\.rb/i,
  /postmanruntime/i,
  /java\//i,
  /libwww-perl/i,
  /httplib/i,
  /headless/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /antigravity/i,
  // Bulk AI Dataset / Model Training Crawlers
  /gptbot/i,
  /claudebot/i,
  /anthropic-ai/i,
  /ccbot/i,
  /bytespider/i,
  /google-extended/i,
  /applebot-extended/i,
  /cohere-ai/i,
  /diffbot/i,
  /facebookbot/i,
  /imagesiftbot/i,
];

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") || "";
  const pathname = request.nextUrl.pathname;

  // Check if request is an explicitly allowed search bot or user-driven chat reader
  const isExplicitlyAllowed = ALLOWED_BOT_PATTERNS.some((pattern) => pattern.test(ua));

  if (!isExplicitlyAllowed) {
    // Block if user-agent is missing, or matches blocked scraper/AI-training signatures
    const isBlocked = !ua.trim() || BLOCKED_SCRAPER_PATTERNS.some((pattern) => pattern.test(ua));

    if (isBlocked) {
      return new NextResponse(
        "403 Forbidden: Automated harvesting, bulk AI training datasets, and script scraping are strictly prohibited.\nIncident logged under BD-GOV-TRD/DH-849201-B.",
        {
          status: 403,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Robots-Tag": "noindex, nofollow, noai, noimageai",
          },
        }
      );
    }
  }

  // Internal API Secret Injection for /api/* routes
  const requestHeaders = new Headers(request.headers);
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (secret && pathname.startsWith("/api/")) {
    requestHeaders.set("x-internal-proxy-secret", secret);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Next.js 16 Proxy / Middleware entry points
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons / images / audio static folders
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)",
  ],
};
