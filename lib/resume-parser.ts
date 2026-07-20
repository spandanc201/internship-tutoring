export interface ExtractedResumeData {
  skills: string[]
  priorInternships: Array<{
    company: string
    title: string
    duration: string
    skills: string[]
  }>
  projects: Array<{
    title: string
    description: string
    skills: string[]
    link?: string
  }>
  inferredGpa?: number
  inferredMajor?: string
}

// Display-name dictionary matched against résumé text. Kept as a superset of
// the TECH_SKILLS list used by the posting scrapers so extracted skills line
// up with posting requiredSkills during scoring.
const SKILL_DICTIONARY: Array<{ name: string; pattern: RegExp }> = [
  ['JavaScript', /\bjavascript\b/i],
  ['TypeScript', /\btypescript\b/i],
  ['Python', /\bpython\b/i],
  ['Java', /\bjava\b(?!script)/i],
  ['C++', /\bc\+\+/i],
  ['C#', /\bc#/i],
  ['C', /\bc\b(?=[,;)]|\s+programming)/],
  ['Go', /\b(?:golang|go)\b(?=[,;)]|\s*$|\s+programming)/im],
  ['Rust', /\brust\b/i],
  ['PHP', /\bphp\b/i],
  ['Ruby', /\bruby\b/i],
  ['Swift', /\bswift\b/i],
  ['Kotlin', /\bkotlin\b/i],
  ['SQL', /\bsql\b/i],
  ['R', /\bR\b(?=[,;)/]|\s*$)/m],
  ['MATLAB', /\bmatlab\b/i],
  ['Scala', /\bscala\b/i],
  ['React', /\breact(?:\.?js)?\b/i],
  ['Vue', /\bvue(?:\.?js)?\b/i],
  ['Angular', /\bangular\b/i],
  ['Next.js', /\bnext\.?js\b/i],
  ['Node.js', /\bnode(?:\.?js)?\b/i],
  ['Express', /\bexpress(?:\.?js)?\b/i],
  ['Django', /\bdjango\b/i],
  ['Flask', /\bflask\b/i],
  ['Spring', /\bspring\b/i],
  ['FastAPI', /\bfastapi\b/i],
  ['PostgreSQL', /\bpostgres(?:ql)?\b/i],
  ['MongoDB', /\bmongo(?:db)?\b/i],
  ['MySQL', /\bmysql\b/i],
  ['Redis', /\bredis\b/i],
  ['Docker', /\bdocker\b/i],
  ['Kubernetes', /\bkubernetes\b|\bk8s\b/i],
  ['AWS', /\baws\b|\bamazon web services\b/i],
  ['Azure', /\bazure\b/i],
  ['GCP', /\bgcp\b|\bgoogle cloud\b/i],
  ['Git', /\bgit\b(?!hub|lab)/i],
  ['Jenkins', /\bjenkins\b/i],
  ['CI/CD', /\bci\/cd\b/i],
  ['REST API', /\brest(?:ful)?\s*apis?\b/i],
  ['GraphQL', /\bgraphql\b/i],
  ['HTML', /\bhtml5?\b/i],
  ['CSS', /\bcss3?\b/i],
  ['Sass', /\bsass\b|\bscss\b/i],
  ['Tailwind', /\btailwind\b/i],
  ['Linux', /\blinux\b/i],
  ['Unix', /\bunix\b/i],
  ['Bash', /\bbash\b/i],
  ['Statistics', /\bstatistics\b|\bstatistical\b/i],
  ['Pandas', /\bpandas\b/i],
  ['NumPy', /\bnumpy\b/i],
  ['scikit-learn', /\bscikit[- ]?learn\b|\bsklearn\b/i],
  ['PyTorch', /\bpytorch\b/i],
  ['TensorFlow', /\btensorflow\b/i],
  ['Machine Learning', /\bmachine learning\b|\bml\b(?=[,;)]|\s*$)/im],
  ['Deep Learning', /\bdeep learning\b/i],
  ['NLP', /\bnlp\b|\bnatural language processing\b/i],
  ['Data Analysis', /\bdata analysis\b|\bdata analytics\b/i],
  ['Data Visualization', /\bdata visuali[sz]ation\b|\bdata viz\b/i],
  ['Tableau', /\btableau\b/i],
  ['Power BI', /\bpower ?bi\b/i],
  ['Excel', /\bexcel\b/i],
  ['PowerPoint', /\bpowerpoint\b/i],
  ['Figma', /\bfigma\b/i],
  ['Prototyping', /\bprototyp/i],
  ['UX Research', /\bux research\b|\buser research\b/i],
  ['Agile', /\bagile\b/i],
  ['Scrum', /\bscrum\b/i],
  ['Communication', /\bcommunication\b/i],
  ['Genomics', /\bgenomics?\b/i],
  ['CUDA', /\bcuda\b/i],
  ['Spark', /\bspark\b/i],
  ['Hadoop', /\bhadoop\b/i],
  ['Kafka', /\bkafka\b/i],
  ['Terraform', /\bterraform\b/i],
].map(([name, pattern]) => ({ name: name as string, pattern: pattern as RegExp }))

const SECTION_HEADINGS: Array<{ key: 'experience' | 'projects' | 'education' | 'skills' | 'other'; pattern: RegExp }> = [
  { key: 'experience', pattern: /^(?:work\s+)?(?:experience|internships?|employment(?:\s+history)?)\b/i },
  { key: 'projects', pattern: /^(?:personal\s+|technical\s+|selected\s+)?projects?\b/i },
  { key: 'education', pattern: /^education\b/i },
  { key: 'skills', pattern: /^(?:technical\s+)?skills\b/i },
  { key: 'other', pattern: /^(?:awards|activities|leadership|certifications|publications|interests|summary|objective)\b/i },
]

function extractSkills(text: string): string[] {
  return SKILL_DICTIONARY.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name)
}

function extractGpa(text: string): number | undefined {
  const match = text.match(/\bgpa\b[^0-9]{0,12}([0-4](?:\.\d{1,2})?)\s*(?:\/\s*4(?:\.0+)?)?/i)
  if (!match) return undefined
  const gpa = parseFloat(match[1])
  return gpa >= 0 && gpa <= 4 ? gpa : undefined
}

function extractMajor(text: string): string | undefined {
  const degreeMatch = text.match(
    /(?:b\.?\s?(?:s|a|sc|eng)\.?|bachelor(?:'s)?(?:\s+of\s+(?:science|arts|engineering))?|m\.?\s?s\.?|master(?:'s)?(?:\s+of\s+science)?|major(?:ing)?)\s*(?:degree\s*)?(?:in|:|,)?\s+([A-Z][A-Za-z&/ ]{2,50}?)(?=\s*(?:[,;|•\n(]|GPA|Minor|$))/m
  )
  if (degreeMatch) return degreeMatch[1].trim()

  const commonMajors = [
    'Computer Science', 'Software Engineering', 'Computer Engineering', 'Electrical Engineering',
    'Data Science', 'Information Systems', 'Mathematics', 'Statistics', 'Physics', 'Economics',
    'Business Administration', 'Finance', 'Mechanical Engineering', 'Biology', 'Chemistry',
  ]
  return commonMajors.find((major) => new RegExp(`\\b${major}\\b`, 'i').test(text))
}

/** Split résumé text into sections keyed by recognized headings. */
function splitSections(text: string): Record<string, string> {
  const lines = text.split(/\r?\n/)
  const sections: Record<string, string[]> = { preamble: [] }
  let current = 'preamble'
  for (const line of lines) {
    const trimmed = line.trim()
    const heading = trimmed.length <= 48 && SECTION_HEADINGS.find(({ pattern }) => pattern.test(trimmed))
    if (heading) {
      current = heading.key
      sections[current] = sections[current] || []
      continue
    }
    sections[current] = sections[current] || []
    sections[current].push(line)
  }
  return Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.join('\n')]))
}

/** Split a section body into entries on blank lines or new bullet/title lines. */
function splitEntries(body: string): string[][] {
  const entries: string[][] = []
  let current: string[] = []
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current.length) entries.push(current)
      current = []
      continue
    }
    // A non-indented, non-bullet line after content starts a new entry
    const isBullet = /^[-•*·◦▪]/.test(trimmed)
    if (current.length && !isBullet && !/^[a-z]/.test(trimmed) && trimmed.length <= 90) {
      entries.push(current)
      current = [trimmed]
    } else {
      current.push(trimmed)
    }
  }
  if (current.length) entries.push(current)
  // Blank lines between a title and its bullets split entries apart; a
  // bullet-led entry always belongs to the previous one.
  const merged: string[][] = []
  for (const entry of entries) {
    if (merged.length && /^[-•*·◦▪]/.test(entry[0])) {
      merged[merged.length - 1].push(...entry)
    } else {
      merged.push(entry)
    }
  }
  return merged.filter((e) => e.join(' ').trim().length > 0)
}

function extractInternships(experienceBody: string): ExtractedResumeData['priorInternships'] {
  return splitEntries(experienceBody)
    .map((entry) => {
      const header = entry[0]
      const body = entry.join('\n')
      // Header formats like "Software Intern — Acme Corp", "Acme Corp | Software Intern",
      // "Software Intern at Acme Corp (Jun–Aug 2025)"
      const atMatch = header.match(/(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[(,]|$)/i)
      const sepParts = header.split(/\s*[—–|]\s*|\s{2,}|\t+/).map((p) => p.trim()).filter(Boolean)
      let title = header.trim()
      let company = ''
      if (atMatch) {
        title = atMatch[1].trim()
        company = atMatch[2].trim()
      } else if (sepParts.length >= 2) {
        const titleIdx = sepParts.findIndex((p) => /intern|engineer|analyst|assistant|researcher|developer/i.test(p))
        title = sepParts[titleIdx >= 0 ? titleIdx : 0]
        company = sepParts.find((_, i) => i !== (titleIdx >= 0 ? titleIdx : 0)) || ''
      }
      const durationMatch = body.match(
        /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\s*[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|present)|\d+\s+months?)/i
      )
      return {
        company: company.replace(/\s*\(.*$/, '').trim(),
        title: title.replace(/\s*\(.*$/, '').trim(),
        duration: durationMatch ? durationMatch[1] : '',
        skills: extractSkills(body),
      }
    })
    .filter((e) => /intern|co-?op/i.test(`${e.title} ${e.company}`))
    .slice(0, 6)
}

function extractProjects(projectsBody: string): ExtractedResumeData['projects'] {
  return splitEntries(projectsBody)
    .map((entry) => {
      const title = entry[0].replace(/\s*[—–|].*$/, '').replace(/\s*\(.*$/, '').trim()
      const description = entry.slice(1).join(' ').replace(/^[-•*·◦▪]\s*/gm, '').trim() || entry.join(' ')
      const linkMatch = entry.join(' ').match(/https?:\/\/\S+/)
      return {
        title,
        description,
        skills: extractSkills(entry.join('\n')),
        ...(linkMatch ? { link: linkMatch[0] } : {}),
      }
    })
    .filter((p) => p.title.length > 2)
    .slice(0, 6)
}

/** Heuristic extraction from plain résumé text. Exported for tests. */
export function parseResumeText(text: string): ExtractedResumeData {
  if (!text || !text.trim()) {
    return { skills: [], priorInternships: [], projects: [] }
  }
  const sections = splitSections(text)
  const experienceBody = sections.experience || ''
  const projectsBody = sections.projects || ''
  return {
    skills: extractSkills(text),
    priorInternships: experienceBody ? extractInternships(experienceBody) : [],
    projects: projectsBody ? extractProjects(projectsBody) : [],
    inferredGpa: extractGpa(text),
    inferredMajor: extractMajor(sections.education || text),
  }
}

/** Extract plain text from a PDF or DOC/DOCX buffer. Returns '' on failure. */
export async function extractResumeText(fileBuffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase()
  try {
    if (lower.endsWith('.pdf')) {
      const { getDocumentProxy } = await import('unpdf')
      const pdf = await getDocumentProxy(new Uint8Array(fileBuffer))
      // Rebuild line structure from text item positions; plain extractText
      // merges everything into one line, which defeats section parsing.
      const pages: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const lines: string[] = []
        let line = ''
        let lastY: number | null = null
        for (const item of content.items as Array<{ str?: string; hasEOL?: boolean; transform?: number[] }>) {
          if (typeof item.str !== 'string') continue
          const y = item.transform?.[5]
          if (line && lastY !== null && y !== undefined && Math.abs(y - lastY) > 2) {
            lines.push(line)
            line = ''
          }
          line += line && item.str && !line.endsWith(' ') && !item.str.startsWith(' ') ? ` ${item.str}` : item.str
          if (y !== undefined) lastY = y
          if (item.hasEOL) {
            lines.push(line)
            line = ''
          }
        }
        if (line) lines.push(line)
        pages.push(lines.join('\n'))
      }
      return pages.join('\n')
    }
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      const mammoth = await import('mammoth')
      const { value } = await mammoth.extractRawText({ buffer: fileBuffer })
      return value
    }
  } catch (error) {
    console.error('Resume text extraction error:', error)
  }
  return ''
}

export async function parseResumeWithAPI(fileBuffer: Buffer, fileName: string): Promise<ExtractedResumeData> {
  // Optional external parser API takes precedence when configured
  if (process.env.RESUME_PARSER_API_URL) {
    const formData = new FormData()
    formData.append('file', new Blob([new Uint8Array(fileBuffer)]), fileName)

    try {
      const response = await fetch(process.env.RESUME_PARSER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESUME_PARSER_API_KEY}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Parser API failed')
      }

      const data = await response.json()
      return normalizeParserOutput(data)
    } catch (error) {
      console.error('Resume parsing error, falling back to local parser:', error)
    }
  }

  // Built-in parser: extract text from the document, then apply heuristics
  const text = await extractResumeText(fileBuffer, fileName)
  return parseResumeText(text)
}

function normalizeParserOutput(apiResponse: any): ExtractedResumeData {
  // Normalize API response to our format (varies by API)
  return {
    skills: apiResponse.skills || [],
    priorInternships: apiResponse.experiences || [],
    projects: apiResponse.projects || [],
    inferredGpa: apiResponse.gpa,
    inferredMajor: apiResponse.major,
  }
}
