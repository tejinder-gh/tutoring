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

// =============================================================================
// USER PROFILE ACTIONS
// =============================================================================

import { auth } from '@/auth';

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: { select: { name: true } },
    },
  });

  return user;
}

export async function updateProfile(data: {
  name?: string;
  phone?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: { name?: string; phone?: string | null } = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone || null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

export type UpdateUserState = {
  success?: boolean;
  error?: string;
};

export async function updateUser(userId: string, formData: FormData): Promise<UpdateUserState> {
    try {
        await requirePermission('manage', 'user');

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const branchId = formData.get('branchId') as string;
        const isActive = formData.get('isActive') === 'on';

        const data: any = { name, email, isActive };
        if (phone) data.phone = phone;
        if (branchId && branchId !== 'none') {
            data.branchId = branchId;
        } else if (branchId === 'none') {
            data.branchId = null;
        }

        await prisma.user.update({
            where: { id: userId },
            data
        });

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}/edit`);
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { error: "Failed to update user" };
    }
}
