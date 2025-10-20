import { PrismaClient } from '@prisma/client';
import { PasswordHelper } from '../src/utils/password';
import { generateReferralCode } from '../src/utils/referralCode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create subscription plans
  console.log('Creating subscription plans...');

  const basicPlan = await prisma.plan.upsert({
    where: { id: 'basic-plan-id' },
    update: {},
    create: {
      id: 'basic-plan-id',
      name: 'Basic Plan',
      interval: 'monthly',
      price: 9.99,
      trialDays: 7,
      features: {
        courses: 'unlimited',
        quizzes: 'unlimited',
        pronunciation: 'limited',
        support: 'email',
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'pro-plan-id' },
    update: {},
    create: {
      id: 'pro-plan-id',
      name: 'Pro Plan',
      interval: 'monthly',
      price: 19.99,
      trialDays: 14,
      features: {
        courses: 'unlimited',
        quizzes: 'unlimited',
        pronunciation: 'unlimited',
        voiceCalls: 'unlimited',
        support: 'priority',
      },
    },
  });

  const yearlyPlan = await prisma.plan.upsert({
    where: { id: 'yearly-plan-id' },
    update: {},
    create: {
      id: 'yearly-plan-id',
      name: 'Yearly Pro Plan',
      interval: 'yearly',
      price: 199.99,
      trialDays: 14,
      features: {
        courses: 'unlimited',
        quizzes: 'unlimited',
        pronunciation: 'unlimited',
        voiceCalls: 'unlimited',
        support: 'priority',
        discount: '20% off',
      },
    },
  });

  console.log('✅ Created plans:', {
    basic: basicPlan.name,
    pro: proPlan.name,
    yearly: yearlyPlan.name,
  });

  // Create admin user
  console.log('Creating admin user...');

  const adminPassword = await PasswordHelper.hash('Admin@1234');
  const adminReferralCode = generateReferralCode();

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@englishlearning.com' },
    update: {},
    create: {
      email: 'admin@englishlearning.com',
      fullName: 'System Admin',
      hashedPassword: adminPassword,
      role: 'SUPERADMIN',
      referralCode: adminReferralCode,
      isVerified: true,
      profile: {
        create: {
          bio: 'System Administrator',
        },
      },
      admin: {
        create: {
          permissions: {
            all: true,
          },
        },
      },
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create sample instructor
  console.log('Creating sample instructor...');

  const instructorPassword = await PasswordHelper.hash('Instructor@1234');
  const instructorReferralCode = generateReferralCode();

  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@englishlearning.com' },
    update: {},
    create: {
      email: 'instructor@englishlearning.com',
      fullName: 'John Instructor',
      hashedPassword: instructorPassword,
      role: 'INSTRUCTOR',
      referralCode: instructorReferralCode,
      isVerified: true,
      profile: {
        create: {
          bio: 'Experienced English teacher with 10 years of teaching experience.',
        },
      },
      instructor: {
        create: {
          approved: true,
          bio: 'Professional English instructor specializing in IELTS preparation and business English.',
          rating: 4.8,
        },
      },
    },
  });

  console.log('✅ Created instructor user:', instructorUser.email);

  // Create sample student
  console.log('Creating sample student...');

  const studentPassword = await PasswordHelper.hash('Student@1234');
  const studentReferralCode = generateReferralCode();

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@englishlearning.com' },
    update: {},
    create: {
      email: 'student@englishlearning.com',
      fullName: 'Jane Student',
      hashedPassword: studentPassword,
      role: 'USER',
      referralCode: studentReferralCode,
      isVerified: true,
      walletBalance: 100,
      profile: {
        create: {
          bio: 'Learning English to improve my career prospects.',
          learningGoals: 'Achieve IELTS 7.5 band score',
          languageLevel: 'B2_UPPER_INTERMEDIATE',
        },
      },
    },
  });

  console.log('✅ Created student user:', studentUser.email);

  // Create sample topics
  console.log('Creating sample topics...');

  const topics = [
    { title: 'Daily Conversation', category: 'Speaking', content: 'Everyday conversations and phrases' },
    { title: 'Business English', category: 'Professional', content: 'Email writing, presentations, meetings' },
    { title: 'IELTS Preparation', category: 'Test Prep', content: 'Tips and strategies for IELTS exam' },
    { title: 'Grammar Basics', category: 'Grammar', content: 'Fundamental English grammar rules' },
    { title: 'Pronunciation Practice', category: 'Speaking', content: 'Common pronunciation challenges' },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { id: topic.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: topic.title.toLowerCase().replace(/\s+/g, '-'),
        ...topic,
        isPublic: true,
      },
    });
  }

  console.log('✅ Created', topics.length, 'sample topics');

  // Create sample coupons
  console.log('Creating sample coupons...');

  const welcomeCoupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME2024' },
    update: {},
    create: {
      code: 'WELCOME2024',
      discountType: 'PERCENTAGE',
      value: 20,
      usageLimit: 100,
      expiresAt: new Date('2024-12-31'),
    },
  });

  const promoCodeCoupon = await prisma.coupon.upsert({
    where: { code: 'SAVE50' },
    update: {},
    create: {
      code: 'SAVE50',
      discountType: 'FIXED',
      value: 50,
      usageLimit: 50,
      expiresAt: new Date('2024-12-31'),
    },
  });

  console.log('✅ Created sample coupons');

  console.log('\n🎉 Database seeding completed successfully!\n');

  console.log('📝 Test Accounts:');
  console.log('─────────────────────────────────────────');
  console.log('Admin:');
  console.log('  Email: admin@englishlearning.com');
  console.log('  Password: Admin@1234');
  console.log('');
  console.log('Instructor:');
  console.log('  Email: instructor@englishlearning.com');
  console.log('  Password: Instructor@1234');
  console.log('');
  console.log('Student:');
  console.log('  Email: student@englishlearning.com');
  console.log('  Password: Student@1234');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
