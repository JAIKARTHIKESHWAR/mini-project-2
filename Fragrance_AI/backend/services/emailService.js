import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Create Nodemailer transporter for Gmail SMTP
 */
const createTransporter = () => {
  // Validate email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration missing: EMAIL_USER and EMAIL_PASS must be set in .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send verification email to user
 * @param {String} email - User's email address
 * @param {String} verificationToken - JWT token for email verification
 * @param {String} firstName - User's first name (optional)
 * @returns {Promise<Object>} - Email send result
 */
export const sendVerificationEmail = async (email, verificationToken, firstName = 'User') => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Fragrance AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Fragrance AI Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #1a73e8;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #202124;
              margin: 20px 0;
            }
            .content {
              color: #5f6368;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 32px;
              background-color: #1a73e8;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #1557b0;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .link-text {
              color: #5f6368;
              font-size: 14px;
              word-break: break-all;
              margin-top: 20px;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e8eaed;
              color: #5f6368;
              font-size: 12px;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-text {
              color: #856404;
              font-size: 14px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌸 Fragrance AI</div>
            </div>
            
            <h1 class="title">Verify Your Email Address</h1>
            
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Thank you for signing up for Fragrance AI! To complete your registration and start discovering your perfect scent, please verify your email address by clicking the button below.</p>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="link-text">${verificationUrl}</div>
              
              <div class="warning">
                <p class="warning-text"><strong>⚠️ Important:</strong> This verification link will expire in <strong>10 minutes</strong>. If you didn't create an account with Fragrance AI, you can safely ignore this email.</p>
              </div>
              
              <p>Once verified, you'll be able to log in and start exploring personalized fragrance recommendations powered by AI.</p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Fragrance AI Team</p>
              <p style="margin-top: 20px; color: #9aa0a6;">This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your Fragrance AI Account
        
        Hi ${firstName},
        
        Thank you for signing up for Fragrance AI! To complete your registration, please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This link will expire in 10 minutes.
        
        If you didn't create an account with Fragrance AI, you can safely ignore this email.
        
        Best regards,
        The Fragrance AI Team
      `
    };

    console.log(`📧 Sending verification email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Verification email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${email}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email
    };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {String} email - User's email address
 * @param {String} resetToken - JWT token for password reset
 * @param {String} firstName - User's first name (optional)
 * @returns {Promise<Object>} - Email send result
 */
export const sendPasswordResetEmail = async (email, resetToken, firstName = 'User') => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Fragrance AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Fragrance AI Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #1a73e8;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #202124;
              margin: 20px 0;
            }
            .content {
              color: #5f6368;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 32px;
              background-color: #1a73e8;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #1557b0;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .link-text {
              color: #5f6368;
              font-size: 14px;
              word-break: break-all;
              margin-top: 20px;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e8eaed;
              color: #5f6368;
              font-size: 12px;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-text {
              color: #856404;
              font-size: 14px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌸 Fragrance AI</div>
            </div>
            
            <h1 class="title">Reset Your Password</h1>
            
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>We received a request to reset your password for your Fragrance AI account. Click the button below to create a new password:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button" style="color: #ffffff !important;">Reset Password</a>
              </div>
              
              <div class="warning">
                <p class="warning-text"><strong>⚠️ Important:</strong> This password reset link will expire in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              </div>
              
              <p>For security reasons, if you didn't request this password reset, please contact our support team immediately.</p>
              <p style="margin-top: 8px; color: #5f6368;">Support Team: <a href="mailto:jaikarthikeshwar.work@gmail.com" style="color: #1a73e8; text-decoration: none;">jaikarthikeshwar.work@gmail.com</a></p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Fragrance AI Team</p>
              <p style="margin-top: 20px; color: #9aa0a6;">This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Fragrance AI Password
        
        Hi ${firstName},
        
        We received a request to reset your password. Click the link below to create a new password:
        
        ${resetUrl}
        
        This link will expire in 10 minutes.
        
        If you didn't request this password reset, you can safely ignore this email.
        
        Best regards,
        The Fragrance AI Team
      `
    };

    console.log(`📧 Sending password reset email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Password reset email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${email}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email
    };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail
};

