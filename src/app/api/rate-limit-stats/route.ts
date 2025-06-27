import { NextRequest, NextResponse } from "next/server";
import {
  checkoutRateLimiter,
  generalRateLimiter,
} from "@/lib/utils/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    // Basic security: only allow in development or with admin token
    const isDevelopment = process.env.NODE_ENV === "development";
    const adminToken = request.headers.get("x-admin-token");
    const isAuthorized =
      isDevelopment || adminToken === process.env.ADMIN_TOKEN;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checkoutStats = checkoutRateLimiter.getStats();
    const generalStats = generalRateLimiter.getStats();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      rateLimiters: {
        checkout: {
          ...checkoutStats,
          config: {
            maxRequests: 5,
            windowMs: 60000,
            skipSuccessfulRequests: true,
          },
        },
        general: {
          ...generalStats,
          config: {
            maxRequests: 100,
            windowMs: 60000,
            skipSuccessfulRequests: false,
          },
        },
      },
      system: {
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    });
  } catch (error) {
    console.error("Rate limit stats error:", error);
    return NextResponse.json(
      { error: "Failed to get rate limit stats" },
      { status: 500 },
    );
  }
}
