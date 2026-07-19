import { GET, POST } from '@/app/api/applications/route';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

describe('Applications API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/applications', () => {
    test('should return 401 if not authenticated', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    test('should return applications for authenticated user', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.count.mockResolvedValue(2);
      mockPrisma.application.findMany.mockResolvedValue([
        { id: 'app-1', company: 'Google', role: 'Backend' },
        { id: 'app-2', company: 'Meta', role: 'Frontend' },
      ]);

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.applications).toHaveLength(2);
    });

    test('should support pagination', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.count.mockResolvedValue(100);
      mockPrisma.application.findMany.mockResolvedValue([]);

      const searchParams = new URLSearchParams();
      searchParams.set('page', '2');
      searchParams.set('limit', '10');
      const req = {
        nextUrl: { searchParams },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.page).toBe(2);
    });

    test('should return 400 for invalid pagination', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const searchParams = new URLSearchParams();
      searchParams.set('page', '-1');
      const req = {
        nextUrl: { searchParams },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(400);
    });

    test('should return 500 on server error', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.count.mockRejectedValue(new Error('DB error'));

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/applications', () => {
    test('should return 401 if not authenticated', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    test('should create application with valid data', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.create.mockResolvedValue({
        id: 'app-new',
        company: 'Google',
        role: 'Backend',
        status: 'applied',
      });

      const req = {
        json: jest.fn().mockResolvedValue({
          company: 'Google',
          role: 'Backend Engineer',
        }),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(201);
    });

    test('should return 400 if required fields missing', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const req = {
        json: jest.fn().mockResolvedValue({ role: 'Backend' }),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    test('should set default status to "applied"', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.create.mockResolvedValue({
        status: 'applied',
      });

      const req = {
        json: jest.fn().mockResolvedValue({
          company: 'Google',
          role: 'Backend',
        }),
      } as any;

      const response = await POST(req);
      expect(mockPrisma.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'applied' }),
        })
      );
    });

    test('should return 500 on server error', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.create.mockRejectedValue(new Error('DB error'));

      const req = {
        json: jest.fn().mockResolvedValue({
          company: 'Google',
          role: 'Backend',
        }),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(500);
    });
  });
});
