/**
 * @jest-environment node
 */
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createAnnouncement, createQuery } from '../communication';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    query: { create: jest.fn() },
    announcement: { create: jest.fn() },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Communication Actions Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createQuery', () => {
        test('should create query if authorized', async () => {
            (auth as jest.Mock).mockResolvedValue({ user: { id: 'student-1' } });

            const formData = new FormData();
            formData.append('subject', 'Help');
            formData.append('message', 'Need help');

            await createQuery(formData);

            expect(prisma.query.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ subject: 'Help', studentId: 'student-1' })
            }));
        });

        test('should throw if unauthorized', async () => {
            (auth as jest.Mock).mockResolvedValue(null);
            const formData = new FormData();
            await expect(createQuery(formData)).rejects.toThrow('Unauthorized');
        });
    });

    describe('createAnnouncement', () => {
        test('should create announcement if authorized', async () => {
            (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin-1' } });

            const formData = new FormData();
            formData.append('title', 'Notice');
            formData.append('content', 'Content');

            await createAnnouncement(formData);

            expect(prisma.announcement.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ title: 'Notice', authorId: 'admin-1' })
            }));
        });
    });
});
