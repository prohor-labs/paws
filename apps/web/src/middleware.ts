import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!secret) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-internal-proxy-secret", secret);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
