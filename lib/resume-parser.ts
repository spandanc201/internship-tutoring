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

export async function parseResumeWithAPI(fileBuffer: Buffer, fileName: string): Promise<ExtractedResumeData> {
  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(fileBuffer)]), fileName)

  try {
    const response = await fetch(process.env.RESUME_PARSER_API_URL || '', {
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
    console.error('Resume parsing error:', error)
    // Return empty data to trigger manual fallback
    return { skills: [], priorInternships: [], projects: [] }
  }
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
