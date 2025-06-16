import { NextRequest, NextResponse } from 'next/server'
import { releaseStock } from '@/lib/sanity/stock-operations'
import type { StockOperation } from '@/lib/sanity/stock-operations'

export async function POST(request: NextRequest) {
  try {
    const { operations, sessionId } = await request.json()

    // Validate request data
    if (!Array.isArray(operations)) {
      return NextResponse.json(
        { error: 'Invalid request data. Expected operations array.' },
        { status: 400 }
      )
    }

    // Validate each operation
    for (const operation of operations) {
      if (!operation.productId || !operation.quantity || operation.quantity <= 0) {
        return NextResponse.json(
          { error: 'Each operation must have productId and positive quantity.' },
          { status: 400 }
        )
      }
    }

    // Release stock
    const result = await releaseStock(operations as StockOperation[])

    if (!result.success) {
      return NextResponse.json(
        { error: 'Stock release failed', details: result.errors },
        { status: 500 }
      )
    }

    // Clean up reservation document if sessionId provided
    if (sessionId) {
      try {
        const { sanityClient } = await import('@/lib/sanity/client')
        const reservations = await sanityClient.fetch(
          `*[_type == "stockReservation" && sessionId == $sessionId]`,
          { sessionId }
        )
        
        for (const reservation of reservations) {
          await sanityClient.delete(reservation._id)
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup reservation document:', cleanupError)
        // Don't fail the entire operation for cleanup errors
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Stock released successfully',
      sessionId
    })

  } catch (error) {
    console.error('Release stock API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}