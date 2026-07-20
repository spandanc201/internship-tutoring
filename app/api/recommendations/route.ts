import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookie, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { scoreStudentAgainstPosting } from '@/lib/scoring'
import { ExtractedResumeData } from '@/lib/resume-parser'

interface RecommendationItem {
  id: string
  company: string
  roleTitle: string
  description: string
  requiredSkills: string[]
  location?: string
  salaryRange?: any
  duration?: string
  applicationDeadline?: Date
  originalLinks: string[]
  sourceBoards: string[]
  postedDate: Date
  score: number
  category: 'good_fit' | 'stretch' | 'long_shot'
  reason: string
}

// GET /api/recommendations - Get scored recommendations for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = await getTokenFromCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId

    // Get active resume for user
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        activeResume: true,
      },
    })

    if (!studentProfile || !studentProfile.activeResume) {
      return NextResponse.json(
        { error: 'No active resume found' },
        { status: 404 }
      )
    }

    const resumeData = studentProfile.activeResume.extractedData as unknown as ExtractedResumeData

    // Fetch all non-archived postings
    const postings = await prisma.internshipPosting.findMany({
      where: {
        isArchived: false,
      },
    })

    if (postings.length === 0) {
      return NextResponse.json({
        goodFit: [],
        stretch: [],
        longShot: [],
        summary: {
          total: 0,
          goodFitCount: 0,
          stretchCount: 0,
          longShotCount: 0,
        },
      })
    }

    // Score each posting
    const scoredPostings: RecommendationItem[] = postings.map((posting: typeof postings[0]) => {
      const scoreResult = scoreStudentAgainstPosting(resumeData, {
        description: posting.description,
        requiredSkills: posting.requiredSkills,
      })

      return {
        id: posting.id,
        company: posting.company,
        roleTitle: posting.roleTitle,
        description: posting.description,
        requiredSkills: posting.requiredSkills,
        location: posting.location || undefined,
        salaryRange: posting.salaryRange,
        duration: posting.duration || undefined,
        applicationDeadline: posting.applicationDeadline || undefined,
        originalLinks: posting.originalLinks,
        sourceBoards: posting.sourceBoards,
        postedDate: posting.postedDate,
        score: scoreResult.finalScore,
        category: scoreResult.category,
        reason: scoreResult.reason,
      }
    })

    // Categorize and sort by score descending
    const goodFit = scoredPostings
      .filter(p => p.category === 'good_fit')
      .sort((a, b) => b.score - a.score)

    const stretch = scoredPostings
      .filter(p => p.category === 'stretch')
      .sort((a, b) => b.score - a.score)

    const longShot = scoredPostings
      .filter(p => p.category === 'long_shot')
      .sort((a, b) => b.score - a.score)

    // Store scores in database for future reference
    try {
      // Upsert recommendation scores
      for (const posting of scoredPostings) {
        await prisma.recommendationScore.upsert({
          where: {
            userId_postingId: {
              userId,
              postingId: posting.id,
            },
          },
          update: {
            finalScore: posting.score,
            category: posting.category,
            reason: posting.reason,
            calculatedAt: new Date(),
          },
          create: {
            userId,
            postingId: posting.id,
            skillMatchScore: 0,
            experienceScore: 0,
            projectAlignmentScore: 0,
            educationScore: 0,
            finalScore: posting.score,
            category: posting.category,
            reason: posting.reason,
          },
        })
      }
    } catch (error) {
      // Log error but don't fail the response
      console.error('Error storing recommendation scores:', error)
    }

    return NextResponse.json(
      {
        goodFit,
        stretch,
        longShot,
        summary: {
          total: scoredPostings.length,
          goodFitCount: goodFit.length,
          stretchCount: stretch.length,
          longShotCount: longShot.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
