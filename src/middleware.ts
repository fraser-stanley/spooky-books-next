import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Handle CORS for visual editing
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Add CORS headers for Sanity Studio
    response.headers.set(
      "Access-Control-Allow-Origin",
      "https://spooky-books.sanity.studio",
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Enable back/forward cache restoration
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    response.headers.set("X-Accel-Buffering", "no");
    
    // Avoid blocking back/forward cache
    response.headers.delete("no-cache");
    response.headers.delete("no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
