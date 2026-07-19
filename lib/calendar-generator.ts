import { prisma } from '@/lib/db'

export interface TemplateTask {
  title: string
  description?: string
  estimatedHours: number
  category: string
}

export interface GeneratedTask {
  title: string
  description: string
  dueDate: Date
  estimatedHours: number
  eventType: string
  category: string
}

export interface PrepCalendarEventInput {
  userId: string
  applicationId?: string | null
  title: string
  description: string
  dueDate: Date
  estimatedHours: number
  eventType: string
  source: string
}

// Role-specific templates
const BACKEND_TEMPLATE: TemplateTask[] = [
  {
    title: 'System Design Fundamentals',
    description: 'Learn database design, APIs, caching, and distributed systems concepts',
    estimatedHours: 8,
    category: 'system-design',
  },
  {
    title: 'LeetCode Medium Problems',
    description: 'Practice medium-level coding problems to strengthen algorithm skills',
    estimatedHours: 10,
    category: 'leetcode',
  },
  {
    title: 'Review OOPS Concepts',
    description: 'Deep dive into Object-Oriented Programming principles and design patterns',
    estimatedHours: 4,
    category: 'oops',
  },
  {
    title: 'Behavioral Interview Prep',
    description: 'Practice STAR method and prepare key stories about past experiences',
    estimatedHours: 3,
    category: 'behavioral',
  },
  {
    title: 'Mock Interview',
    description: 'Full simulation of technical interview with timing and feedback',
    estimatedHours: 2,
    category: 'mock',
  },
]

const FRONTEND_TEMPLATE: TemplateTask[] = [
  {
    title: 'CSS & Flexbox Mastery',
    description: 'Master CSS fundamentals, flexbox, grid, and responsive design',
    estimatedHours: 6,
    category: 'css',
  },
  {
    title: 'React Hooks & State Management',
    description: 'Deep dive into React hooks, context API, and state management patterns',
    estimatedHours: 8,
    category: 'react',
  },
  {
    title: 'JavaScript Advanced Topics',
    description: 'Cover closures, prototypes, async/await, and ES6+ features',
    estimatedHours: 6,
    category: 'javascript',
  },
  {
    title: 'LeetCode Medium (JS)',
    description: 'Practice medium-level coding problems using JavaScript',
    estimatedHours: 8,
    category: 'leetcode',
  },
  {
    title: 'Design System & Components',
    description: 'Learn component design patterns, accessibility, and reusability',
    estimatedHours: 4,
    category: 'design-system',
  },
  {
    title: 'Behavioral Interview Prep',
    description: 'Practice STAR method and prepare key stories about past experiences',
    estimatedHours: 3,
    category: 'behavioral',
  },
  {
    title: 'Mock Interview',
    description: 'Full simulation of technical interview with timing and feedback',
    estimatedHours: 2,
    category: 'mock',
  },
]

const ML_TEMPLATE: TemplateTask[] = [
  {
    title: 'Statistics Fundamentals',
    description: 'Review probability, statistical distributions, and hypothesis testing',
    estimatedHours: 8,
    category: 'statistics',
  },
  {
    title: 'Machine Learning Algorithms',
    description: 'Study supervised and unsupervised learning algorithms in depth',
    estimatedHours: 10,
    category: 'ml-algorithms',
  },
  {
    title: 'Coding Interviews',
    description: 'Practice coding problems with ML/data science applications',
    estimatedHours: 8,
    category: 'leetcode',
  },
  {
    title: 'Linear Algebra Refresher',
    description: 'Refresh linear algebra concepts crucial for ML: matrices, vectors, eigenvalues',
    estimatedHours: 6,
    category: 'linear-algebra',
  },
  {
    title: 'Recent ML Papers',
    description: 'Read and understand recent papers in your area of interest',
    estimatedHours: 4,
    category: 'research',
  },
  {
    title: 'Behavioral Interview Prep',
    description: 'Practice STAR method and prepare key stories about past experiences',
    estimatedHours: 3,
    category: 'behavioral',
  },
  {
    title: 'Mock Interview',
    description: 'Full simulation of technical interview with timing and feedback',
    estimatedHours: 2,
    category: 'mock',
  },
]

const GENERAL_TEMPLATE: TemplateTask[] = [
  {
    title: 'Resume Review',
    description: 'Update and polish your resume to highlight relevant skills and projects',
    estimatedHours: 2,
    category: 'resume',
  },
  {
    title: 'Company Research',
    description: 'Research the company culture, products, and engineering challenges',
    estimatedHours: 3,
    category: 'company-research',
  },
  {
    title: 'LeetCode Easy Problems',
    description: 'Practice easy-level coding problems to build confidence',
    estimatedHours: 6,
    category: 'leetcode',
  },
  {
    title: 'Technical Fundamentals',
    description: 'Review core data structures and fundamental algorithms',
    estimatedHours: 8,
    category: 'fundamentals',
  },
  {
    title: 'Behavioral Stories',
    description: 'Prepare and practice STAR method stories for common behavioral questions',
    estimatedHours: 3,
    category: 'behavioral',
  },
  {
    title: 'Mock Interview',
    description: 'Full simulation of interview with timing and feedback',
    estimatedHours: 2,
    category: 'mock',
  },
]

// General prep calendar monthly themes
const GENERAL_PREP_THEMES = [
  {
    month: 1,
    theme: 'Data Structures Review',
    hoursPerWeek: 4,
  },
  {
    month: 2,
    theme: 'Algorithm Challenges',
    hoursPerWeek: 4,
  },
  {
    month: 3,
    theme: 'System Design Basics',
    hoursPerWeek: 4,
  },
  {
    month: 4,
    theme: 'Competitive Programming',
    hoursPerWeek: 4,
  },
  {
    month: 5,
    theme: 'Practice Interviews',
    hoursPerWeek: 4,
  },
  {
    month: 6,
    theme: 'Industry News & Trends',
    hoursPerWeek: 2,
  },
]

/**
 * Get role template based on role type
 */
export function getTemplateForRole(roleType: string): TemplateTask[] {
  const normalized = roleType.toLowerCase().trim()

  if (normalized.includes('backend') || normalized.includes('back-end')) {
    return BACKEND_TEMPLATE
  }
  if (normalized.includes('frontend') || normalized.includes('front-end') || normalized.includes('react')) {
    return FRONTEND_TEMPLATE
  }
  if (normalized.includes('ml') || normalized.includes('machine') || normalized.includes('data science')) {
    return ML_TEMPLATE
  }
  return GENERAL_TEMPLATE
}

/**
 * Calculate weeks remaining until interview date
 */
function getWeeksRemaining(interviewDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const interview = new Date(interviewDate)
  interview.setHours(0, 0, 0, 0)

  const diffTime = interview.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
}

/**
 * Calculate days remaining until interview date
 */
function getDaysRemaining(interviewDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const interview = new Date(interviewDate)
  interview.setHours(0, 0, 0, 0)

  const diffTime = interview.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Distribute tasks evenly across remaining weeks
 */
function distributeTasks(
  tasks: TemplateTask[],
  weeksRemaining: number,
  daysRemaining: number
): GeneratedTask[] {
  const generatedTasks: GeneratedTask[] = []
  const today = new Date()

  // Handle edge case: <7 days remaining (intensive schedule)
  if (daysRemaining < 7) {
    const tasksPerDay = Math.max(1, Math.ceil(tasks.length / daysRemaining))
    let taskIndex = 0

    for (let day = 0; day < daysRemaining; day++) {
      const dueDate = new Date(today)
      dueDate.setDate(dueDate.getDate() + day)
      dueDate.setHours(23, 59, 59, 0)

      // Distribute current day's tasks
      for (let i = 0; i < tasksPerDay && taskIndex < tasks.length; i++) {
        const task = tasks[taskIndex]
        generatedTasks.push({
          title: task.title,
          description: task.description || '',
          dueDate,
          estimatedHours: task.estimatedHours / tasksPerDay,
          eventType: 'interview',
          category: task.category,
        })
        taskIndex++
      }
    }
    return generatedTasks
  }

  // Normal distribution across weeks
  const tasksPerWeek = Math.max(1, Math.ceil(tasks.length / weeksRemaining))
  let taskIndex = 0

  for (let week = 0; week < weeksRemaining; week++) {
    const weekStartDate = new Date(today)
    weekStartDate.setDate(weekStartDate.getDate() + week * 7)

    // End of week (Friday or end of remaining days)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)
    weekEndDate.setHours(23, 59, 59, 0)

    // Distribute tasks for this week
    for (let i = 0; i < tasksPerWeek && taskIndex < tasks.length; i++) {
      const task = tasks[taskIndex]

      // Spread tasks across the week
      const dayInWeek = i % 7
      const dueDate = new Date(weekStartDate)
      dueDate.setDate(dueDate.getDate() + dayInWeek)
      dueDate.setHours(23, 59, 59, 0)

      generatedTasks.push({
        title: task.title,
        description: task.description || '',
        dueDate,
        estimatedHours: task.estimatedHours,
        eventType: 'interview',
        category: task.category,
      })
      taskIndex++
    }
  }

  return generatedTasks
}

/**
 * Generate interview prep calendar
 */
export function generateInterviewPrepCalendar(
  interviewDate: Date,
  availableHoursPerWeek: number,
  roleType: string
): GeneratedTask[] {
  const template = getTemplateForRole(roleType)
  const weeksRemaining = getWeeksRemaining(interviewDate)
  const daysRemaining = getDaysRemaining(interviewDate)

  // If not enough time, use all template tasks compressed
  if (weeksRemaining <= 0) {
    // Interview is today or in the past - return empty
    return []
  }

  // Distribute template tasks across available time
  const distributedTasks = distributeTasks(template, weeksRemaining, daysRemaining)

  return distributedTasks
}

/**
 * Generate general 6-month prep calendar
 */
export function createGeneralPrepCalendar(): GeneratedTask[] {
  const generatedTasks: GeneratedTask[] = []
  const today = new Date()

  let taskId = 1
  for (const monthTheme of GENERAL_PREP_THEMES) {
    // Schedule relative to today so no task is due in the past
    const monthStart = new Date(today)
    monthStart.setMonth(monthStart.getMonth() + (monthTheme.month - 1))

    // Create 4 tasks for this month (weekly)
    for (let week = 0; week < 4; week++) {
      const weekDate = new Date(monthStart)
      weekDate.setDate(weekDate.getDate() + week * 7)
      weekDate.setHours(23, 59, 59, 0)

      generatedTasks.push({
        title: `${monthTheme.theme} - Week ${week + 1}`,
        description: `${monthTheme.theme} preparation. Recommended: ${monthTheme.hoursPerWeek} hours this week.`,
        dueDate: weekDate,
        estimatedHours: monthTheme.hoursPerWeek,
        eventType: 'general',
        category: monthTheme.theme.toLowerCase().replace(/ /g, '-'),
      })
      taskId++
    }
  }

  return generatedTasks
}

/**
 * Create calendar events in database from generated tasks
 */
export async function createCalendarEventsFromGenerated(
  userId: string,
  applicationId: string | null | undefined,
  generatedTasks: GeneratedTask[],
  source: string = 'system_generated'
): Promise<any[]> {
  const createdEvents = []

  for (const task of generatedTasks) {
    const event = await prisma.prepCalendarEvent.create({
      data: {
        userId,
        applicationId: applicationId || null,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        eventType: task.eventType,
        source,
        isCompleted: false,
      },
    })
    createdEvents.push(event)
  }

  return createdEvents
}

/**
 * Infer role type from job title or description
 */
export function inferRoleType(roleTitle: string, description?: string): string {
  const text = `${roleTitle} ${description || ''}`.toLowerCase()

  if (text.includes('backend') || text.includes('back-end') || text.includes('server') || text.includes('api')) {
    return 'backend'
  }
  if (
    text.includes('frontend') ||
    text.includes('front-end') ||
    text.includes('react') ||
    text.includes('ui') ||
    text.includes('ux')
  ) {
    return 'frontend'
  }
  if (
    text.includes('machine learning') ||
    text.includes('ml') ||
    text.includes('data science') ||
    text.includes('ai') ||
    text.includes('neural')
  ) {
    return 'ml'
  }

  return 'general'
}
