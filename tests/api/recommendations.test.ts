import { GET } from '@/app/api/recommendations/route';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

describe('Recommendations API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/recommendations', () => {
    test('should return 401 if not authenticated', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    test('should return 404 if no active resume found', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.studentProfile.findUnique.mockResolvedValue({
        activeResume: null,
      });

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(404);
    });

    test('should return empty recommendations if no postings', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.studentProfile.findUnique.mockResolvedValue({
        activeResume: { extractedData: {} },
      });
      mockPrisma.internshipPosting.findMany.mockResolvedValue([]);

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      const data = await response.json();
      expect(data.goodFit).toEqual([]);
      expect(data.stretch).toEqual([]);
      expect(data.longShot).toEqual([]);
    });

    test('should categorize recommendations', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.studentProfile.findUnique.mockResolvedValue({
        activeResume: { extractedData: {} },
      });
      mockPrisma.internshipPosting.findMany.mockResolvedValue([
        { id: 'p1', description: 'Backend role', requiredSkills: [] },
      ]);
      mockPrisma.recommendationScore.upsert.mockResolvedValue({});

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('goodFit');
      expect(data).toHaveProperty('stretch');
      expect(data).toHaveProperty('longShot');
    });

    test('should return 500 on error', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.studentProfile.findUnique.mockRejectedValue(new Error('DB error'));

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(500);
    });
  });
});
