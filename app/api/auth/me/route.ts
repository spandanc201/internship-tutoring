import { prisma } from '@/lib/db'
import { getTokenFromCookie, verifyToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET /api/auth/me - Current user + profile summary
export async function GET() {
  try {
    const token = await getTokenFromCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: { interests: true, customInterests: true },
    })

    return NextResponse.json({
      user,
      profile: profile
        ? { interests: [...profile.interests, ...profile.customInterests] }
        : { interests: [] },
    })
  } catch (error) {
    console.error('GET /api/auth/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
