import { hasPermission, PermissionAction, PermissionSubject } from '@/lib/permissions';
import { useSession } from 'next-auth/react';

export function usePermission() {
  const { data: session } = useSession();

  const checkPermission = (action: PermissionAction, subject: PermissionSubject) => {
    if (!session?.user) return false;
    // @ts-ignore - session.user will have role populated after we update auth.config.ts
    return hasPermission(session.user, action, subject);
  };

  const isLoading = !session;

  return {
    can: checkPermission,
    isLoading,
    user: session?.user,
  };
}
