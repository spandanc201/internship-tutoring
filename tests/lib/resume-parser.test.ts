import { parseResumeText } from '@/lib/resume-parser';

const SAMPLE_RESUME = `Spandan Chandra
spandan@university.edu · (555) 123-4567 · github.com/spandan

EDUCATION
State University — B.S. in Computer Science, GPA: 3.7/4.0
Expected graduation May 2027

SKILLS
Python, SQL, Statistics, Pandas, R, Git, Tableau, Machine Learning

EXPERIENCE
Data Science Intern at Quantly Labs (Jun 2025 – Aug 2025)
- Built ETL pipelines in Python and SQL processing 2M rows daily
- Created Tableau dashboards for the growth team

Research Assistant — University Statistics Department
- Cleaned survey data with Pandas and R

PROJECTS
Momentum Backtester
- Backtested momentum trading strategies in Python with Pandas
- Visualized results with Tableau

Course Scheduler
- Full-stack scheduling app using React and Node.js with PostgreSQL
`;

describe('parseResumeText', () => {
  test('returns empty data for empty text', () => {
    expect(parseResumeText('')).toEqual({
      skills: [],
      priorInternships: [],
      projects: [],
    });
  });

  test('extracts skills from the whole document', () => {
    const data = parseResumeText(SAMPLE_RESUME);
    expect(data.skills).toEqual(
      expect.arrayContaining([
        'Python',
        'SQL',
        'Statistics',
        'Pandas',
        'R',
        'Git',
        'Tableau',
        'Machine Learning',
        'React',
        'Node.js',
        'PostgreSQL',
      ])
    );
  });

  test('extracts GPA and major', () => {
    const data = parseResumeText(SAMPLE_RESUME);
    expect(data.inferredGpa).toBe(3.7);
    expect(data.inferredMajor).toMatch(/computer science/i);
  });

  test('extracts internships from the experience section', () => {
    const data = parseResumeText(SAMPLE_RESUME);
    expect(data.priorInternships.length).toBeGreaterThanOrEqual(1);
    const internship = data.priorInternships[0];
    expect(internship.title).toMatch(/data science intern/i);
    expect(internship.company).toMatch(/quantly labs/i);
    expect(internship.skills).toEqual(expect.arrayContaining(['Python', 'SQL']));
  });

  test('extracts projects with their skills', () => {
    const data = parseResumeText(SAMPLE_RESUME);
    expect(data.projects.length).toBeGreaterThanOrEqual(2);
    const titles = data.projects.map((p) => p.title.toLowerCase());
    expect(titles.join(' ')).toContain('momentum backtester');
    const backtester = data.projects.find((p) => /momentum/i.test(p.title))!;
    expect(backtester.skills).toEqual(expect.arrayContaining(['Python', 'Pandas']));
  });

  test('does not hallucinate skills that are absent', () => {
    const data = parseResumeText('I enjoy hiking and photography.');
    expect(data.skills).toEqual([]);
    expect(data.inferredGpa).toBeUndefined();
  });
});
