'use server';

import { requirePermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export type CreateUserState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    role?: string[];
    password?: string[];
  };
};

export async function createUser(prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
  try {
    // 1. Check permissions
    await requirePermission('manage', 'user');

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const roleName = formData.get('role') as string;
    const password = (formData.get('password') as string) || 'Welcome123!';

    // 2. Validate input
    const fieldErrors: CreateUserState['fieldErrors'] = {};
    if (!name || name.trim().length < 2) fieldErrors.name = ['Name must be at least 2 characters'];
    if (!email || !/\S+@\S+\.\S+/.test(email)) fieldErrors.email = ['Invalid email address'];
    if (!roleName) fieldErrors.role = ['Role is required'];

    if (Object.keys(fieldErrors).length > 0) {
      return { error: 'Validation failed', fieldErrors };
    }

    // 3. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User with this email already exists' };
    }

    // 4. Find role
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return { error: `Role '${roleName}' not found` };
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user and profile
    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: role.id,
          isActive: true, // Auto-activate invited users
          isVerified: true, // Assume verified since admin invited? Or false? Let's say true for now to simplify login
        },
      });

      // Create specific profile based on role
      if (roleName === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (roleName === 'TEACHER') {
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            domain: 'General', // Default domain
          },
        });
      } else if (roleName === 'STAFF') {
        await tx.staffProfile.create({
          data: {
            userId: user.id,
            department: 'General', // Default department
            designation: 'Staff', // Default designation
          },
        });
      }
      // ADMIN/DIRECTOR might not need a specific profile or it's implicitly handled,
      // but User model has optional relations.
      // If we need an AdminProfile later we can add it.
      // For now, only STUDENT, TEACHER, STAFF have specific profiles in schema.
    });

    revalidatePath('/admin/users');
    return { success: true };

  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Failed to create user' };
  }
}
