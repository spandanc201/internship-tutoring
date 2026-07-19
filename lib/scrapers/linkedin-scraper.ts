import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JobPosting {
  company: string;
  roleTitle: string;
  description: string;
  location?: string;
  salary?: string;
  deadline?: string;
  link: string;
  skills: string[];
  sourceBoard: string;
}

// Common tech skills for keyword extraction
const TECH_SKILLS = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c++',
  'c#',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'sql',
  'react',
  'vue',
  'angular',
  'node',
  'express',
  'django',
  'flask',
  'spring',
  'fastapi',
  'postgres',
  'mongodb',
  'mysql',
  'redis',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'git',
  'jenkins',
  'ci/cd',
  'rest api',
  'graphql',
  'html',
  'css',
  'sass',
  'webpack',
  'tailwind',
  'bootstrap',
  'jquery',
  'linux',
  'unix',
  'bash',
  'shell',
  'agile',
  'scrum',
  'jira',
  'api',
  'json',
  'xml',
  'microservices',
  'scalability',
  'performance',
];

export async function scrapeLinkedInInternships(
  query: string = 'internship'
): Promise<JobPosting[]> {
  try {
    // LinkedIn has rate limiting and requires special headers
    // For this implementation, we'll use a mock scraping approach
    // In production, you'd need either:
    // 1. LinkedIn API access
    // 2. Headless browser with Puppeteer
    // 3. Third-party job aggregation API

    console.log(`Scraping LinkedIn for: ${query}`);

    // Mock data for demonstration - in production replace with actual API call
    const mockPostings = [
      {
        company: 'TechCorp',
        roleTitle: 'Summer Software Engineering Internship',
        description: `We're looking for interns skilled in React, Node.js, and PostgreSQL.
          Experience with Docker and AWS is a plus. Work on real projects with mentorship.`,
        location: 'San Francisco, CA',
        salary: '$25-35/hour',
        deadline: '2026-08-31',
        link: 'https://linkedin.com/jobs/internship-techcorp-1',
      },
      {
        company: 'DataFlow Inc',
        roleTitle: 'Data Science Internship',
        description: `Seeking Python developers with experience in machine learning.
          Knowledge of TensorFlow, PyTorch, and SQL required. Work on data pipelines.`,
        location: 'New York, NY',
        salary: '$28-38/hour',
        deadline: '2026-09-15',
        link: 'https://linkedin.com/jobs/internship-dataflow-2',
      },
    ];

    return mockPostings.map((posting) => ({
      ...posting,
      skills: extractSkills(posting.description),
      sourceBoard: 'LinkedIn',
    }));
  } catch (error) {
    console.error('LinkedIn scraper error:', error);
    return [];
  }
}

function extractSkills(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  return TECH_SKILLS.filter((skill) => lowerDesc.includes(skill));
}
