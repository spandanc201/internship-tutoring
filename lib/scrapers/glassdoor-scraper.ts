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

export async function scrapeGlassdoorInternships(
  query: string = 'internship'
): Promise<JobPosting[]> {
  try {
    // Glassdoor has anti-scraping measures and requires special handling
    // For this implementation, we'll use a mock scraping approach
    // In production, you'd need:
    // 1. Glassdoor API access
    // 2. Headless browser solution
    // 3. Third-party aggregation service

    console.log(`Scraping Glassdoor for: ${query}`);

    // Mock data for demonstration - in production replace with actual API call
    const mockPostings = [
      {
        company: 'CloudSystems',
        roleTitle: 'Backend Engineering Internship',
        description: `Join our backend team working with Go, Kubernetes, and microservices.
          You'll deploy code to production, participate in code reviews, and learn scalability patterns.
          Experience with AWS and CI/CD pipelines helpful.`,
        location: 'Seattle, WA',
        salary: '$30-40/hour',
        deadline: '2026-08-20',
        link: 'https://glassdoor.com/jobs/internship-cloudsystems-1',
      },
      {
        company: 'FinTech Solutions',
        roleTitle: 'Full Stack Web Developer Internship',
        description: `Build full-stack web applications using TypeScript, React, and Express.
          Work with REST APIs, PostgreSQL, and Docker. You'll contribute to production systems
          alongside experienced engineers. Knowledge of agile/scrum required.`,
        location: 'Austin, TX',
        salary: '$24-34/hour',
        deadline: '2026-09-01',
        link: 'https://glassdoor.com/jobs/internship-fintech-2',
      },
      {
        company: 'MediaCore',
        roleTitle: 'Frontend Engineering Internship',
        description: `Create responsive web interfaces with React, Vue, or Angular.
          Work on performance optimization, CSS/SASS styling, and Webpack configuration.
          Experience with Bootstrap or Tailwind CSS preferred.`,
        location: 'Los Angeles, CA',
        salary: '$22-32/hour',
        deadline: '2026-08-15',
        link: 'https://glassdoor.com/jobs/internship-mediacore-3',
      },
    ];

    return mockPostings.map((posting: typeof mockPostings[0]) => ({
      ...posting,
      skills: extractSkills(posting.description),
      sourceBoard: 'Glassdoor',
    }));
  } catch (error) {
    console.error('Glassdoor scraper error:', error);
    return [];
  }
}

function extractSkills(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  return TECH_SKILLS.filter((skill) => lowerDesc.includes(skill));
}
