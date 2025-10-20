# Quick Start Guide

Get the English Learning Platform backend up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js v18+ installed ([check with `node -v`])
- ✅ PostgreSQL running ([check with `psql --version`])
- ✅ Redis running ([check with `redis-cli ping`])

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Setup Database (1 min)

```bash
# Create the database in PostgreSQL
createdb english_learning_db

# Or using psql:
psql -U postgres -c "CREATE DATABASE english_learning_db;"
```

### Step 3: Run Migrations (1 min)

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 4: Seed Sample Data (1 min)

```bash
npm run prisma:seed
```

This creates:
- 3 subscription plans (Basic, Pro, Yearly)
- 3 test users (Admin, Instructor, Student)
- 5 sample topics
- 2 coupon codes

### Step 5: Start Server (1 min)

```bash
npm run dev
```

## ✅ Verify Setup

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **API Docs:**
   Open [http://localhost:3000/docs](http://localhost:3000/docs) in your browser

3. **Test Login:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@englishlearning.com","password":"Student@1234"}'
   ```

## 🎉 You're Ready!

### Test Accounts

**Student Account:**
- Email: `student@englishlearning.com`
- Password: `Student@1234`

**Instructor Account:**
- Email: `instructor@englishlearning.com`
- Password: `Instructor@1234`

**Admin Account:**
- Email: `admin@englishlearning.com`
- Password: `Admin@1234`

### Next Steps

1. **Explore API Docs**: [http://localhost:3000/docs](http://localhost:3000/docs)
2. **Try the endpoints** using Swagger UI or Postman
3. **View database** with `npm run prisma:studio`
4. **Read full setup guide**: [SETUP.md](./SETUP.md)

### Common Commands

```bash
npm run dev              # Start development server
npm run prisma:studio   # Open database GUI
npm run prisma:seed     # Re-seed database
npm test                # Run tests
```

## Need Help?

- 📖 Full Setup Guide: [SETUP.md](./SETUP.md)
- 📚 Documentation: [README.md](./README.md)
- 🐛 Issues? Check [SETUP.md](./SETUP.md) troubleshooting section

---

**Tip:** Keep the server running and make changes to files in `src/`. The server auto-restarts on file changes!
