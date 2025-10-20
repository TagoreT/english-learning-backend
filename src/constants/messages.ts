export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  TOKEN_REFRESHED: 'Token refreshed successfully.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset successful.',

  // User
  USER_CREATED: 'User created successfully.',
  USER_UPDATED: 'User updated successfully.',
  USER_DELETED: 'User deleted successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',

  // Course
  COURSE_CREATED: 'Course created successfully.',
  COURSE_UPDATED: 'Course updated successfully.',
  COURSE_DELETED: 'Course deleted successfully.',
  COURSE_PUBLISHED: 'Course published successfully.',
  ENROLLED_SUCCESS: 'Enrolled in course successfully.',

  // Quiz
  QUIZ_CREATED: 'Quiz created successfully.',
  QUIZ_UPDATED: 'Quiz updated successfully.',
  QUIZ_DELETED: 'Quiz deleted successfully.',
  QUIZ_SUBMITTED: 'Quiz submitted successfully.',

  // Subscription
  SUBSCRIPTION_CREATED: 'Subscription created successfully.',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully.',
  SUBSCRIPTION_RENEWED: 'Subscription renewed successfully.',

  // Payment
  PAYMENT_SUCCESS: 'Payment processed successfully.',
  WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully.',
  WITHDRAWAL_APPROVED: 'Withdrawal approved successfully.',

  // Referral
  REFERRAL_APPLIED: 'Referral code applied successfully.',
  REFERRAL_REWARD_CREDITED: 'Referral reward credited to your wallet.',

  // Coupon
  COUPON_APPLIED: 'Coupon applied successfully.',
  COUPON_CREATED: 'Coupon created successfully.',

  // Topic
  TOPIC_CREATED: 'Topic created successfully.',
  TOPIC_UPDATED: 'Topic updated successfully.',

  // Pronunciation
  PRONUNCIATION_SUBMITTED: 'Pronunciation submitted for evaluation.',
  PRONUNCIATION_EVALUATED: 'Pronunciation evaluated successfully.',

  // Call
  CALL_STARTED: 'Call started successfully.',
  CALL_ENDED: 'Call ended successfully.',

  // General
  OPERATION_SUCCESS: 'Operation completed successfully.',
};

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNAUTHORIZED: 'Unauthorized access.',
  TOKEN_EXPIRED: 'Token has expired.',
  TOKEN_INVALID: 'Invalid token.',
  EMAIL_ALREADY_EXISTS: 'Email already exists.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_NOT_VERIFIED: 'Please verify your email first.',
  INVALID_VERIFICATION_TOKEN: 'Invalid verification token.',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token.',
  PASSWORD_MISMATCH: 'Passwords do not match.',

  // Permission
  FORBIDDEN: 'You do not have permission to perform this action.',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions.',

  // Validation
  VALIDATION_ERROR: 'Validation error.',
  INVALID_INPUT: 'Invalid input data.',
  MISSING_REQUIRED_FIELDS: 'Missing required fields.',

  // Course
  COURSE_NOT_FOUND: 'Course not found.',
  COURSE_NOT_PUBLISHED: 'Course is not published.',
  ALREADY_ENROLLED: 'You are already enrolled in this course.',
  NOT_ENROLLED: 'You are not enrolled in this course.',

  // Quiz
  QUIZ_NOT_FOUND: 'Quiz not found.',
  QUIZ_NOT_UNLOCKED: 'This quiz is not yet unlocked.',
  QUIZ_ALREADY_ATTEMPTED: 'You have already attempted this quiz.',

  // Subscription
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found.',
  SUBSCRIPTION_EXPIRED: 'Subscription has expired.',
  SUBSCRIPTION_ALREADY_ACTIVE: 'You already have an active subscription.',

  // Payment
  PAYMENT_FAILED: 'Payment processing failed.',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance.',
  WITHDRAWAL_FAILED: 'Withdrawal request failed.',
  INVALID_AMOUNT: 'Invalid amount.',

  // Referral
  INVALID_REFERRAL_CODE: 'Invalid referral code.',
  SELF_REFERRAL_NOT_ALLOWED: 'You cannot use your own referral code.',
  REFERRAL_ALREADY_USED: 'Referral code already used.',

  // Coupon
  COUPON_NOT_FOUND: 'Coupon not found.',
  COUPON_EXPIRED: 'Coupon has expired.',
  COUPON_LIMIT_REACHED: 'Coupon usage limit reached.',
  COUPON_INVALID: 'Invalid coupon code.',

  // File
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  FILE_UPLOAD_FAILED: 'File upload failed.',

  // Instructor
  INSTRUCTOR_NOT_FOUND: 'Instructor not found.',
  INSTRUCTOR_NOT_APPROVED: 'Instructor account is not approved yet.',
  ALREADY_AN_INSTRUCTOR: 'You are already an instructor.',

  // Topic
  TOPIC_NOT_FOUND: 'Topic not found.',

  // Pronunciation
  PRONUNCIATION_NOT_FOUND: 'Pronunciation record not found.',
  AUDIO_PROCESSING_FAILED: 'Audio processing failed.',

  // Call
  CALL_NOT_FOUND: 'Call not found.',
  USER_BUSY: 'User is currently busy.',
  CALL_FAILED: 'Call failed to connect.',

  // Server
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable.',
  DATABASE_ERROR: 'Database operation failed.',
  REDIS_ERROR: 'Cache operation failed.',

  // General
  OPERATION_FAILED: 'Operation failed.',
  RESOURCE_NOT_FOUND: 'Resource not found.',
};

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required.',
  EMAIL_INVALID: 'Please provide a valid email address.',
  PASSWORD_REQUIRED: 'Password is required.',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long.',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, number, and special character.',
  NAME_REQUIRED: 'Name is required.',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters long.',
  PHONE_INVALID: 'Please provide a valid phone number.',
  URL_INVALID: 'Please provide a valid URL.',
  DATE_INVALID: 'Please provide a valid date.',
  NUMBER_INVALID: 'Please provide a valid number.',
  POSITIVE_NUMBER_REQUIRED: 'Number must be positive.',
};
