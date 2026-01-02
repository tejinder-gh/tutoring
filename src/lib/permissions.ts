import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { hasPermission, PermissionAction, PermissionSubject, UserWithRole } from './permissions-core';

export * from './permissions-core';


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
