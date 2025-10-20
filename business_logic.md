# English Learning Platform — Backend End-to-End Design

> Detailed backend architecture, data model, API design, services, third-party integrations, security, scaling, and deployment plan covering authentication, user management, quizzes, pronunciation assessment, WebRTC voice calls, subscriptions, payments, wallet & referral, instructor/admin workflows, file storage, and analytics.

---

## 1. High-level architecture

* **Client(s)**: Web (React/Next.js), Mobile (iOS/Android) — call REST/GraphQL + WebSocket for realtime.
* **API Layer**: RESTful API (or GraphQL) behind an API gateway. Use versioning (`/api/v1`).
* **Auth**: JWT access tokens (short-lived) + refresh tokens (rotating). Passwords hashed (bcrypt/Argon2).
* **Realtime**: WebSocket or SignalR server for presence & signaling (TURN/STUN support for WebRTC).
* **Media/Pronunciation**: Upload recorded audio to object storage; async job sends audio to Azure Speech or SpeechSuper API for scoring.
* **Database**: Relational DB (Postgres) as primary store. Use Redis for caching, locks, rate limits, and queues.
* **Background workers**: BullMQ / Celery for heavy tasks (AI evaluation, emails, invoices, subscription cron jobs).
* **File Storage / CDN**: S3 or Azure Blob Storage + CDN for avatars, course assets, audio recordings.
* **Payment**: Stripe or Razorpay for subscriptions and wallet top-ups; webhook integration for payment status.
* **Analytics & Logs**: ELK/Prometheus/Grafana for metrics; optional event queue (Kafka) for scale.

---

## 2. Core entities (DB tables - high level)

1. `users` (id, email, full_name, avatar_url, hashed_password, role, referral_code, wallet_balance, is_verified, created_at, updated_at)
2. `user_profiles` (user_id, bio, learning_goals, language_level, timezone)
3. `instructors` (user_id, approved, bio, rating)
4. `courses` (id, title, description, instructor_id, price, categories, tags, is_published)
5. `course_content` (id, course_id, type(video, pdf, quiz), metadata JSON, position)
6. `subscriptions` (id, user_id, plan_id, status, start_date, end_date, auto_renew)
7. `plans` (id, name, interval, price, trial_days)
8. `coupons` (code, discount_type, value, expires_at, usage_limit, multi_tier JSON)
9. `referrals` (referrer_id, referee_id, reward_amount, status)
10. `transactions` (id, user_id, amount, type, status, gateway_id, metadata)
11. `wallet_withdrawals` (user_id, amount, status, request_date, processed_date)
12. `quizzes` (id, course_id, title, difficulty, unlock_sequence)
13. `quiz_questions` (quiz_id, question_data, correct_answer, points)
14. `quiz_attempts` (user_id, quiz_id, score, details, created_at)
15. `pronunciations` (user_id, content_text, audio_url, score_json, feedback, created_at)
16. `topics` (id, title, category, suggested_by, is_public)
17. `calls` (id, caller_id, callee_id, room_id, started_at, ended_at, recording_url)
18. `admins` (user_id, permissions JSON)
19. `audit_logs` (actor_id, action, entity_type, entity_id, payload, created_at)

---

## 3. Authentication & Authorization

* **Register/Login**: JWT tokens, referral support, optional OTP verification.
* **Password management**: Argon2id or bcrypt.
* **Email verification**: tokenized links via Email Service (SendGrid, SES, or SMTP relay).
* **Role-based authorization**: roles `user`, `instructor`, `admin`, `superadmin`.
* **Secure token rotation**, refresh mechanism, and revocation list (Redis-based).

---

## 4. Pronunciation Assessment Flow

1. Record audio → upload to **S3/Azure Blob** via pre-signed URL.
2. Store record (status = queued) in DB.
3. Worker picks job → sends audio to **Azure Speech API / SpeechSuper API**.
4. AI response parsed (accuracy, fluency, feedback) → store `score_json`.
5. Notify user via Email/Socket (SignalR).

---

## 5. WebRTC Voice Calls (Realtime Communication)

* **SignalR Server** for signaling and real-time presence.
* **TURN/STUN Servers** (coturn or Twilio ICE) for NAT traversal.
* **Room management** via Redis pub/sub.
* Secure rooms and signaling authentication via JWT.

---

## 6. Payment, Wallet & Subscription System

* Gateways: **Stripe / Razorpay API**.
* Wallet ledger with transactions (credit/debit) + referral credits.
* Subscription with trials, renewal, cancellation.
* Coupons and referral system integrated into checkout.
* Webhooks handle async payment confirmation.

---

## 7. External Dependencies

| Dependency                         | Purpose                                                |
| ---------------------------------- | ------------------------------------------------------ |
| **Email Service**                  | Transactional emails (verification, notifications)     |
| **Redis**                          | Caching, queues, rate-limiting, pub/sub for signaling  |
| **S3 / Azure Blob**                | File storage for avatars, audio, and documents         |
| **CDN (CloudFront/Azure CDN)**     | Global asset delivery                                  |
| **Azure Speech / SpeechSuper API** | Pronunciation scoring and speech-to-text evaluation    |
| **SignalR**                        | Real-time signaling for voice calls and status updates |
| **TURN/STUN Server**               | WebRTC NAT traversal for peer connections              |
| **Stripe / Razorpay**              | Payment processing, subscription management            |

---

## 8. Observability & Security

* HTTPS, HSTS, JWT validation middleware.
* Rate-limit APIs using Redis.
* Logging & monitoring via ELK.
* Audit logs for admin actions.
* Regular backups & secret rotation.

---

## 9. Next Steps

* Generate OpenAPI Spec for APIs.
* Build Node.js (TypeScript) service skeleton with modular structure.
* Configure Redis, S3/Azure Blob, and SignalR setup.
* Integrate Azure Speech & Stripe/Razorpay sandbox for testing.
