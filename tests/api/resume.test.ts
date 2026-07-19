import { POST } from '@/app/api/resume/upload/route';
import { prisma } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

describe('Resume API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/resume/upload', () => {
    test('should return 401 if token is missing', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue(null);

      const req = {
        formData: jest.fn().mockResolvedValue(new Map()),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    test('should return 401 if token is invalid', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('invalid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue(null);

      const req = {
        formData: jest.fn().mockResolvedValue(new Map()),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    test('should return 400 if no file is provided', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const req = {
        formData: jest.fn().mockResolvedValue(new Map()),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('No file provided');
    });

    test('should return 400 if file type is invalid', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const formData = new Map();
      const mockFile = {
        type: 'text/plain',
        name: 'resume.txt',
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      };
      formData.set('file', mockFile);

      const req = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid file type');
    });

    test('should accept PDF files', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const mockPrisma = prisma as any;
      mockPrisma.resume.create.mockResolvedValue({
        id: 'resume-1',
      });
      mockPrisma.studentProfile.update.mockResolvedValue({});

      const formData = new Map();
      const mockFile = {
        type: 'application/pdf',
        name: 'resume.pdf',
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      };
      formData.set('file', mockFile);

      const req = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(201);
    });

    test('should return 500 on server error', async () => {
      const mockGetTokenFromCookie = getTokenFromCookie as jest.Mock;
      mockGetTokenFromCookie.mockResolvedValue('valid-token');

      const mockVerifyToken = verifyToken as jest.Mock;
      mockVerifyToken.mockReturnValue({ userId: 'test-user-id' });

      const formData = new Map();
      const mockFile = {
        type: 'application/pdf',
        name: 'resume.pdf',
        arrayBuffer: jest.fn().mockRejectedValue(new Error('Read failed')),
      };
      formData.set('file', mockFile);

      const req = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any;

      const response = await POST(req);
      expect(response.status).toBe(500);
    });
  });
});
