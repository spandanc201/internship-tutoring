import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromCookie, verifyToken } from '@/lib/auth'
import {
  createGeneralPrepCalendar,
  createCalendarEventsFromGenerated,
} from '@/lib/calendar-generator'

// Helper to verify auth and get userId
async function getAuthenticatedUserId(request: NextRequest) {
  const token = await getTokenFromCookie()
  if (!token) {
    return null
  }
  const payload = verifyToken(token)
  return payload?.userId || null
}

// POST /api/calendar/general - Create general 6-month prep calendar
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if general calendar already exists
    const existingGeneralEvents = await prisma.prepCalendarEvent.findMany({
      where: {
        userId,
        eventType: 'general',
        applicationId: null,
      },
    })

    // If general calendar already exists, return it
    if (existingGeneralEvents.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'General calendar already exists',
          eventsCreated: 0,
          events: existingGeneralEvents,
        },
        { status: 200 }
      )
    }

    // Generate prep tasks
    const generatedTasks = createGeneralPrepCalendar()

    // Create events in database
    const createdEvents = await createCalendarEventsFromGenerated(
      userId,
      null,
      generatedTasks,
      'general_prep'
    )

    return NextResponse.json(
      {
        success: true,
        eventsCreated: createdEvents.length,
        events: createdEvents,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/calendar/general error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
