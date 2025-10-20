export enum UserRole {
  USER = 'USER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.INSTRUCTOR]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.SUPERADMIN]: 4,
};

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const PERMISSIONS = {
  // User permissions
  USER_READ_OWN: [UserRole.USER, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  USER_UPDATE_OWN: [UserRole.USER, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  USER_DELETE_OWN: [UserRole.USER, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],

  // Quiz permissions
  QUIZ_ATTEMPT: [UserRole.USER, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  QUIZ_CREATE: [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  QUIZ_UPDATE: [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  QUIZ_DELETE: [UserRole.ADMIN, UserRole.SUPERADMIN],

  // Course permissions
  COURSE_VIEW: [UserRole.USER, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  COURSE_CREATE: [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  COURSE_UPDATE_OWN: [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPERADMIN],
  COURSE_UPDATE_ANY: [UserRole.ADMIN, UserRole.SUPERADMIN],
  COURSE_DELETE: [UserRole.ADMIN, UserRole.SUPERADMIN],

  // Instructor permissions
  INSTRUCTOR_APPLY: [UserRole.USER],
  INSTRUCTOR_APPROVE: [UserRole.ADMIN, UserRole.SUPERADMIN],
  INSTRUCTOR_MANAGE: [UserRole.ADMIN, UserRole.SUPERADMIN],

  // Admin permissions
  ADMIN_PANEL_ACCESS: [UserRole.ADMIN, UserRole.SUPERADMIN],
  ADMIN_USER_MANAGEMENT: [UserRole.ADMIN, UserRole.SUPERADMIN],
  ADMIN_SYSTEM_CONFIG: [UserRole.SUPERADMIN],

  // Subscription permissions
  SUBSCRIPTION_MANAGE: [UserRole.ADMIN, UserRole.SUPERADMIN],

  // Payment permissions
  WITHDRAWAL_APPROVE: [UserRole.ADMIN, UserRole.SUPERADMIN],
  TRANSACTION_VIEW_ALL: [UserRole.ADMIN, UserRole.SUPERADMIN],
};
