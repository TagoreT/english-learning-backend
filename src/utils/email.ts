import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { ExternalServiceError } from './errors';
import { ErrorCode } from '../constants/errorCodes';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (env.EMAIL_SERVICE === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    } else if (env.EMAIL_SERVICE === 'sendgrid') {
      // SendGrid configuration using SMTP
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: env.SENDGRID_API_KEY,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.warn('Email service not configured - email not sent:', options.subject);
      return; // Silently skip in development/testing
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log('Email sent successfully:', options.subject, 'to:', options.to);
    } catch (error) {
      console.error('Email send error:', error);
      // Don't throw - allow operation to continue for testing
      console.warn('Email not sent but continuing operation');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to English Learning Platform!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #6B7280;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px;">
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - English Learning Platform',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #6B7280;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - English Learning Platform',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to English Learning Platform, ${name}!</h2>
        <p>Your email has been verified successfully. You can now start learning!</p>
        <p>Here are some things you can do:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Browse available courses</li>
          <li>Start your first quiz</li>
          <li>Practice pronunciation</li>
        </ul>
        <a href="${env.FRONTEND_URL}/dashboard"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Go to Dashboard
        </a>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to English Learning Platform',
      html,
    });
  }

  async sendSubscriptionConfirmation(email: string, planName: string, endDate: Date): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Subscription Confirmed!</h2>
        <p>Your subscription to the <strong>${planName}</strong> plan has been confirmed.</p>
        <p>Your subscription is valid until: <strong>${endDate.toLocaleDateString()}</strong></p>
        <p>Thank you for subscribing!</p>
        <a href="${env.FRONTEND_URL}/subscription"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Subscription
        </a>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Subscription Confirmed - English Learning Platform',
      html,
    });
  }
}

export const emailService = new EmailService();
