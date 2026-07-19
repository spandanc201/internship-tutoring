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

// GET /api/calendar - List calendar events for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all' // interview, general, all
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Validate pagination
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Page and limit must be positive integers' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { userId }

    // Filter by type
    if (type !== 'all') {
      where.eventType = type
    }

    // Filter by date range if provided
    if (fromDate || toDate) {
      where.dueDate = {}
      if (fromDate) {
        where.dueDate.gte = new Date(fromDate)
      }
      if (toDate) {
        where.dueDate.lte = new Date(toDate)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.prepCalendarEvent.count({ where })

    // Fetch events sorted by dueDate
    const events = await prisma.prepCalendarEvent.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      take: limit,
      skip,
    })

    return NextResponse.json(
      {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/calendar error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/calendar - Create custom event or generate interview prep calendar
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      dueDate,
      estimatedHours,
      category,
      applicationId,
      type = 'custom',
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: 'Due date is required' },
        { status: 400 }
      )
    }

    if (typeof estimatedHours !== 'number' || estimatedHours <= 0) {
      return NextResponse.json(
        { error: 'Estimated hours must be a positive number' },
        { status: 400 }
      )
    }

    // Verify due date is valid
    const dueDateObj = new Date(dueDate)
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid due date' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.prepCalendarEvent.create({
      data: {
        userId,
        applicationId: applicationId || null,
        title,
        description: description || '',
        dueDate: dueDateObj,
        estimatedHours,
        eventType: type,
        source: 'student_created',
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('POST /api/calendar error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
