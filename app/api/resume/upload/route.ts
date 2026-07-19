import { prisma } from '@/lib/db'
import { verifyToken, getTokenFromCookie } from '@/lib/auth'
import { parseResumeWithAPI } from '@/lib/resume-parser'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
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

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or DOC' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse resume
    const extractedData = await parseResumeWithAPI(buffer, file.name)

    // Save file to disk
    const resumeDir = join(process.cwd(), 'public', 'resumes', payload.userId)
    await mkdir(resumeDir, { recursive: true })
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(resumeDir, fileName)
    await writeFile(filePath, buffer)

    // Store in database
    const resume = await prisma.resume.create({
      data: {
        userId: payload.userId,
        filePath: `/resumes/${payload.userId}/${fileName}`,
        extractedData: extractedData as any,
        isActive: true,
      },
    })

    // Update student profile
    await prisma.studentProfile.update({
      where: { userId: payload.userId },
      data: { activeResumeId: resume.id },
    })

    return NextResponse.json({ resume, extractedData }, { status: 201 })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    )
  }
}
