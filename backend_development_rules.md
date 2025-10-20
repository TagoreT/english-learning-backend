# English Learning Platform – Backend Architecture & Development Guide

## 🏗️ Tech Stack

* **Framework:** Fastify.js
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Authentication:** JWT + Refresh Tokens
* **Cache Layer:** Redis
* **File Storage:** AWS S3 / Azure Blob with CDN
* **WebRTC Signaling:** SignalR
* **Payment Gateway:** Stripe / Razorpay
* **AI Integration:** Azure Speech API or SpeechSuper for pronunciation evaluation
* **Email Service:** SendGrid / Nodemailer with templates

---

## 🧩 Folder Structure & Flow

**Flow:** `route -> middleware (RBA) -> validator (request body) -> controller -> service`

```
📦 src
 ┣ 📂 routes
 ┃ ┗ userRoutes.ts, quizRoutes.ts, etc.
 ┣ 📂 middlewares
 ┃ ┗ authMiddleware.ts, roleBasedAccess.ts
 ┣ 📂 validators
 ┃ ┗ userValidator.ts, quizValidator.ts
 ┣ 📂 controllers
 ┃ ┗ userController.ts, quizController.ts
 ┣ 📂 services
 ┃ ┗ userService.ts, quizService.ts
 ┣ 📂 models
 ┃ ┗ prisma schema / ORM definitions
 ┣ 📂 utils
 ┃ ┗ email.ts, responseHandler.ts, jwtHelper.ts
 ┣ 📂 config
 ┃ ┗ env.ts, redisConfig.ts, dbConfig.ts
 ┣ 📂 constants
 ┃ ┗ messages.ts, roles.ts
 ┣ 📂 plugins
 ┃ ┗ fastifyPlugin registrations (CORS, JWT, etc.)
 ┗ app.ts / server.ts
```

---

## ✅ Development Best Practices

### 1. **Routing**

* Keep route definitions minimal.
* Use Fastify route decorators for clean structure.
* Import pre-validation and pre-handler functions only when needed.

### 2. **Middleware (RBA)**

* Role-Based Access (RBA) middleware to check user roles dynamically.
* Implement permission checks via constants instead of hardcoding.

### 3. **Validation Layer**

* Use **Zod** or **Fastify-Schema** for strict request validation.
* Validate all request payloads (body, query, params) before reaching controllers.

### 4. **Controllers**

* Handle input/output transformation and call corresponding service.
* Should not contain business logic.
* Return standardized responses (use response handler).

### 5. **Services**

* Core business logic implementation.
* Must be **stateless** and **reusable**.
* All DB or external API interactions happen here.

### 6. **Error Handling**

* Global error handler for Fastify.
* Use custom error classes for API, Validation, and Service errors.

### 7. **Response Standardization**

* Maintain a consistent structure:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {...}
}
```

### 8. **Security**

* JWT + Refresh Token strategy.
* Password hashing using bcrypt.
* Rate limiting, input sanitization, helmet.
* CORS and HTTPS enforcement.

### 9. **Dynamic & Reusable Design**

* Shared utility modules (e.g., file uploader, mail sender, role checker).
* Schema-driven API generation where possible.
* Configurable feature flags for premium / subscription-based modules.

### 10. **Environment Management**

* Maintain `.env.example` with all required vars.
* Use `dotenv-flow` for multi-env support.

### 11. **Performance & Scalability**

* Enable Fastify plugins for compression and rate limiting.
* Use connection pooling and Redis caching for heavy queries.
* Asynchronous non-blocking service calls.

---

## 🔐 Core Modules (API Overview)

| Module                             | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| **Authentication & Authorization** | JWT tokens, refresh flow, password reset         |
| **User Management**                | Profile, avatar uploads, wallet, referral, goals |
| **Quiz Management**                | Progressive unlock, scoring, difficulty filter   |
| **Pronunciation**                  | AI speech evaluation & feedback                  |
| **Voice Call**                     | WebRTC signaling via SignalR, TURN/STUN          |
| **Daily Topics**                   | Categorized topic management, AI suggestions     |
| **Subscription Management**        | Plans, free trials, renewals, role upgrade       |
| **Coupon Management**              | Discounts, referral integration                  |
| **Payment & Wallet**               | Transactions, withdrawals, course payments       |
| **Referral System**                | Referral code generation, tracking, rewards      |
| **Instructor Management**          | Onboarding, approval, performance analytics      |
| **Admin Panel**                    | Platform config, analytics, revenue dashboard    |
| **File Storage**                   | File upload, CDN delivery, asset access          |

---

## 🌐 External Dependencies

* **Email Service:** Nodemailer
* **Cache Layer:** Redis
* **File Storage:** S3 / Azure Blob
* **AI Speech:** Azure Speech / SpeechSuper API
* **Signaling:** SignalR + TURN/STUN
* **Payments:** Stripe / RazorPay

---

## 🧠 Summary

This backend will follow a **modular, scalable, and secure architecture** using **Fastify.js**, ensuring a plug-and-play design for future expansion. Each layer (route → middleware → validator → controller → service) will be **strictly separated** for maintainability and testability.


