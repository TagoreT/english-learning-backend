# Setup Guide - English Learning Platform Backend

## Quick Start (Development)

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v13+ ([Download](https://www.postgresql.org/download/))
- **Redis** v6+ ([Download](https://redis.io/download))
- **Git**

### 2. Database Setup

#### PostgreSQL

1. **Start PostgreSQL** (if not running)
   ```bash
   # Windows (if installed as service, it's usually auto-started)
   # Or use pgAdmin

   # Linux/Mac
   sudo service postgresql start
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE english_learning_db;

   # Exit
   \q
   ```

#### Redis

1. **Start Redis**
   ```bash
   # Windows (if installed via WSL or native)
   redis-server

   # Linux
   sudo service redis-server start

   # Mac
   brew services start redis
   ```

2. **Verify Redis is running**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Configuration

The `.env` file has been created with development defaults. Update the following if needed:

```env
# Update PostgreSQL connection if different
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/english_learning_db

# Update Redis if different
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed initial data - create this script if needed
```

### 6. Start Development Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎓 English Learning Platform API                   ║
║                                                       ║
║   Environment: development                            ║
║   Server:      http://0.0.0.0:3000                   ║
║   API Docs:    http://0.0.0.0:3000/docs              ║
║   API Version: v1                                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

### 7. Verify Setup

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "services": {
       "database": "up",
       "redis": "up"
     }
   }
   ```

2. **API Documentation**

   Open in browser: [http://localhost:3000/docs](http://localhost:3000/docs)

3. **Test Registration**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "fullName": "Test User",
       "password": "Test@1234"
     }'
   ```

## Common Issues & Solutions

### Issue: Database connection error

**Solution:**
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d english_learning_db
   ```

### Issue: Redis connection error

**Solution:**
1. Check Redis is running:
   ```bash
   redis-cli ping
   ```
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`

### Issue: Port 3000 already in use

**Solution:**
1. Change port in `.env`:
   ```env
   PORT=3001
   ```
2. Or kill the process using port 3000

### Issue: Prisma migration errors

**Solution:**
1. Reset database (WARNING: deletes all data):
   ```bash
   npx prisma migrate reset
   ```
2. Re-run migrations:
   ```bash
   npm run prisma:migrate
   ```

### Issue: Missing environment variables

**Solution:**
Check `.env` file exists and contains all required variables from `.env.example`

## Next Steps

### 1. Configure Email Service (Optional but recommended)

For email verification and password reset to work:

1. **Using Gmail:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Update `.env`:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASSWORD=your-app-password
     EMAIL_FROM=your-email@gmail.com
     ```

2. **Using SendGrid:**
   - Sign up at [https://sendgrid.com/](https://sendgrid.com/)
   - Create API key
   - Update `.env`:
     ```env
     EMAIL_SERVICE=sendgrid
     SENDGRID_API_KEY=your-api-key
     ```

### 2. Configure File Storage (Optional)

For avatar and file uploads:

1. **Using AWS S3:**
   - Create S3 bucket
   - Create IAM user with S3 access
   - Update `.env`:
     ```env
     AWS_ACCESS_KEY_ID=your-key
     AWS_SECRET_ACCESS_KEY=your-secret
     AWS_REGION=us-east-1
     AWS_S3_BUCKET=your-bucket-name
     ```

### 3. Configure Payment Gateway (Optional)

For subscriptions and payments:

1. **Using Stripe (Recommended):**
   - Sign up at [https://stripe.com](https://stripe.com)
   - Get test API keys from dashboard
   - Update `.env`:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

### 4. Prisma Studio (Database GUI)

To view and edit database records visually:

```bash
npm run prisma:studio
```

Opens at: [http://localhost:5555](http://localhost:5555)

### 5. Testing

Run tests:
```bash
npm test
```

### 6. Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Development Workflow

1. **Make changes** to source files in `src/`
2. **Server auto-restarts** (thanks to `tsx watch`)
3. **Test endpoints** using:
   - Swagger UI at `/docs`
   - Postman/Insomnia
   - curl commands

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server with hot reload
npm run build              # Build for production
npm start                  # Start production server

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio

# Code Quality
npm run lint              # Check linting
npm run lint:fix          # Fix linting issues
npm run format            # Format code with Prettier

# Testing
npm test                  # Run tests
npm run test:watch        # Run tests in watch mode
```

## Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Fastify Server              │
│  ┌───────────────────────────────┐  │
│  │  Middlewares (Auth, RBA)      │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Routes                       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Controllers                  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Services (Business Logic)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │
│  (Prisma)    │    │   (Cache)    │
└──────────────┘    └──────────────┘
```

## Support

If you encounter any issues:

1. Check this setup guide
2. Review error messages carefully
3. Check logs in terminal
4. Verify all services (PostgreSQL, Redis) are running
5. Ensure environment variables are correctly set

---

Happy coding! 🚀
