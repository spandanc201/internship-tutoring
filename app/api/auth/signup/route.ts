import { prisma } from '@/lib/db'
import { generateToken, setAuthCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    })

    // Create student profile
    await prisma.studentProfile.create({
      data: { userId: user.id },
    })

    const token = generateToken({ userId: user.id, email: user.email })
    await setAuthCookie(token)

    return NextResponse.json(
      { user: { id: user.id, email: user.email }, token },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
