import dotenv from 'dotenv';
import dotenvFlow from 'dotenv-flow';

// Load environment variables
dotenvFlow.config();

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  API_VERSION: string;

  // Database
  DATABASE_URL: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;

  // JWT
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;

  // Email
  EMAIL_SERVICE: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  EMAIL_FROM: string;
  SENDGRID_API_KEY?: string;

  // AWS S3
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  AWS_CLOUDFRONT_URL?: string;

  // Azure
  AZURE_STORAGE_ACCOUNT?: string;
  AZURE_STORAGE_KEY?: string;
  AZURE_STORAGE_CONTAINER?: string;
  AZURE_SPEECH_KEY?: string;
  AZURE_SPEECH_REGION?: string;

  // SpeechSuper
  SPEECHSUPER_APP_KEY?: string;
  SPEECHSUPER_SECRET_KEY?: string;

  // Payment
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;

  // WebRTC
  TURN_SERVER_URL?: string;
  TURN_USERNAME?: string;
  TURN_CREDENTIAL?: string;
  STUN_SERVER_URL?: string;
  SIGNALR_HUB_PATH: string;

  // Rate Limiting
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_TIME_WINDOW: string;

  // CORS
  CORS_ORIGIN: string;

  // URLs
  FRONTEND_URL: string;
  BACKEND_URL: string;

  // File Upload
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;

  // Referral
  REFERRAL_REWARD_AMOUNT: number;
  REFERRER_BONUS_AMOUNT: number;

  // Subscription
  DEFAULT_TRIAL_DAYS: number;

  // Admin
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;

  // Logging
  LOG_LEVEL: string;
}

const getEnvValue = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return parsed;
};

export const env: EnvConfig = {
  // Server
  NODE_ENV: getEnvValue('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3000),
  HOST: getEnvValue('HOST', '0.0.0.0'),
  API_VERSION: getEnvValue('API_VERSION', 'v1'),

  // Database
  DATABASE_URL: getEnvValue('DATABASE_URL'),

  // Redis
  REDIS_HOST: getEnvValue('REDIS_HOST', 'localhost'),
  REDIS_PORT: getEnvNumber('REDIS_PORT', 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: getEnvValue('JWT_SECRET'),
  JWT_ACCESS_EXPIRES_IN: getEnvValue('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnvValue('JWT_REFRESH_EXPIRES_IN', '7d'),
  REFRESH_TOKEN_SECRET: getEnvValue('REFRESH_TOKEN_SECRET'),

  // Email
  EMAIL_SERVICE: getEnvValue('EMAIL_SERVICE', 'smtp'),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  EMAIL_FROM: getEnvValue('EMAIL_FROM'),
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  // AWS
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_CLOUDFRONT_URL: process.env.AWS_CLOUDFRONT_URL,

  // Azure
  AZURE_STORAGE_ACCOUNT: process.env.AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_KEY: process.env.AZURE_STORAGE_KEY,
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER,
  AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
  AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,

  // SpeechSuper
  SPEECHSUPER_APP_KEY: process.env.SPEECHSUPER_APP_KEY,
  SPEECHSUPER_SECRET_KEY: process.env.SPEECHSUPER_SECRET_KEY,

  // Payment
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,

  // WebRTC
  TURN_SERVER_URL: process.env.TURN_SERVER_URL,
  TURN_USERNAME: process.env.TURN_USERNAME,
  TURN_CREDENTIAL: process.env.TURN_CREDENTIAL,
  STUN_SERVER_URL: process.env.STUN_SERVER_URL,
  SIGNALR_HUB_PATH: getEnvValue('SIGNALR_HUB_PATH', '/signalr'),

  // Rate Limiting
  RATE_LIMIT_MAX: getEnvNumber('RATE_LIMIT_MAX', 100),
  RATE_LIMIT_TIME_WINDOW: getEnvValue('RATE_LIMIT_TIME_WINDOW', '15m'),

  // CORS
  CORS_ORIGIN: getEnvValue('CORS_ORIGIN', 'http://localhost:3001'),

  // URLs
  FRONTEND_URL: getEnvValue('FRONTEND_URL', 'http://localhost:3001'),
  BACKEND_URL: getEnvValue('BACKEND_URL', 'http://localhost:3000'),

  // File Upload
  MAX_FILE_SIZE: getEnvNumber('MAX_FILE_SIZE', 10485760),
  ALLOWED_FILE_TYPES: getEnvValue('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,audio/mpeg'),

  // Referral
  REFERRAL_REWARD_AMOUNT: getEnvNumber('REFERRAL_REWARD_AMOUNT', 50),
  REFERRER_BONUS_AMOUNT: getEnvNumber('REFERRER_BONUS_AMOUNT', 100),

  // Subscription
  DEFAULT_TRIAL_DAYS: getEnvNumber('DEFAULT_TRIAL_DAYS', 7),

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  // Logging
  LOG_LEVEL: getEnvValue('LOG_LEVEL', 'info'),
};
