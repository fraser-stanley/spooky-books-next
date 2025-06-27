import { NextRequest, NextResponse } from "next/server";
import { reserveStock } from "@/lib/sanity/stock-operations";
import type { StockOperation } from "@/lib/sanity/stock-operations";

export async function POST(request: NextRequest) {
  try {
    const {
      operations,
      sessionId,
      expirationMinutes = 30,
    } = await request.json();

    // Validate request data
    if (!Array.isArray(operations) || !sessionId) {
      return NextResponse.json(
        {
          error:
            "Invalid request data. Expected operations array and sessionId.",
        },
        { status: 400 },
      );
    }

    // Validate each operation
    for (const operation of operations) {
      if (
        !operation.productId ||
        !operation.quantity ||
        operation.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error: "Each operation must have productId and positive quantity.",
          },
          { status: 400 },
        );
      }
    }

    // Reserve stock
    const result = await reserveStock(
      operations as StockOperation[],
      sessionId,
      expirationMinutes,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Stock reservation failed", details: result.errors },
        { status: 409 }, // Conflict - not enough stock
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stock reserved successfully",
      sessionId,
      expiresAt: new Date(
        Date.now() + expirationMinutes * 60 * 1000,
      ).toISOString(),
    });
  } catch (error) {
    console.error("Reserve stock API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
