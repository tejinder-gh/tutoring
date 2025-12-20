import { Permission, Role, User } from '@prisma/client';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage';

export type PermissionSubject =
  | 'all'
  | 'user'
  | 'course'
  | 'batch'
  | 'enrollment'
  | 'finance'
  | 'report'
  | 'marketing'
  | 'settings';

export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: { action: 'manage', subject: 'user' },
  VIEW_USERS: { action: 'read', subject: 'user' },

  // Course Management
  MANAGE_COURSES: { action: 'manage', subject: 'course' },
  VIEW_COURSES: { action: 'read', subject: 'course' },

  // Financial
  MANAGE_FINANCE: { action: 'manage', subject: 'finance' },
  VIEW_FINANCE: { action: 'read', subject: 'finance' },

  // Reporting
  VIEW_REPORTS: { action: 'read', subject: 'report' },

  // Marketing
  MANAGE_MARKETING: { action: 'manage', subject: 'marketing' },

  // System
  MANAGE_SETTINGS: { action: 'manage', subject: 'settings' },
} as const;

type UserWithRole = User & {
  role: Role & {
    permissions: Permission[];
  };
};

/**
 * Checks if a user has a specific permission.
 * Users with 'DIRECTOR' or 'ADMIN' role usually have full access,
 * but we can also check explicit permissions.
 */
export function hasPermission(
  user: any, // UserWithRole | SessionUser
  action: PermissionAction,
  subject: PermissionSubject
): boolean {
  if (!user) return false;

  const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
  const permissions = Array.isArray(user.permissions) ? user.permissions : user.role?.permissions;

  // Director and Admin bypass (optional, can be removed for strict RBAC)
  if (roleName === 'DIRECTOR' || roleName === 'ADMIN') {
    return true;
  }

  if (!permissions || !Array.isArray(permissions)) return false;

  // Check explicit permissions
  return permissions.some((permission: Permission) =>
    (permission.action === 'manage' && permission.subject === 'all') || // Super permission
    (permission.action === action && permission.subject === subject) ||
    (permission.action === 'manage' && permission.subject === subject) // Manage implies all actions on subject
  );
}

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { auth } from '../../auth';

export async function requirePermission(
  action: PermissionAction,
  subject: PermissionSubject
): Promise<UserWithRole> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: { permissions: true }
      }
    }
  });

  if (!user) redirect('/login');

  // @ts-ignore - Prisma types are compatible
  const hasAccess = hasPermission(user as UserWithRole, action, subject);

  if (!hasAccess) {
    redirect('/?error=unauthorized');
  }

  return user as UserWithRole;
}
