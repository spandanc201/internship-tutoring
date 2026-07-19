import { prisma } from '@/lib/db'
import { verifyToken, getTokenFromCookie } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = await getTokenFromCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: payload.userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filePath: true,
        uploadedAt: true,
        isActive: true,
        extractedData: true,
      },
    })

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error('Fetch resume versions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume versions' },
      { status: 500 }
    )
  }
}
