import { prisma } from '@/lib/db'
import { verifyToken, getTokenFromCookie } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const token = await getTokenFromCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { resumeId } = await req.json()

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume || resume.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    // Deactivate all other resumes for this user
    await prisma.resume.updateMany({
      where: { userId: payload.userId, id: { not: resumeId } },
      data: { isActive: false },
    })

    // Activate the selected resume
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: { isActive: true },
    })

    // Update student profile
    await prisma.studentProfile.update({
      where: { userId: payload.userId },
      data: { activeResumeId: resumeId },
    })

    return NextResponse.json({ resume: updatedResume })
  } catch (error) {
    console.error('Activate resume error:', error)
    return NextResponse.json(
      { error: 'Failed to activate resume' },
      { status: 500 }
    )
  }
}
