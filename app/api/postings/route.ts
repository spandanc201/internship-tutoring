import { NextRequest, NextResponse } from 'next/server'
import { getPostings } from '@/lib/posting-queries'

// GET /api/postings - List job postings with filters
// No authentication required
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get('location') || undefined
    const company = searchParams.get('company') || undefined
    const skills = searchParams.get('skills') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Page and limit must be positive integers' },
        { status: 400 }
      )
    }

    // Validate limit is reasonable
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' },
        { status: 400 }
      )
    }

    // Get postings using helper function
    const result = await getPostings({
      location,
      company,
      skills,
      page,
      limit,
    })

    return NextResponse.json(
      {
        postings: result.postings,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        pages: Math.ceil(result.total / result.pageSize),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/postings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
