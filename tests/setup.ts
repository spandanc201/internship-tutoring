import '@testing-library/jest-dom';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    resume: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studentProfile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    internshipPosting: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recommendationScore: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    prepCalendarEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock auth module
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn((token: string) => {
    if (token === 'valid-token') {
      return { userId: 'test-user-id', email: 'test@example.com' };
    }
    return null;
  }),
  getTokenFromCookie: jest.fn(),
}));

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
};

export const mockResumeData = {
  name: 'John Doe',
  email: 'john@example.com',
  skills: ['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL'],
  priorInternships: [
    {
      company: 'StartupXYZ',
      title: 'Software Engineer Intern',
      duration: '3 months',
      skills: ['Python', 'Django'],
    },
  ],
  projects: [
    {
      title: 'E-commerce App',
      description: 'Full-stack application',
      skills: ['React', 'Node.js'],
    },
  ],
};

export const mockApplications = [
  {
    id: 'app-1',
    userId: 'test-user-id',
    company: 'Google',
    role: 'Backend Engineer',
    status: 'applied',
    appliedDate: new Date(),
  },
];

export function resetAllMocks() {
  jest.clearAllMocks();
}
