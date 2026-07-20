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

// GET /api/applications - List applications for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const sort = searchParams.get('sort') || 'date'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate page and limit
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Page and limit must be positive integers' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { userId }
    if (status) {
      where.status = status
    }

    // Determine sort order
    let orderBy: any = {}
    switch (sort) {
      case 'company':
        orderBy.company = 'asc'
        break
      case 'status':
        orderBy.status = 'asc'
        break
      case 'date':
      default:
        orderBy.appliedDate = 'desc'
        break
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.application.count({ where })

    // Fetch applications
    const applications = await prisma.application.findMany({
      where,
      orderBy,
      take: limit,
      skip,
    })

    return NextResponse.json(
      {
        applications,
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
    console.error('GET /api/applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { company, role, description, source, status, appliedDate, personalNotes } = body

    // Validate required fields
    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        company,
        role,
        description: description || null,
        source: source || 'manual',
        status: status || 'applied',
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        personalNotes: personalNotes || null,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('POST /api/applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
