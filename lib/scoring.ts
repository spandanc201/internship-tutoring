import { ExtractedResumeData } from './resume-parser'

export interface ScoringResult {
  skillScore: number
  expScore: number
  projScore: number
  eduScore: number
  finalScore: number
  category: 'good_fit' | 'stretch' | 'long_shot'
  reason: string
}

/**
 * Calculate skill match score
 * Score = (skills_student_has / total_required_skills) * 100
 * If no required skills, score = 100
 */
function calculateSkillScore(studentSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) {
    return 100
  }

  const normalizedStudentSkills = studentSkills.map(s => s.toLowerCase().trim())
  const matchedSkills = requiredSkills.filter(req => {
    const reqLower = req.toLowerCase().trim()
    return normalizedStudentSkills.some(
      student => student.includes(reqLower) || reqLower.includes(student)
    )
  })

  return (matchedSkills.length / requiredSkills.length) * 100
}

/**
 * Extract years requirement from posting description
 * Looks for patterns like "X+ years", "X years of experience"
 */
function extractYearsRequirement(description: string): number {
  const yearsPatterns = [
    /(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/gi,
    /(\d+)\s*years?\s+(?:of\s+)?experience/gi,
    /experience\s+(?:of\s+)?(\d+)\s*\+?\s*years?/gi,
  ]

  for (const pattern of yearsPatterns) {
    const match = description.match(pattern)
    if (match) {
      const yearsMatch = match[0].match(/\d+/)
      if (yearsMatch) {
        return parseInt(yearsMatch[0], 10)
      }
    }
  }

  return 0
}

/**
 * Calculate experience score based on internship count vs requirement
 * Student experience is counted as roughly 1 year per internship
 */
function calculateExperienceScore(
  priorInternships: Array<{ company: string; title: string; duration: string; skills: string[] }>,
  requiredYears: number
): number {
  // Count internships as experience proxy
  const studentYears = priorInternships.length

  if (studentYears >= requiredYears) {
    return 100
  }

  if (requiredYears === 0) {
    return 100
  }

  // Partial credit for close matches
  if (studentYears === 0 && requiredYears === 1) {
    return 70
  }

  if (studentYears > 0 && requiredYears > 0) {
    // Calculate percentage of requirements met
    return Math.max(30, (studentYears / requiredYears) * 100)
  }

  return 30
}

/**
 * Calculate project alignment score
 * Checks if student's projects mention role keywords
 */
function calculateProjectScore(
  projects: Array<{ title: string; description: string; skills: string[] }>,
  requiredSkills: string[],
  description: string
): number {
  if (projects.length === 0) {
    return 0
  }

  // Extract role type from description (backend, frontend, ML, etc.)
  const roleKeywords = ['backend', 'frontend', 'full-stack', 'ml', 'machine learning', 'data', 'devops', 'cloud']
  const matchedKeywords = roleKeywords.filter(kw =>
    description.toLowerCase().includes(kw)
  )

  if (matchedKeywords.length === 0) {
    return 0
  }

  // Check if any project mentions role keywords or uses required skills
  let alignedProjects = 0
  for (const project of projects) {
    const projectText = `${project.title} ${project.description}`.toLowerCase()
    const projectSkills = project.skills.map(s => s.toLowerCase())

    const hasRoleKeyword = matchedKeywords.some(kw => projectText.includes(kw))
    const hasRequiredSkill = requiredSkills.some(req =>
      projectSkills.some(ps => ps.includes(req.toLowerCase()) || req.toLowerCase().includes(ps))
    )

    if (hasRoleKeyword || hasRequiredSkill) {
      alignedProjects++
    }
  }

  if (alignedProjects >= Math.ceil(projects.length / 2)) {
    return 100
  } else if (alignedProjects > 0) {
    return 50
  }

  return 0
}

/**
 * Calculate education score
 * Base: 50
 * Major match (CS for SDE role): +25
 * GPA >= 3.5: +15
 * GPA >= 3.0: +10
 * Max: 100
 */
function calculateEducationScore(
  inferredGpa: number | undefined,
  inferredMajor: string | undefined,
  description: string
): number {
  let score = 50

  // Check if major matches role type (CS/Engineering for SDE roles)
  const sdeKeywords = ['software engineer', 'sde', 'backend', 'frontend', 'full-stack', 'developer']
  const isSdeRole = sdeKeywords.some(kw => description.toLowerCase().includes(kw))

  if (isSdeRole && inferredMajor) {
    const csKeywords = ['computer science', 'cs', 'software engineering', 'engineering']
    const isCsMajor = csKeywords.some(kw => inferredMajor.toLowerCase().includes(kw))
    if (isCsMajor) {
      score += 25
    }
  }

  // GPA bonus
  if (inferredGpa) {
    if (inferredGpa >= 3.5) {
      score += 15
    } else if (inferredGpa >= 3.0) {
      score += 10
    }
  }

  return Math.min(score, 100)
}

/**
 * Generate user-friendly reason for the score
 */
function generateReason(
  category: 'good_fit' | 'stretch' | 'long_shot',
  studentSkills: string[],
  requiredSkills: string[],
  priorInternships: Array<{ company: string; title: string; duration: string; skills: string[] }>,
  requiredYears: number
): string {
  const matchedSkillCount = requiredSkills.filter(req => {
    const reqLower = req.toLowerCase().trim()
    return studentSkills.some(s => s.toLowerCase().includes(reqLower) || reqLower.includes(s.toLowerCase()))
  }).length

  if (category === 'good_fit') {
    return `You have ${matchedSkillCount}/${requiredSkills.length} required skills and solid experience for this role.`
  }

  if (category === 'stretch') {
    const experienceGap = requiredYears - priorInternships.length
    if (experienceGap > 0) {
      return `You're close on experience (${Math.max(0, priorInternships.length)}/${requiredYears} years) and have ${matchedSkillCount}/${requiredSkills.length} required skills.`
    }
    return `You have ${matchedSkillCount}/${requiredSkills.length} required skills. Consider deepening your expertise in ${requiredSkills.slice(0, 2).join(' and ')}.`
  }

  // long_shot
  const missingSkills = requiredSkills.slice(0, 2)
  return `Consider gaining more experience with ${missingSkills.join(' and ')} to strengthen your candidacy.`
}

/**
 * Score a student against an internship posting
 */
export function scoreStudentAgainstPosting(
  studentResumeData: ExtractedResumeData,
  posting: {
    description: string
    requiredSkills: string[]
  }
): ScoringResult {
  const studentSkills = studentResumeData.skills || []
  const priorInternships = studentResumeData.priorInternships || []
  const projects = studentResumeData.projects || []
  const inferredGpa = studentResumeData.inferredGpa
  const inferredMajor = studentResumeData.inferredMajor
  const requiredSkills = posting.requiredSkills || []
  const description = posting.description || ''

  // Calculate individual scores
  const skillScore = calculateSkillScore(studentSkills, requiredSkills)
  const requiredYears = extractYearsRequirement(description)
  const expScore = calculateExperienceScore(priorInternships, requiredYears)
  const projScore = calculateProjectScore(projects, requiredSkills, description)
  const eduScore = calculateEducationScore(inferredGpa, inferredMajor, description)

  // Calculate weighted final score
  const finalScore = (skillScore * 0.5) + (expScore * 0.2) + (projScore * 0.15) + (eduScore * 0.15)

  // Determine category
  let category: 'good_fit' | 'stretch' | 'long_shot'
  if (finalScore >= 75) {
    category = 'good_fit'
  } else if (finalScore >= 50) {
    category = 'stretch'
  } else {
    category = 'long_shot'
  }

  // Generate reason
  const reason = generateReason(
    category,
    studentSkills,
    requiredSkills,
    priorInternships,
    requiredYears
  )

  return {
    skillScore: Math.round(skillScore * 10) / 10,
    expScore: Math.round(expScore * 10) / 10,
    projScore: Math.round(projScore * 10) / 10,
    eduScore: Math.round(eduScore * 10) / 10,
    finalScore: Math.round(finalScore * 10) / 10,
    category,
    reason,
  }
}
