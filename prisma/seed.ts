import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Sample internship postings for recommendations.
 * Covers a range of skill stacks so résumé matching produces Good Fit /
 * Stretch / Long Shot tiers rather than an empty Find Internships page.
 */
const SAMPLE_POSTINGS = [
  {
    company: 'Northwind Capital',
    roleTitle: 'Quantitative Research Intern',
    description:
      'The Quantitative Research team builds and tests systematic trading signals across equities and futures. As an intern you will prototype factor models in Python, run historical backtests, and present findings to portfolio managers. Strong grounding in statistics and comfort with large datasets expected; prior exposure to time-series analysis is a plus. 0 years of experience required.',
    requiredSkills: ['Python', 'Statistics', 'SQL', 'R', 'Pandas'],
    location: 'New York, NY',
    salaryRange: { min: 9000, max: 11000, unit: '/mo' },
    duration: '10 weeks',
    applicationDeadline: new Date('2026-08-08'),
    originalLinks: ['https://example.com/jobs/northwind-quant'],
    sourceBoards: ['LinkedIn'],
    postedDate: new Date('2026-07-11'),
  },
  {
    company: 'Helios Bio',
    roleTitle: 'Computational Biology Intern',
    description:
      'Join a wet-lab-adjacent computational team analysing single-cell sequencing data. You will build reproducible analysis pipelines, apply clustering and dimensionality-reduction methods, and help interpret results alongside biologists. Comfort in a Unix environment and with large numerical datasets is essential.',
    requiredSkills: ['Python', 'Genomics', 'Machine Learning', 'Linux'],
    location: 'Boston, MA',
    salaryRange: { min: 7500, max: 8500, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-08-01'),
    originalLinks: ['https://example.com/jobs/helios-compbio'],
    sourceBoards: ['LinkedIn'],
    postedDate: new Date('2026-07-09'),
  },
  {
    company: 'Meridian Design Co.',
    roleTitle: 'Product Design Intern',
    description:
      'Work with a small product team shipping a B2B analytics tool. You will move from wireframes to high-fidelity prototypes in Figma, run lightweight usability sessions, and hand off specs to engineers. We look for taste, curiosity, and an ability to defend design decisions with evidence.',
    requiredSkills: ['Figma', 'Prototyping', 'UX Research', 'HTML', 'CSS'],
    location: 'Remote',
    salaryRange: { min: 5000, max: 6000, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-07-30'),
    originalLinks: ['https://example.com/jobs/meridian-design'],
    sourceBoards: ['Glassdoor'],
    postedDate: new Date('2026-07-05'),
  },
  {
    company: 'Atlas Logistics',
    roleTitle: 'Data Analyst Intern',
    description:
      'The analytics group turns fleet and warehouse data into operational decisions. You will write SQL against a large warehouse, build Tableau dashboards for regional managers, and support ad-hoc forecasting requests. A pragmatic, detail-oriented approach matters more than exotic tooling.',
    requiredSkills: ['SQL', 'Excel', 'Tableau', 'Python'],
    location: 'Chicago, IL',
    salaryRange: { min: 5500, max: 6500, unit: '/mo' },
    duration: '10 weeks',
    applicationDeadline: new Date('2026-08-12'),
    originalLinks: ['https://example.com/jobs/atlas-analyst'],
    sourceBoards: ['Glassdoor'],
    postedDate: new Date('2026-07-12'),
  },
  {
    company: 'TechCorp',
    roleTitle: 'Summer Software Engineering Internship',
    description:
      "We're looking for interns skilled in React, Node.js, and PostgreSQL. Experience with Docker and AWS is a plus. Work on real projects with mentorship. You'll contribute to production systems as a software engineer on the backend and frontend teams.",
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    location: 'San Francisco, CA',
    salaryRange: { min: 8000, max: 10000, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-08-31'),
    originalLinks: ['https://example.com/jobs/techcorp-swe'],
    sourceBoards: ['LinkedIn'],
    postedDate: new Date('2026-07-01'),
  },
  {
    company: 'DataFlow Inc',
    roleTitle: 'Data Science Internship',
    description:
      'Seeking Python developers with experience in machine learning. Knowledge of TensorFlow, PyTorch, and SQL required. Work on data pipelines and models that ship to production.',
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL'],
    location: 'New York, NY',
    salaryRange: { min: 8500, max: 10500, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-09-15'),
    originalLinks: ['https://example.com/jobs/dataflow-ds'],
    sourceBoards: ['LinkedIn'],
    postedDate: new Date('2026-07-02'),
  },
  {
    company: 'CloudSystems',
    roleTitle: 'Backend Engineering Internship',
    description:
      "Join our backend team working with Go, Kubernetes, and microservices. You'll deploy code to production, participate in code reviews, and learn scalability patterns. Experience with AWS and CI/CD pipelines helpful. Seeking a software engineer intern with 1 year of experience preferred.",
    requiredSkills: ['Go', 'Kubernetes', 'AWS', 'Docker'],
    location: 'Seattle, WA',
    salaryRange: { min: 9000, max: 11000, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-08-20'),
    originalLinks: ['https://example.com/jobs/cloudsystems-be'],
    sourceBoards: ['Glassdoor'],
    postedDate: new Date('2026-06-28'),
  },
  {
    company: 'FinTech Solutions',
    roleTitle: 'Full Stack Web Developer Internship',
    description:
      "Build full-stack web applications using TypeScript, React, and Express. Work with REST APIs, PostgreSQL, and Docker. You'll contribute to production systems alongside experienced engineers. Knowledge of agile/scrum required.",
    requiredSkills: ['TypeScript', 'React', 'Express', 'PostgreSQL', 'Docker'],
    location: 'Austin, TX',
    salaryRange: { min: 7000, max: 9000, unit: '/mo' },
    duration: '10 weeks',
    applicationDeadline: new Date('2026-09-01'),
    originalLinks: ['https://example.com/jobs/fintech-fullstack'],
    sourceBoards: ['Glassdoor'],
    postedDate: new Date('2026-07-03'),
  },
  {
    company: 'Vireo Media',
    roleTitle: 'Editorial Data Intern',
    description:
      'A digital newsroom seeks an intern to support data-driven reporting. You will clean public datasets, build charts for stories, and work with reporters on interactive graphics. Curiosity about the news and clear written communication are as important as technical skill.',
    requiredSkills: ['SQL', 'Data Visualization', 'Communication', 'Excel'],
    location: 'Remote',
    salaryRange: { min: 3500, max: 4500, unit: '/mo' },
    duration: '10 weeks',
    applicationDeadline: new Date('2026-07-28'),
    originalLinks: ['https://example.com/jobs/vireo-editorial'],
    sourceBoards: ['LinkedIn'],
    postedDate: new Date('2026-07-03'),
  },
  {
    company: 'Aperture AI',
    roleTitle: 'ML Research Intern',
    description:
      'Contribute to research on efficient transformer training. You will run experiments, implement paper methods in PyTorch, and profile GPU workloads. Prior research experience and strong mathematical maturity are expected — ambitious applicants welcome. Looking for 2 years of experience with deep learning.',
    requiredSkills: ['PyTorch', 'Deep Learning', 'CUDA', 'Python'],
    location: 'Remote',
    salaryRange: { min: 8000, max: 10000, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-07-22'),
    originalLinks: ['https://example.com/jobs/aperture-ml'],
    sourceBoards: ['LinkedIn'],
    postedDate: new Date('2026-06-28'),
  },
  {
    company: 'Summit Consulting',
    roleTitle: 'Strategy Analyst Intern',
    description:
      'Support case teams solving growth and operations problems for mid-market clients. You will build financial models, structure analyses, and craft client-ready presentations. We value structured thinking and the poise to present to senior stakeholders.',
    requiredSkills: ['Excel', 'PowerPoint', 'Communication'],
    location: 'San Francisco, CA',
    salaryRange: { min: 7000, max: 8000, unit: '/mo' },
    duration: '10 weeks',
    applicationDeadline: new Date('2026-08-05'),
    originalLinks: ['https://example.com/jobs/summit-strategy'],
    sourceBoards: ['Glassdoor'],
    postedDate: new Date('2026-07-01'),
  },
  {
    company: 'MediaCore',
    roleTitle: 'Frontend Engineering Internship',
    description:
      'Create responsive web interfaces with React, Vue, or Angular. Work on performance optimization, CSS/SASS styling, and Webpack configuration. Experience with Bootstrap or Tailwind CSS preferred. Software engineer track.',
    requiredSkills: ['React', 'CSS', 'HTML', 'Tailwind', 'JavaScript'],
    location: 'Los Angeles, CA',
    salaryRange: { min: 6500, max: 8000, unit: '/mo' },
    duration: '12 weeks',
    applicationDeadline: new Date('2026-08-15'),
    originalLinks: ['https://example.com/jobs/mediacore-fe'],
    sourceBoards: ['Glassdoor'],
    postedDate: new Date('2026-06-25'),
  },
]

async function main() {
  let created = 0
  let skipped = 0

  for (const posting of SAMPLE_POSTINGS) {
    const existing = await prisma.internshipPosting.findFirst({
      where: {
        originalLinks: { hasSome: posting.originalLinks },
      },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.internshipPosting.create({
      data: {
        ...posting,
        salaryRange: posting.salaryRange as any,
        isArchived: false,
      },
    })
    created++
  }

  const total = await prisma.internshipPosting.count({ where: { isArchived: false } })
  console.log(`Seed complete: created ${created}, skipped ${skipped}, active postings now ${total}`)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
