import { type NextRequest, NextResponse } from "next/server";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.API_INTERNAL_URL ||
  process.env.API_URL ||
  "http://127.0.0.1:7000";

const INTERNAL_PROXY_SECRET =
  process.env.INTERNAL_PROXY_SECRET || "paws_prx_sec_79a0b3c48e59f12d8a01726c04f93821";

async function proxyHandler(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const targetUrl = `${INTERNAL_API_URL}${pathname}${search}`;

  const headers = new Headers(request.headers);
  headers.set("x-internal-proxy-secret", INTERNAL_PROXY_SECRET);
  headers.set("host", new URL(INTERNAL_API_URL).host);

  try {
    const isBodyAllowed = request.method !== "GET" && request.method !== "HEAD";
    const body = isBodyAllowed ? await request.arrayBuffer() : undefined;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    const rawSetCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];

    const nextResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

    if (rawSetCookies.length > 0) {
      nextResponse.headers.delete("set-cookie");
      for (const cookie of rawSetCookies) {
        nextResponse.headers.append("set-cookie", cookie);
      }
    }

    return nextResponse;
  } catch (error) {
    console.error("[API Proxy Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROXY_ERROR",
          message: "Failed to communicate with backend API",
        },
      },
      { status: 502 },
    );
  }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
export const OPTIONS = proxyHandler;
export const HEAD = proxyHandler;
