# English Learning Platform - Backend API

A comprehensive, production-ready backend for an English learning platform built with **Fastify**, **Prisma**, **PostgreSQL**, and **Redis**.

## 🚀 Features

- **Authentication & Authorization**: JWT + Refresh tokens, email verification, password reset
- **User Management**: Profiles, avatars, wallet system, referral rewards
- **Course Management**: Create, publish, enroll, track progress
- **Quiz System**: Progressive unlock, difficulty levels, scoring
- **Pronunciation Assessment**: Azure Speech API integration
- **Subscription Management**: Plans, trials, auto-renewal
- **Payment Processing**: Stripe/Razorpay integration, wallet, withdrawals
- **Referral System**: Code generation, tracking, automatic rewards
- **Coupon Management**: Multi-tier discounts, usage limits
- **Instructor Platform**: Onboarding, approval, course creation
- **Admin Panel**: User management, analytics, system config
- **Real-time Features**: WebRTC signaling (ready for voice calls)
- **Background Workers**: BullMQ for async tasks (pronunciation eval, emails)
- **File Storage**: AWS S3/Azure Blob with CDN
- **API Documentation**: OpenAPI/Swagger

## 🏗️ Tech Stack

- **Framework**: Fastify.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: AWS S3 SDK
- **Email**: Nodemailer
- **Payments**: Stripe
- **Testing**: Jest
- **Language**: TypeScript

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6
- npm >= 9.0.0

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd english-learning-tarun
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your environment variables.

4. **Database setup**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Open Prisma Studio to view/edit data
   npm run prisma:studio
   ```

5. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## 📚 Project Structure

```
src/
├── config/           # Configuration files (database, redis, env)
├── constants/        # Constants (roles, messages, error codes)
├── controllers/      # Request handlers
├── middlewares/      # Auth, RBA, validation middlewares
├── routes/           # Route definitions
├── services/         # Business logic layer
├── validators/       # Zod schemas for request validation
├── utils/            # Utility functions (JWT, email, file upload)
├── plugins/          # Fastify plugins
├── workers/          # Background job workers
├── app.ts            # Fastify app setup
└── server.ts         # Server entry point
```

## 🔑 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# Payment
STRIPE_SECRET_KEY=sk_test_...
```

## 🛣️ API Routes

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/profile` - Get current user

### Users
- `PUT /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/avatar` - Update avatar
- `GET /api/v1/users/wallet` - Get wallet balance
- `GET /api/v1/users/transactions` - Get transactions
- `GET /api/v1/users/stats` - Get user stats

### Courses (examples - implement similar patterns)
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses` - List courses
- `GET /api/v1/courses/:id` - Get course details
- `POST /api/v1/courses/:id/enroll` - Enroll in course

## 📖 API Documentation

When running in development mode, visit:
```
http://localhost:3000/docs
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## 🔒 Security Features

- JWT access & refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation with Zod
- SQL injection prevention (Prisma)
- Token blacklisting for logout

## 🚦 Development Flow

**Request Flow**: `Route → Middleware (Auth/RBA) → Validator → Controller → Service`

Example:
```
POST /api/v1/auth/login
  → authRoutes
  → loginSchema validation
  → authController.login()
  → authService.login()
  → Response
```

## 🏃 Running in Production

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set environment to production**
   ```env
   NODE_ENV=production
   ```

3. **Run migrations**
   ```bash
   npm run prisma:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🐛 Debugging

Enable detailed logging:
```env
LOG_LEVEL=debug
```

## 📝 Code Style

- **ESLint** for linting
- **Prettier** for formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🤝 Contributing

1. Follow the existing folder structure
2. Use TypeScript strict mode
3. Write tests for new features
4. Follow the service-controller pattern
5. Validate all inputs with Zod
6. Document API changes in Swagger

## 📄 License

MIT

## 🔧 Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `npm run prisma:migrate`

### Redis connection issues
- Ensure Redis is running
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### Port already in use
- Change `PORT` in `.env`
- Or kill the process using the port

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using Fastify, Prisma, and TypeScript
