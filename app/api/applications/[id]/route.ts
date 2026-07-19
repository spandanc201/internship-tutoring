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

// GET /api/applications/:id - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Fetch application
    const application = await prisma.application.findUnique({
      where: { id },
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
        { status: 404 } // Return 404 to avoid leaking info
      )
    }

    return NextResponse.json(application, { status: 200 })
  } catch (error) {
    console.error('GET /api/applications/:id error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/applications/:id - Update application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Fetch application first to verify ownership
    const application = await prisma.application.findUnique({
      where: { id },
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
        { status: 404 } // Return 404 to avoid leaking info
      )
    }

    // Extract updateable fields
    const {
      status,
      interviewDates,
      interviewNotes,
      offerDetails,
      personalNotes,
    } = body

    // Build update data (only include provided fields)
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (interviewDates !== undefined) updateData.interviewDates = interviewDates
    if (interviewNotes !== undefined) updateData.interviewNotes = interviewNotes
    if (offerDetails !== undefined) updateData.offerDetails = offerDetails
    if (personalNotes !== undefined) updateData.personalNotes = personalNotes

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedApplication, { status: 200 })
  } catch (error) {
    console.error('PUT /api/applications/:id error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/:id - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Fetch application first to verify ownership
    const application = await prisma.application.findUnique({
      where: { id },
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
        { status: 404 } // Return 404 to avoid leaking info
      )
    }

    // Delete application
    await prisma.application.delete({
      where: { id },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/applications/:id error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
