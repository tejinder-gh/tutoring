import { hasPermission } from '../permissions-core';

describe('hasPermission', () => {
  const mockUserBase = {
    id: 'user-1',
    email: 'test@example.com',
  };

  test('should return true for DIRECTOR role', () => {
    const user = { ...mockUserBase, role: 'DIRECTOR' };
    expect(hasPermission(user, 'read', 'course')).toBe(true);
  });

  test('should return true for ADMIN role', () => {
    const user = { ...mockUserBase, role: { name: 'ADMIN', permissions: [] } };
    expect(hasPermission(user, 'manage', 'finance')).toBe(true);
  });

  test('should return true if user has exact permission', () => {
    const user = {
      ...mockUserBase,
      role: {
        name: 'TEACHER',
        permissions: [{ action: 'read', subject: 'course' }],
      },
    };
    expect(hasPermission(user, 'read', 'course')).toBe(true);
  });

  test('should return true if user has manage permission on subject', () => {
    const user = {
      ...mockUserBase,
      role: {
        name: 'EDITOR',
        permissions: [{ action: 'manage', subject: 'course' }],
      },
    };
    expect(hasPermission(user, 'create', 'course')).toBe(true);
    expect(hasPermission(user, 'read', 'course')).toBe(true);
  });

  test('should return true if user has super permission (manage all)', () => {
    const user = {
      ...mockUserBase,
      role: {
        name: 'SUPER_USER',
        permissions: [{ action: 'manage', subject: 'all' }],
      },
    };
    expect(hasPermission(user, 'delete', 'user')).toBe(true);
  });

  test('should return false if user is null or undefined', () => {
    expect(hasPermission(null, 'read', 'course')).toBe(false);
    expect(hasPermission(undefined, 'read', 'course')).toBe(false);
  });

  test('should return false if user has no permissions', () => {
    const user = {
      ...mockUserBase,
      role: {
        name: 'STUDENT',
        permissions: [],
      },
    };
    expect(hasPermission(user, 'read', 'finance')).toBe(false);
  });

  test('should return false if permission mismatch', () => {
    const user = {
      ...mockUserBase,
      role: {
        name: 'STUDENT',
        permissions: [{ action: 'read', subject: 'course' }],
      },
    };
    // User has read course, but asking for manage course
    expect(hasPermission(user, 'manage', 'course')).toBe(false);
    // User has read course, asking for read finance
    expect(hasPermission(user, 'read', 'finance')).toBe(false);
  });

  test('should handle permissions directly on user object (if schema supports it)', () => {
    // The code checks `user.permissions` as well:
    // const permissions = Array.isArray(user.permissions) ? user.permissions : user.role?.permissions;
    const user = {
        ...mockUserBase,
        role: 'CUSTOM', // role name string
        permissions: [{ action: 'manage', subject: 'marketing' }]
    };
    expect(hasPermission(user, 'create', 'marketing')).toBe(true);
  });
});
