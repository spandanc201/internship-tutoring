import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromCookie, verifyToken } from '@/lib/auth'

// Helper to verify auth and get userId
async function getAuthenticatedUserId(request: NextRequest) {
  const token = await getTokenFromCookie()
  if (!token) {
    return null
  }
  const payload = verifyToken(token)
  return payload?.userId || null
}

// GET /api/calendar/:id - Get single calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch event
    const event = await prisma.prepCalendarEvent.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (event.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 404 } // Return 404 to avoid leaking info
      )
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('GET /api/calendar/:id error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/calendar/:id - Update calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Fetch event first to verify ownership
    const event = await prisma.prepCalendarEvent.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (event.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 404 } // Return 404 to avoid leaking info
      )
    }

    // Extract updateable fields
    const {
      title,
      description,
      dueDate,
      estimatedHours,
      isCompleted,
      eventType,
      category,
      isSnoozed,
      snoozeUntil,
    } = body

    // Build update data (only include provided fields)
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
    if (estimatedHours !== undefined) {
      if (estimatedHours <= 0) {
        return NextResponse.json(
          { error: 'Estimated hours must be positive' },
          { status: 400 }
        )
      }
      updateData.estimatedHours = estimatedHours
    }
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted
    if (eventType !== undefined) updateData.eventType = eventType
    if (isSnoozed !== undefined) updateData.isSnoozed = isSnoozed
    if (snoozeUntil !== undefined) updateData.snoozeUntil = snoozeUntil ? new Date(snoozeUntil) : null

    // Update event
    const updatedEvent = await prisma.prepCalendarEvent.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedEvent, { status: 200 })
  } catch (error) {
    console.error('PUT /api/calendar/:id error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/calendar/:id - Delete calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch event first to verify ownership
    const event = await prisma.prepCalendarEvent.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (event.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 404 } // Return 404 to avoid leaking info
      )
    }

    // Delete event
    await prisma.prepCalendarEvent.delete({
      where: { id },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/calendar/:id error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
