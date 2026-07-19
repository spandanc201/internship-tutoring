import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromCookie, verifyToken } from '@/lib/auth'
import {
  generateInterviewPrepCalendar,
  createCalendarEventsFromGenerated,
  inferRoleType,
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

// POST /api/calendar/generate - Generate interview prep calendar
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, roleType: explicitRoleType } = body

    // Validate required fields
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Get application details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get interview date (use first interview date if multiple)
    const interviewDate = application.interviewDates?.[0]
    if (!interviewDate) {
      return NextResponse.json(
        { error: 'No interview date set for this application' },
        { status: 400 }
      )
    }

    // Infer or use provided role type
    let roleType = explicitRoleType
    if (!roleType) {
      roleType = inferRoleType(application.role, application.description || undefined)
    }

    // Get available hours per week (default 5 if not set)
    const availableHoursPerWeek = application.user.studentProfile?.availableHoursPerWeek || 5

    // Generate prep tasks
    const generatedTasks = generateInterviewPrepCalendar(
      interviewDate,
      availableHoursPerWeek,
      roleType
    )

    if (generatedTasks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interview is too soon (less than today) to generate prep calendar',
          eventsCreated: 0,
          events: [],
        },
        { status: 400 }
      )
    }

    // Delete existing events for this application to avoid duplicates
    await prisma.prepCalendarEvent.deleteMany({
      where: {
        applicationId: applicationId,
        source: 'system_generated',
      },
    })

    // Create events in database
    const createdEvents = await createCalendarEventsFromGenerated(
      userId,
      applicationId,
      generatedTasks,
      'system_generated'
    )

    return NextResponse.json(
      {
        success: true,
        eventsCreated: createdEvents.length,
        roleType,
        interviewDate,
        events: createdEvents,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/calendar/generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
