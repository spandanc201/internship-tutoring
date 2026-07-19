import { prisma } from '@/lib/db'

interface PostingFilters {
  location?: string
  company?: string
  skills?: string | string[]
  page: number
  limit: number
}

export interface PostingResult {
  postings: Array<{
    id: string
    company: string
    roleTitle: string
    description: string
    requiredSkills: string[]
    location: string | null
    salary: any
    deadline: Date | null
    postedDate: Date
  }>
  total: number
  page: number
  pageSize: number
}

/**
 * Get paginated job postings with filters
 * @param filters - Object containing location, company, skills, page, and limit
 * @returns Object with postings array and pagination info
 */
export async function getPostings(
  filters: PostingFilters
): Promise<PostingResult> {
  const {
    location,
    company,
    skills,
    page = 1,
    limit = 20,
  } = filters

  // Validate pagination parameters
  if (page < 1 || limit < 1) {
    throw new Error('Page and limit must be positive integers')
  }

  // Build WHERE clause dynamically
  const where: any = {
    isArchived: false, // Exclude archived postings
  }

  // Add location filter
  if (location && location.trim()) {
    where.location = {
      contains: location.trim(),
      mode: 'insensitive',
    }
  }

  // Add company filter
  if (company && company.trim()) {
    where.company = {
      contains: company.trim(),
      mode: 'insensitive',
    }
  }

  // Add skills filter - match any skill provided
  if (skills) {
    const skillsArray = Array.isArray(skills)
      ? skills
      : skills.split(',').map((s: string) => s.trim())

    // Use OR condition to match any skill
    where.OR = skillsArray.map((skill: string) => ({
      requiredSkills: {
        has: skill,
      },
    }))
  }

  // Calculate pagination
  const skip = (page - 1) * limit

  // Get total count
  const total = await prisma.internshipPosting.count({ where })

  // Fetch postings sorted by recency (newest first)
  const postings = await prisma.internshipPosting.findMany({
    where,
    orderBy: {
      postedDate: 'desc',
    },
    take: limit,
    skip,
    select: {
      id: true,
      company: true,
      roleTitle: true,
      description: true,
      requiredSkills: true,
      location: true,
      salaryRange: true,
      applicationDeadline: true,
      postedDate: true,
    },
  })

  // Format response
  return {
    postings: postings.map((p: typeof postings[0]) => ({
      id: p.id,
      company: p.company,
      roleTitle: p.roleTitle,
      description: p.description,
      requiredSkills: p.requiredSkills,
      location: p.location,
      salary: p.salaryRange,
      deadline: p.applicationDeadline,
      postedDate: p.postedDate,
    })),
    total,
    page,
    pageSize: limit,
  }
}
