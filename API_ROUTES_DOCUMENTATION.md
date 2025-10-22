# API Routes Documentation - English Learning Platform

Complete documentation of all API routes organized by module.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <access_token>
```

---

## 📋 Table of Contents

1. [Authentication Module](#1-authentication-module)
2. [User Management Module](#2-user-management-module)
3. [Course Management Module](#3-course-management-module)
4. [Quiz Module](#4-quiz-module)
5. [Subscription Module](#5-subscription-module)
6. [Payment & Wallet Module](#6-payment--wallet-module)
7. [Referral Module](#7-referral-module)
8. [Coupon Module](#8-coupon-module)
9. [Instructor Module](#9-instructor-module)
10. [Topic Module](#10-topic-module)
11. [Pronunciation Module](#11-pronunciation-module)
12. [File Upload Module](#12-file-upload-module)
13. [Admin Module](#13-admin-module)
14. [Health & Monitoring](#14-health--monitoring)

---

## 1. Authentication Module

**Base Path:** `/api/v1/auth`

### 1.1 Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "SecurePass@123",
  "referralCode": "ABC12345" // Optional
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Full Name: Min 2 characters
- Referral Code: Optional, 8 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "isVerified": false,
      "referralCode": "XYZ98765",
      "walletBalance": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists",
  "errorCode": 1006
}
```

---

### 1.2 Login
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "isVerified": true,
      "avatarUrl": "https://...",
      "walletBalance": 100
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "errorCode": 1005
}
```

---

### 1.3 Refresh Token
**POST** `/auth/refresh-token`

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

---

### 1.4 Verify Email
**POST** `/auth/verify-email`

**Access:** Public

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

**Note:** After verification, if user was referred, referral bonuses are automatically credited.

---

### 1.5 Forgot Password
**POST** `/auth/forgot-password`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email."
}
```

**Note:** Returns success even if email doesn't exist (security best practice).

---

### 1.6 Reset Password
**POST** `/auth/reset-password`

**Access:** Public

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful."
}
```

---

### 1.7 Change Password
**POST** `/auth/change-password`

**Access:** Protected (Authenticated users)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass@123",
  "newPassword": "NewSecurePass@456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful."
}
```

---

### 1.8 Logout
**POST** `/auth/logout`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Note:** Blacklists the current access token.

---

### 1.9 Get Profile
**GET** `/auth/profile`

**Access:** Protected

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": "https://...",
    "role": "USER",
    "referralCode": "XYZ98765",
    "walletBalance": 150.50,
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "profile": {
      "bio": "Learning English to improve career",
      "learningGoals": "Achieve IELTS 7.5",
      "languageLevel": "B2_UPPER_INTERMEDIATE",
      "timezone": "Asia/Kolkata"
    }
  }
}
```

---

## 2. User Management Module

**Base Path:** `/api/v1/users`

**All routes require authentication**

### 2.1 Update Profile
**PUT** `/users/profile`

**Access:** Protected (User owns profile)

**Request Body:**
```json
{
  "fullName": "John Updated",
  "bio": "Passionate English learner",
  "learningGoals": "Achieve IELTS 8.0",
  "languageLevel": "C1_ADVANCED",
  "timezone": "Asia/Kolkata"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Updated",
    "profile": {
      "bio": "Passionate English learner",
      "learningGoals": "Achieve IELTS 8.0",
      "languageLevel": "C1_ADVANCED",
      "timezone": "Asia/Kolkata"
    }
  }
}
```

---

### 2.2 Update Avatar
**PUT** `/users/avatar`

**Access:** Protected

**Request Body:**
```json
{
  "avatarUrl": "https://cdn.example.com/avatars/user123.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": "uuid",
    "avatarUrl": "https://cdn.example.com/avatars/user123.jpg"
  }
}
```

---

### 2.3 Get Wallet Balance
**GET** `/users/wallet`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wallet balance retrieved",
  "data": {
    "balance": 250.75
  }
}
```

---

### 2.4 Get Transactions
**GET** `/users/transactions?page=1&limit=10`

**Access:** Protected

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": [
    {
      "id": "uuid",
      "amount": 100,
      "type": "CREDIT",
      "status": "COMPLETED",
      "gatewayId": null,
      "metadata": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "uuid",
      "amount": 50,
      "type": "REFERRAL_BONUS",
      "status": "COMPLETED",
      "gatewayId": null,
      "metadata": null,
      "createdAt": "2024-01-14T09:20:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 2.5 Get User Stats
**GET** `/users/stats`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "User stats retrieved",
  "data": {
    "quizAttempts": 15,
    "enrollments": 3,
    "pronunciations": 42
  }
}
```

---

### 2.6 Get All Users (Admin)
**GET** `/users/all?page=1&limit=10&search=john&role=USER`

**Access:** Protected (Admin/SuperAdmin only)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search in email and full name
- `role`: Filter by role (USER, INSTRUCTOR, ADMIN, SUPERADMIN)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "fullName": "John Doe",
      "avatarUrl": "https://...",
      "role": "USER",
      "isVerified": true,
      "walletBalance": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

### 2.7 Delete User (Admin)
**DELETE** `/users/:userId`

**Access:** Protected (Admin/SuperAdmin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

## 3. Course Management Module

**Base Path:** `/api/v1/courses`

### 3.1 Create Course (Instructor)
**POST** `/courses`

**Access:** Protected (Instructor/Admin only)

**Request Body:**
```json
{
  "title": "Advanced English Grammar",
  "description": "Comprehensive course on English grammar",
  "price": 49.99,
  "categories": ["Grammar", "Advanced"],
  "tags": ["english", "grammar", "advanced"],
  "thumbnailUrl": "https://..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Course created successfully.",
  "data": {
    "id": "uuid",
    "title": "Advanced English Grammar",
    "description": "Comprehensive course on English grammar",
    "price": 49.99,
    "categories": ["Grammar", "Advanced"],
    "tags": ["english", "grammar", "advanced"],
    "thumbnailUrl": "https://...",
    "isPublished": false,
    "instructor": {
      "id": "uuid",
      "user": {
        "fullName": "Jane Instructor",
        "avatarUrl": "https://..."
      }
    },
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 3.2 Get All Courses
**GET** `/courses?page=1&limit=10&search=grammar&category=Grammar&minPrice=0&maxPrice=100&isPublished=true`

**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search in title and description
- `category`: Filter by category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `isPublished`: Filter published courses
- `instructorId`: Filter by instructor

**Success Response (200):**
```json
{
  "success": true,
  "message": "Courses retrieved",
  "data": [
    {
      "id": "uuid",
      "title": "Advanced English Grammar",
      "description": "Comprehensive course...",
      "price": 49.99,
      "categories": ["Grammar"],
      "thumbnailUrl": "https://...",
      "isPublished": true,
      "instructor": {
        "user": {
          "fullName": "Jane Instructor",
          "avatarUrl": "https://..."
        }
      },
      "_count": {
        "enrollments": 127
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 3.3 Get Course by ID
**GET** `/courses/:courseId`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course retrieved",
  "data": {
    "id": "uuid",
    "title": "Advanced English Grammar",
    "description": "Full description...",
    "price": 49.99,
    "categories": ["Grammar"],
    "isPublished": true,
    "instructor": {
      "user": {
        "fullName": "Jane Instructor"
      }
    },
    "content": [
      {
        "id": "uuid",
        "type": "VIDEO",
        "title": "Introduction",
        "position": 1,
        "metadata": {
          "url": "https://...",
          "duration": 600
        }
      }
    ],
    "_count": {
      "enrollments": 127,
      "quizzes": 5
    },
    "isEnrolled": false,
    "progress": 0
  }
}
```

---

### 3.4 Update Course (Instructor)
**PUT** `/courses/:courseId`

**Access:** Protected (Owner Instructor/Admin)

**Request Body:**
```json
{
  "title": "Advanced English Grammar - Updated",
  "description": "Updated description",
  "price": 59.99,
  "isPublished": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course updated successfully.",
  "data": {
    "id": "uuid",
    "title": "Advanced English Grammar - Updated",
    "price": 59.99,
    "isPublished": true
  }
}
```

---

### 3.5 Delete Course (Instructor/Admin)
**DELETE** `/courses/:courseId`

**Access:** Protected (Owner Instructor/Admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully."
}
```

---

### 3.6 Add Course Content (Instructor)
**POST** `/courses/:courseId/content`

**Access:** Protected (Owner Instructor/Admin)

**Request Body:**
```json
{
  "type": "VIDEO",
  "title": "Lesson 1: Introduction",
  "metadata": {
    "url": "https://video-url.com/lesson1.mp4",
    "duration": 600,
    "description": "Introduction to the course"
  },
  "position": 1
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Content added successfully.",
  "data": {
    "id": "uuid",
    "type": "VIDEO",
    "title": "Lesson 1: Introduction",
    "position": 1,
    "metadata": {
      "url": "https://...",
      "duration": 600
    }
  }
}
```

---

### 3.7 Enroll in Course
**POST** `/courses/:courseId/enroll`

**Access:** Protected

**Success Response (201):**
```json
{
  "success": true,
  "message": "Enrolled in course successfully.",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "courseId": "uuid",
    "enrolledAt": "2024-01-15T00:00:00.000Z",
    "progress": 0,
    "course": {
      "title": "Advanced English Grammar",
      "instructor": {
        "user": {
          "fullName": "Jane Instructor"
        }
      }
    }
  }
}
```

---

### 3.8 Update Course Progress
**PUT** `/courses/:courseId/progress`

**Access:** Protected (Enrolled users)

**Request Body:**
```json
{
  "progress": 45.5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "id": "uuid",
    "progress": 45.5,
    "completedAt": null
  }
}
```

---

### 3.9 Get Enrolled Courses
**GET** `/courses/enrolled`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Enrolled courses retrieved",
  "data": [
    {
      "id": "uuid",
      "enrolledAt": "2024-01-10T00:00:00.000Z",
      "progress": 45.5,
      "completedAt": null,
      "course": {
        "id": "uuid",
        "title": "Advanced English Grammar",
        "thumbnailUrl": "https://...",
        "instructor": {
          "user": {
            "fullName": "Jane Instructor"
          }
        }
      }
    }
  ]
}
```

---

## 4. Quiz Module

**Base Path:** `/api/v1/quizzes`

### 4.1 Create Quiz (Instructor)
**POST** `/quizzes`

**Access:** Protected (Instructor/Admin)

**Request Body:**
```json
{
  "courseId": "uuid",
  "title": "Grammar Basics Quiz",
  "difficulty": "INTERMEDIATE",
  "unlockSequence": 0,
  "passingScore": 70,
  "questions": [
    {
      "questionData": {
        "text": "What is the past tense of 'go'?",
        "options": ["goed", "went", "gone", "going"],
        "type": "multiple_choice"
      },
      "correctAnswer": "went",
      "points": 1,
      "position": 1
    },
    {
      "questionData": {
        "text": "English has 26 letters",
        "type": "true_false"
      },
      "correctAnswer": true,
      "points": 1,
      "position": 2
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Quiz created successfully.",
  "data": {
    "id": "uuid",
    "title": "Grammar Basics Quiz",
    "difficulty": "INTERMEDIATE",
    "unlockSequence": 0,
    "passingScore": 70,
    "questions": [...]
  }
}
```

---

### 4.2 Get Quiz by ID
**GET** `/quizzes/:quizId`

**Access:** Protected (Enrolled in course)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Quiz retrieved",
  "data": {
    "id": "uuid",
    "title": "Grammar Basics Quiz",
    "difficulty": "INTERMEDIATE",
    "passingScore": 70,
    "questions": [
      {
        "id": "uuid",
        "questionData": {
          "text": "What is the past tense of 'go'?",
          "options": ["goed", "went", "gone", "going"],
          "type": "multiple_choice"
        },
        "points": 1,
        "position": 1
      }
    ],
    "userAttempts": [
      {
        "id": "uuid",
        "score": 85,
        "createdAt": "2024-01-14T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 4.3 Submit Quiz Attempt
**POST** `/quizzes/:quizId/attempt`

**Access:** Protected (Enrolled in course)

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answer": "went"
    },
    {
      "questionId": "uuid",
      "answer": true
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully.",
  "data": {
    "id": "uuid",
    "score": 100,
    "details": {
      "results": [
        {
          "questionId": "uuid",
          "userAnswer": "went",
          "correctAnswer": "went",
          "isCorrect": true,
          "points": 1
        }
      ],
      "totalPoints": 2,
      "earnedPoints": 2,
      "passed": true
    },
    "passed": true,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 4.4 Get User Quiz Attempts
**GET** `/quizzes/attempts?quizId=uuid`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attempts retrieved",
  "data": [
    {
      "id": "uuid",
      "score": 85,
      "createdAt": "2024-01-15T00:00:00.000Z",
      "quiz": {
        "id": "uuid",
        "title": "Grammar Basics Quiz",
        "difficulty": "INTERMEDIATE",
        "passingScore": 70
      }
    }
  ]
}
```

---

## 5. Subscription Module

**Base Path:** `/api/v1/subscriptions`

### 5.1 Get All Plans
**GET** `/subscriptions/plans`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plans retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Basic Plan",
      "interval": "monthly",
      "price": 9.99,
      "trialDays": 7,
      "features": {
        "courses": "unlimited",
        "quizzes": "unlimited",
        "pronunciation": "limited"
      },
      "isActive": true
    },
    {
      "id": "uuid",
      "name": "Pro Plan",
      "interval": "monthly",
      "price": 19.99,
      "trialDays": 14,
      "features": {
        "courses": "unlimited",
        "quizzes": "unlimited",
        "pronunciation": "unlimited",
        "voiceCalls": "unlimited"
      },
      "isActive": true
    }
  ]
}
```

---

### 5.2 Create Subscription
**POST** `/subscriptions`

**Access:** Protected

**Request Body:**
```json
{
  "planId": "uuid",
  "couponCode": "SAVE20"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully.",
  "data": {
    "id": "uuid",
    "planId": "uuid",
    "status": "TRIAL",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-01-22T00:00:00.000Z",
    "autoRenew": true,
    "plan": {
      "name": "Pro Plan",
      "interval": "monthly",
      "price": 19.99,
      "trialDays": 7
    }
  }
}
```

**Note:** Email confirmation is sent automatically.

---

### 5.3 Get User Subscriptions
**GET** `/subscriptions/my`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscriptions retrieved",
  "data": [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-02-15T00:00:00.000Z",
      "autoRenew": true,
      "plan": {
        "name": "Pro Plan",
        "interval": "monthly",
        "price": 19.99
      }
    }
  ]
}
```

---

### 5.4 Get Active Subscription
**GET** `/subscriptions/active`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Active subscription retrieved",
  "data": {
    "id": "uuid",
    "status": "ACTIVE",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-02-15T00:00:00.000Z",
    "autoRenew": true,
    "plan": {
      "name": "Pro Plan",
      "features": {...}
    }
  }
}
```

---

### 5.5 Cancel Subscription
**POST** `/subscriptions/:subscriptionId/cancel`

**Access:** Protected (Owner)

**Request Body:**
```json
{
  "reason": "Too expensive"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully.",
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "autoRenew": false
  }
}
```

---

### 5.6 Create Plan (Admin)
**POST** `/subscriptions/plans`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
  "name": "Enterprise Plan",
  "interval": "yearly",
  "price": 199.99,
  "trialDays": 30,
  "features": {
    "everything": "unlimited",
    "support": "24/7",
    "customization": true
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Plan created successfully.",
  "data": {
    "id": "uuid",
    "name": "Enterprise Plan",
    "interval": "yearly",
    "price": 199.99,
    "isActive": true
  }
}
```

---

## 6. Payment & Wallet Module

**Base Path:** `/api/v1/payments`

### 6.1 Create Payment Intent
**POST** `/payments/create-intent`

**Access:** Protected

**Request Body:**
```json
{
  "amount": 49.99,
  "type": "SUBSCRIPTION",
  "metadata": {
    "planId": "uuid"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "clientSecret": "stripe_client_secret",
    "transactionId": "uuid"
  }
}
```

---

### 6.2 Request Withdrawal
**POST** `/payments/withdrawal`

**Access:** Protected

**Request Body:**
```json
{
  "amount": 100,
  "notes": "Withdraw to bank account"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully.",
  "data": {
    "id": "uuid",
    "amount": 100,
    "status": "PENDING",
    "requestDate": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 6.3 Get Withdrawal Requests
**GET** `/payments/withdrawals?status=PENDING`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Withdrawals retrieved",
  "data": [
    {
      "id": "uuid",
      "amount": 100,
      "status": "PENDING",
      "requestDate": "2024-01-15T00:00:00.000Z",
      "processedDate": null,
      "notes": "Withdraw to bank account"
    }
  ]
}
```

---

### 6.4 Process Withdrawal (Admin)
**PUT** `/payments/withdrawals/:withdrawalId`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
  "status": "APPROVED",
  "notes": "Processed via bank transfer"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Withdrawal processed",
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "processedDate": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 6.5 Apply Coupon
**POST** `/payments/apply-coupon`

**Access:** Protected

**Request Body:**
```json
{
  "code": "SAVE20",
  "amount": 100
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coupon applied successfully.",
  "data": {
    "originalAmount": 100,
    "discountAmount": 20,
    "finalAmount": 80,
    "coupon": {
      "code": "SAVE20",
      "discountType": "PERCENTAGE",
      "value": 20
    }
  }
}
```

---

## 7. Referral Module

**Base Path:** `/api/v1/referrals`

### 7.1 Get My Referral Code
**GET** `/referrals/my-code`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Referral code retrieved",
  "data": {
    "referralCode": "ABC12345",
    "referralLink": "https://app.example.com/register?ref=ABC12345"
  }
}
```

---

### 7.2 Get My Referrals
**GET** `/referrals/my-referrals?page=1&limit=10&status=COMPLETED`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Referrals retrieved",
  "data": [
    {
      "id": "uuid",
      "refereeId": "uuid",
      "rewardAmount": 50,
      "status": "COMPLETED",
      "createdAt": "2024-01-10T00:00:00.000Z",
      "referee": {
        "fullName": "Referred User",
        "email": "referred@example.com"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 7.3 Get Referral Stats
**GET** `/referrals/stats`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "totalReferrals": 25,
    "completedReferrals": 20,
    "pendingReferrals": 5,
    "totalEarnings": 1000
  }
}
```

---

## 8. Coupon Module (Admin)

**Base Path:** `/api/v1/coupons`

### 8.1 Create Coupon
**POST** `/coupons`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
  "code": "NEWYEAR2024",
  "discountType": "PERCENTAGE",
  "value": 25,
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "usageLimit": 1000,
  "multiTier": {
    "tier1": { "minAmount": 0, "discount": 20 },
    "tier2": { "minAmount": 100, "discount": 25 },
    "tier3": { "minAmount": 200, "discount": 30 }
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Coupon created successfully.",
  "data": {
    "id": "uuid",
    "code": "NEWYEAR2024",
    "discountType": "PERCENTAGE",
    "value": 25,
    "usageLimit": 1000,
    "usedCount": 0,
    "isActive": true
  }
}
```

---

### 8.2 Get All Coupons
**GET** `/coupons?active=true`

**Access:** Protected (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coupons retrieved",
  "data": [
    {
      "id": "uuid",
      "code": "NEWYEAR2024",
      "discountType": "PERCENTAGE",
      "value": 25,
      "usageLimit": 1000,
      "usedCount": 150,
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "isActive": true
    }
  ]
}
```

---

### 8.3 Deactivate Coupon
**PUT** `/coupons/:couponId/deactivate`

**Access:** Protected (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Coupon deactivated",
  "data": {
    "id": "uuid",
    "code": "NEWYEAR2024",
    "isActive": false
  }
}
```

---

## 9. Instructor Module

**Base Path:** `/api/v1/instructors`

### 9.1 Apply to Become Instructor
**POST** `/instructors/apply`

**Access:** Protected (USER role)

**Request Body:**
```json
{
  "bio": "10 years of teaching experience...",
  "qualifications": ["TEFL Certified", "Master's in English"],
  "experience": "Taught at XYZ University..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Instructor application submitted",
  "data": {
    "id": "uuid",
    "approved": false,
    "bio": "10 years of teaching experience..."
  }
}
```

---

### 9.2 Get Instructor Applications (Admin)
**GET** `/instructors/applications?approved=false`

**Access:** Protected (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "approved": false,
      "bio": "10 years...",
      "user": {
        "fullName": "Jane Doe",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### 9.3 Approve Instructor (Admin)
**PUT** `/instructors/:instructorId/approve`

**Access:** Protected (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Instructor approved",
  "data": {
    "id": "uuid",
    "approved": true
  }
}
```

**Note:** User role is automatically updated to INSTRUCTOR.

---

### 9.4 Get Instructor Stats
**GET** `/instructors/:instructorId/stats`

**Access:** Protected (Owner Instructor/Admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "totalCourses": 8,
    "publishedCourses": 6,
    "totalEnrollments": 456,
    "averageRating": 4.7,
    "totalEarnings": 15234.50
  }
}
```

---

## 10. Topic Module

**Base Path:** `/api/v1/topics`

### 10.1 Get All Topics
**GET** `/topics?category=Speaking&page=1&limit=20`

**Access:** Public

**Query Parameters:**
- `category`: Filter by category
- `isPublic`: Filter public topics
- `page`, `limit`: Pagination

**Success Response (200):**
```json
{
  "success": true,
  "message": "Topics retrieved",
  "data": [
    {
      "id": "uuid",
      "title": "Daily Conversation",
      "category": "Speaking",
      "content": "Everyday conversations and phrases",
      "isPublic": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 10.2 Suggest Topic
**POST** `/topics/suggest`

**Access:** Protected

**Request Body:**
```json
{
  "title": "Business Email Writing",
  "category": "Business",
  "content": "Professional email communication tips"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Topic suggested successfully.",
  "data": {
    "id": "uuid",
    "title": "Business Email Writing",
    "category": "Business",
    "isPublic": false,
    "suggestedBy": "uuid"
  }
}
```

---

### 10.3 Approve Topic (Admin)
**PUT** `/topics/:topicId/approve`

**Access:** Protected (Admin only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Topic approved and published",
  "data": {
    "id": "uuid",
    "isPublic": true
  }
}
```

---

## 11. Pronunciation Module

**Base Path:** `/api/v1/pronunciation`

### 11.1 Submit Pronunciation
**POST** `/pronunciation/submit`

**Access:** Protected

**Request Body:** (Multipart form-data)
```
contentText: "The quick brown fox jumps over the lazy dog"
audioFile: <audio file>
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Pronunciation submitted for evaluation.",
  "data": {
    "id": "uuid",
    "contentText": "The quick brown fox...",
    "audioUrl": "https://...",
    "status": "PROCESSING"
  }
}
```

**Note:** Evaluation happens asynchronously via background worker.

---

### 11.2 Get Pronunciation Results
**GET** `/pronunciation/:pronunciationId`

**Access:** Protected (Owner)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pronunciation results retrieved",
  "data": {
    "id": "uuid",
    "contentText": "The quick brown fox...",
    "audioUrl": "https://...",
    "scoreJson": {
      "accuracyScore": 85,
      "fluencyScore": 78,
      "completenessScore": 90,
      "prosodyScore": 82,
      "pronunciation": {
        "overallScore": 83.75
      },
      "words": [...]
    },
    "feedback": "Good pronunciation. Work on fluency.",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 11.3 Get My Pronunciations
**GET** `/pronunciation/my?page=1&limit=10`

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pronunciations retrieved",
  "data": [
    {
      "id": "uuid",
      "contentText": "The quick brown fox...",
      "scoreJson": {
        "pronunciation": {
          "overallScore": 83.75
        }
      },
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## 12. File Upload Module

**Base Path:** `/api/v1/uploads`

### 12.1 Get Presigned URL
**POST** `/uploads/presigned-url`

**Access:** Protected

**Request Body:**
```json
{
  "fileName": "avatar.jpg",
  "fileType": "image/jpeg",
  "folder": "avatars"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Presigned URL generated",
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "fileUrl": "https://cdn.example.com/avatars/...",
    "key": "avatars/1234567890-unique.jpg",
    "expiresIn": 3600
  }
}
```

**Usage:**
1. Get presigned URL from backend
2. Upload file directly to S3 using the uploadUrl
3. Use the fileUrl in your API requests

---

### 12.2 Upload Avatar
**POST** `/uploads/avatar`

**Access:** Protected

**Request Body:** (Multipart form-data)
```
file: <image file>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully.",
  "data": {
    "avatarUrl": "https://cdn.example.com/avatars/user-123.jpg"
  }
}
```

---

### 12.3 Upload Course Content
**POST** `/uploads/course-content`

**Access:** Protected (Instructor/Admin)

**Request Body:** (Multipart form-data)
```
file: <video/pdf/audio file>
courseId: uuid
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Content uploaded successfully.",
  "data": {
    "fileUrl": "https://cdn.example.com/courses/lesson1.mp4",
    "fileType": "video/mp4",
    "fileSize": 52428800
  }
}
```

---

## 13. Admin Module

**Base Path:** `/api/v1/admin`

**All routes require Admin/SuperAdmin role**

### 13.1 Get Dashboard Stats
**GET** `/admin/dashboard`

**Access:** Protected (Admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved",
  "data": {
    "users": {
      "total": 5420,
      "verified": 4892,
      "instructors": 156,
      "newThisMonth": 324
    },
    "courses": {
      "total": 287,
      "published": 245,
      "totalEnrollments": 12456
    },
    "revenue": {
      "total": 145678.50,
      "thisMonth": 15234.75,
      "subscriptions": 98456.25,
      "courses": 47222.25
    },
    "subscriptions": {
      "active": 3421,
      "trial": 234,
      "cancelled": 567
    }
  }
}
```

---

### 13.2 Get System Config
**GET** `/admin/config`

**Access:** Protected (SuperAdmin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Config retrieved",
  "data": {
    "referralRewardAmount": 50,
    "referrerBonusAmount": 100,
    "defaultTrialDays": 7,
    "maxFileSize": 10485760,
    "rateLimit": {
      "max": 100,
      "timeWindow": "15m"
    }
  }
}
```

---

### 13.3 Update System Config
**PUT** `/admin/config`

**Access:** Protected (SuperAdmin)

**Request Body:**
```json
{
  "referralRewardAmount": 75,
  "defaultTrialDays": 14
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Config updated successfully."
}
```

---

### 13.4 Get Audit Logs
**GET** `/admin/audit-logs?page=1&limit=50&action=USER_CREATED`

**Access:** Protected (Admin)

**Query Parameters:**
- `page`, `limit`: Pagination
- `actorId`: Filter by user who performed action
- `action`: Filter by action type
- `entityType`: Filter by entity type
- `startDate`, `endDate`: Date range

**Success Response (200):**
```json
{
  "success": true,
  "message": "Audit logs retrieved",
  "data": [
    {
      "id": "uuid",
      "action": "USER_CREATED",
      "entityType": "User",
      "entityId": "uuid",
      "payload": {...},
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "actor": {
        "fullName": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 15432,
    "totalPages": 309
  }
}
```

---

## 14. Health & Monitoring

### 14.1 Health Check
**GET** `/health`

**Access:** Public

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

**Unhealthy Response (200):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "services": {
    "database": "up",
    "redis": "down"
  }
}
```

---

### 14.2 API Documentation
**GET** `/docs`

**Access:** Public (Development only)

Opens Swagger UI for interactive API documentation.

---

### 14.3 OpenAPI Specification
**GET** `/docs/json`

**Access:** Public (Development only)

Returns the complete OpenAPI 3.0 specification in JSON format.

---

## Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "message": "Error message here",
  "errorCode": 1001,
  "details": {
    // Additional error details if applicable
  },
  "stack": "Error stack trace (development only)"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 1001 | Unauthorized |
| 1002 | Forbidden |
| 1003 | Token Expired |
| 1004 | Token Invalid |
| 1005 | Invalid Credentials |
| 1006 | Email Already Exists |
| 2001 | Validation Error |
| 3001 | User Not Found |
| 3002 | Course Not Found |
| 3003 | Quiz Not Found |
| 4001 | Course Not Published |
| 4002 | Already Enrolled |
| 4008 | Insufficient Balance |
| 5001 | Payment Failed |
| 9001 | Internal Server Error |

---

## Rate Limiting

- **Rate**: 100 requests per 15 minutes per IP
- **Response Header**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "errorCode": 429
}
```

---

## Pagination

All paginated endpoints support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "success": true,
  "message": "...",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16
  }
}
```

---

## Authentication Flow

### Standard Flow
1. Register → Get tokens
2. Verify email via link
3. Login → Get new tokens
4. Use access token for API calls
5. Refresh token when expired
6. Logout → Token blacklisted

### Token Lifetimes
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## Module Summary

| Module | Routes | Auth Required | Roles |
|--------|--------|---------------|-------|
| Authentication | 9 | Mixed | Public/User |
| Users | 7 | Yes | User/Admin |
| Courses | 9 | Mixed | Public/User/Instructor |
| Quizzes | 4 | Yes | User/Instructor |
| Subscriptions | 6 | Mixed | User/Admin |
| Payments | 5 | Yes | User/Admin |
| Referrals | 3 | Yes | User |
| Coupons | 3 | Yes | Admin |
| Instructors | 4 | Yes | User/Admin |
| Topics | 3 | Mixed | Public/User/Admin |
| Pronunciation | 3 | Yes | User |
| File Upload | 3 | Yes | User/Instructor |
| Admin | 4 | Yes | Admin/SuperAdmin |
| Health | 3 | No | Public |

**Total API Endpoints:** 66+

---

**Last Updated:** 2024-01-15
**API Version:** v1
**Base URL:** http://localhost:3000/api/v1
