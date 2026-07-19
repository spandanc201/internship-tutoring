import { scoreStudentAgainstPosting } from '@/lib/scoring';

describe('Scoring Algorithm', () => {
  const mockPosting = {
    description: 'Backend Engineer position. Requires 2+ years of experience.',
    requiredSkills: ['Java', 'System Design', 'PostgreSQL', 'Docker'],
  };

  test('should calculate skill score correctly with full matches', () => {
    const resume = {
      skills: ['Java', 'System Design', 'PostgreSQL', 'Docker'],
      priorInternships: [],
      projects: [],
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.skillScore).toBe(100);
  });

  test('should calculate skill score with partial matches', () => {
    const resume = {
      skills: ['Java', 'PostgreSQL'],
      priorInternships: [],
      projects: [],
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.skillScore).toBe(50);
  });

  test('should return 0 for no skill matches', () => {
    const resume = {
      skills: ['Ruby', 'MongoDB'],
      priorInternships: [],
      projects: [],
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.skillScore).toBe(0);
  });

  test('should classify good_fit for score >= 75', () => {
    const resume = {
      skills: ['Java', 'System Design', 'PostgreSQL', 'Docker'],
      priorInternships: [
        { company: 'C1', title: 'Intern', duration: '3m', skills: [] },
        { company: 'C2', title: 'Intern', duration: '3m', skills: [] },
      ],
      projects: [{ title: 'P1', description: 'Backend', skills: ['Java'] }],
      inferredMajor: 'Computer Science',
      inferredGpa: 3.5,
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.finalScore).toBeGreaterThanOrEqual(75);
    expect(result.category).toBe('good_fit');
  });

  test('should classify stretch for score 50-74', () => {
    const resume = {
      skills: ['Java', 'PostgreSQL'],
      priorInternships: [{ company: 'C1', title: 'Intern', duration: '3m', skills: [] }],
      projects: [],
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.finalScore).toBeGreaterThanOrEqual(50);
    expect(result.finalScore).toBeLessThan(75);
    expect(result.category).toBe('stretch');
  });

  test('should classify long_shot for score < 50', () => {
    const resume = {
      skills: ['Ruby'],
      priorInternships: [],
      projects: [],
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.finalScore).toBeLessThan(50);
    expect(result.category).toBe('long_shot');
  });

  test('should handle null/undefined fields gracefully', () => {
    const resume = {
      skills: undefined,
      priorInternships: undefined,
      projects: undefined,
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.finalScore).toBeGreaterThanOrEqual(0);
    expect(result.finalScore).toBeLessThanOrEqual(100);
  });

  test('should keep scores in 0-100 range', () => {
    const resume = {
      skills: ['Java', 'System Design', 'PostgreSQL', 'Docker'],
      priorInternships: [
        { company: 'C1', title: 'Intern', duration: '3m', skills: [] },
        { company: 'C2', title: 'Intern', duration: '3m', skills: [] },
      ],
      projects: [{ title: 'P1', description: 'Backend', skills: ['Java'] }],
      inferredMajor: 'Computer Science',
      inferredGpa: 4.0,
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result.finalScore).toBeGreaterThanOrEqual(0);
    expect(result.finalScore).toBeLessThanOrEqual(100);
  });

  test('should have all required result fields', () => {
    const resume = {
      skills: ['Java'],
      priorInternships: [],
      projects: [],
    };

    const result = scoreStudentAgainstPosting(resume as any, mockPosting);
    expect(result).toHaveProperty('skillScore');
    expect(result).toHaveProperty('expScore');
    expect(result).toHaveProperty('projScore');
    expect(result).toHaveProperty('eduScore');
    expect(result).toHaveProperty('finalScore');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('reason');
  });
});
