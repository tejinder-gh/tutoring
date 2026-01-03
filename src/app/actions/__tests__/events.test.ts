/**
 * @jest-environment node
 */
import { auth } from '@/auth';
import { db } from "@/lib/db";
import { createEvent, getBatchesForTeacher } from '../events';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      create: jest.fn(),
    },
    teacherProfile: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/permissions', () => ({
  requirePermission: jest.fn().mockResolvedValue({ id: 'user-1', role: { name: 'TEACHER' } }),
}));

describe('Events Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    const mockEventData: any = {
      title: 'Test Event',
      startTime: '2025-01-01T10:00:00Z',
      endTime: '2025-01-01T11:00:00Z',
      type: 'CLASS',
      batchId: 'batch-1',
    };

    test('should throw error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(createEvent(mockEventData)).rejects.toThrow('Unauthorized');
    });

    test('should create event successfully if authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (db.event.create as jest.Mock).mockResolvedValue({ id: 'event-1', ...mockEventData });

      const result = await createEvent(mockEventData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(db.event.create).toHaveBeenCalledWith({
        data: {
          ...mockEventData,
          startTime: new Date(mockEventData.startTime),
          endTime: new Date(mockEventData.endTime),
        },
      });
    });

    test('should throw error on database failure', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (db.event.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(createEvent(mockEventData)).rejects.toThrow('Failed to create event');
    });
  });

  describe('getBatchesForTeacher', () => {
    test('should return empty array if not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      const result = await getBatchesForTeacher();
      expect(result).toEqual([]);
    });

    test('should return empty array if no teacher profile found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      (db.teacherProfile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getBatchesForTeacher();
      expect(result).toEqual([]);
    });

    test('should return flattened batches', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
      const mockTeacherProfile = {
        courses: [
          {
            title: 'Course 1',
            batches: [
              { id: 'b1', name: 'Batch 1' },
              { id: 'b2', name: 'Batch 2' },
            ],
          },
          {
            title: 'Course 2',
            batches: [],
          },
        ],
      };
      (db.teacherProfile.findUnique as jest.Mock).mockResolvedValue(mockTeacherProfile);

      const result = await getBatchesForTeacher();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'b1', name: 'Batch 1', courseName: 'Course 1' });
      expect(result[1]).toEqual({ id: 'b2', name: 'Batch 2', courseName: 'Course 1' });
    });
  });
});
