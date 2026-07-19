import { GET, POST } from '@/app/api/calendar/route';
import { POST as generatePost } from '@/app/api/calendar/generate/route';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

describe('Calendar API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/calendar', () => {
    test('should return 401 if not authenticated', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    test('should return calendar events for authenticated user', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.prepCalendarEvent.count.mockResolvedValue(2);
      mockPrisma.prepCalendarEvent.findMany.mockResolvedValue([
        { id: 'e1', title: 'Study' },
        { id: 'e2', title: 'Practice' },
      ]);

      const req = {
        nextUrl: { searchParams: new URLSearchParams() },
      } as any;

      const response = await GET(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.events).toHaveLength(2);
    });

    test('should support pagination', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.prepCalendarEvent.count.mockResolvedValue(100);
      mockPrisma.prepCalendarEvent.findMany.mockResolvedValue([]);

      const searchParams = new URLSearchParams();
      searchParams.set('page', '2');
      searchParams.set('limit', '50');
      const req = {
        nextUrl: { searchParams },
      } as any;

      const response = await GET(req);
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
  });

  describe('POST /api/calendar (Create custom event)', () => {
    test('should return 401 if not authenticated', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    test('should create event with valid data', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.prepCalendarEvent.create.mockResolvedValue({
        id: 'e-new',
        title: 'Study React',
      });

      const req = {
        json: jest.fn().mockResolvedValue({
          title: 'Study React',
          dueDate: '2024-02-05',
          estimatedHours: 5,
        }),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(201);
    });

    test('should return 400 if title missing', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const req = {
        json: jest.fn().mockResolvedValue({
          dueDate: '2024-02-05',
          estimatedHours: 5,
        }),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    test('should return 400 if estimatedHours is invalid', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const req = {
        json: jest.fn().mockResolvedValue({
          title: 'Study',
          dueDate: '2024-02-05',
          estimatedHours: -1,
        }),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/calendar/generate', () => {
    test('should return 401 if not authenticated', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        json: jest.fn().mockResolvedValue({ applicationId: 'app-1' }),
      } as any;

      const response = await generatePost(req);
      expect(response.status).toBe(401);
    });

    test('should return 400 if applicationId missing', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const req = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await generatePost(req);
      expect(response.status).toBe(400);
    });

    test('should return 404 if application not found', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const req = {
        json: jest.fn().mockResolvedValue({ applicationId: 'nonexistent' }),
      } as any;

      const response = await generatePost(req);
      expect(response.status).toBe(404);
    });

    test('should return 403 if user does not own application', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.application.findUnique.mockResolvedValue({
        userId: 'different-user',
      });

      const req = {
        json: jest.fn().mockResolvedValue({ applicationId: 'app-1' }),
      } as any;

      const response = await generatePost(req);
      expect(response.status).toBe(403);
    });
  });
});
