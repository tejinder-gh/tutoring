import { db } from "@/lib/db";
import { requirePermission } from '@/lib/permissions';
import bcrypt from 'bcryptjs';
import { createUser } from '../user';

// Mock dependencies
// Mock dependencies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  studentProfile: {
    create: jest.fn(),
  },
  teacherProfile: {
    create: jest.fn(),
  },
  staffProfile: {
    create: jest.fn(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: jest.fn((callback: any) => callback(mockPrisma)),
};

jest.mock('@/lib/db', () => ({
  db: mockPrisma,
}));

jest.mock('@/lib/permissions', () => ({
  requirePermission: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('User Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        const mockFormData = new FormData();
        mockFormData.append('name', 'Test User');
        mockFormData.append('email', 'test@example.com');
        mockFormData.append('role', 'STUDENT');

        it('should require specific permissions', async () => {
             (requirePermission as jest.Mock).mockResolvedValue(true);
             (db.user.findUnique as jest.Mock).mockResolvedValue(null);
             (db.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-1', name: 'STUDENT' });
             (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
             (db.user.create as jest.Mock).mockResolvedValue({ id: 'user-1' });

             await createUser({}, mockFormData);

             expect(requirePermission).toHaveBeenCalledWith('manage', 'user');
        });

        it('should fail if user already exists', async () => {
            (requirePermission as jest.Mock).mockResolvedValue(true);
            (db.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

            const result = await createUser({}, mockFormData);

            expect(result).toEqual({ error: 'User with this email already exists' });
        });

        it('should fail if role not found', async () => {
            (requirePermission as jest.Mock).mockResolvedValue(true);
            (db.user.findUnique as jest.Mock).mockResolvedValue(null);
            (db.role.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await createUser({}, mockFormData);

            expect(result).toEqual({ error: "Role 'STUDENT' not found" });
        });

        it('should create user and student profile successfully', async () => {
             (requirePermission as jest.Mock).mockResolvedValue(true);
             (db.user.findUnique as jest.Mock).mockResolvedValue(null);
             (db.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-1', name: 'STUDENT' });
             (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
             (db.user.create as jest.Mock).mockResolvedValue({ id: 'user-1' });

             const result = await createUser({}, mockFormData);

             expect(result).toEqual({ success: true });
             // Verify user creation
             expect(db.user.create).toHaveBeenCalledWith(expect.objectContaining({
                 data: expect.objectContaining({
                     name: 'Test User',
                     email: 'test@example.com',
                     roleId: 'role-1'
                 })
             }));
             // Verify student profile creation
             expect(db.studentProfile.create).toHaveBeenCalledWith({
                 data: { userId: 'user-1' }
             });
        });

        it('should create teacher profile if role is TEACHER', async () => {
             const teacherData = new FormData();
             teacherData.append('name', 'Teacher User');
             teacherData.append('email', 'teacher@example.com');
             teacherData.append('role', 'TEACHER');

             (requirePermission as jest.Mock).mockResolvedValue(true);
             (db.user.findUnique as jest.Mock).mockResolvedValue(null);
             (db.role.findUnique as jest.Mock).mockResolvedValue({ id: 'role-2', name: 'TEACHER' });
             (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
             (db.user.create as jest.Mock).mockResolvedValue({ id: 'user-2' });

             const result = await createUser({}, teacherData);

             expect(result).toEqual({ success: true });
             expect(db.teacherProfile.create).toHaveBeenCalledWith(expect.objectContaining({
                 data: expect.objectContaining({
                     userId: 'user-2',
                     domain: 'General'
                 })
             }));
        });
    });
});
