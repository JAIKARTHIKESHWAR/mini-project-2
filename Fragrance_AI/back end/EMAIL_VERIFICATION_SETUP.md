# 📧 Email Verification Setup Guide

## Overview
This guide explains how to set up email verification for the Fragrance AI application using Gmail SMTP with Nodemailer.

## 🔧 Environment Variables

Add the following variables to your `.env` file in the `back end` directory:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Other required variables (already in your .env)
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
MONGO_URI=your-mongodb-connection-string
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

## 📋 Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)

### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Fragrance AI Backend" as the name
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
7. Use this password in your `.env` file as `EMAIL_PASS` (remove spaces: `abcdefghijklmnop`)

### Alternative: Less Secure Apps (NOT RECOMMENDED)
⚠️ **Warning**: Less secure apps is deprecated by Google. Use App Passwords instead.

If you must use it:
1. Go to [Less Secure Apps](https://myaccount.google.com/lesssecureapps)
2. Enable it
3. Use your regular Gmail password as `EMAIL_PASS`

## 🔐 Security Notes

- **Never commit** `.env` file to git
- App Passwords are specific to the application
- You can revoke app passwords anytime from Google Account settings
- Each app password works independently of your main Gmail password

## 📧 Email Template

The verification email includes:
- Professional HTML design
- Clear call-to-action button
- Expiration warning (10 minutes)
- Fallback text link
- Branded Fragrance AI styling

## 🧪 Testing Email Verification

### 1. Test Email Sending
```bash
# Start your backend server
npm start

# The server will log email sending attempts:
# 📧 Attempting to send verification email to: user@example.com
# ✅ Verification email sent successfully!
```

### 2. Test Registration Flow
1. Sign up with a new email
2. Check your email inbox (and spam folder)
3. Click the verification link
4. Should redirect to `/verify-email?status=success`
5. Then login with verified credentials

### 3. Test Resend Verification
1. Try to login with unverified email
2. Click "Resend verification email" button
3. Check email for new verification link

### 4. Test Expired Token
1. Wait 10+ minutes after receiving email
2. Click the verification link
3. Should show "expired" error
4. Use resend functionality

## 🐛 Troubleshooting

### Email Not Sending

**Check Console Logs:**
```bash
# Look for these messages:
❌ Email configuration missing: EMAIL_USER and EMAIL_PASS must be set
❌ Failed to send verification email: [error details]
```

**Common Issues:**

1. **Invalid Credentials**
   - Verify `EMAIL_USER` matches your Gmail address exactly
   - Verify `EMAIL_PASS` is the correct App Password (16 characters, no spaces)

2. **App Password Not Working**
   - Regenerate App Password from Google Account
   - Ensure 2-Step Verification is enabled
   - Wait 5 minutes after generating new password

3. **SMTP Connection Errors**
   - Check internet connection
   - Verify firewall isn't blocking port 587
   - Try using port 465 with `secure: true` in emailService.js

4. **Email in Spam Folder**
   - Check spam/junk folder
   - Mark as "Not Spam" to improve deliverability
   - Consider using professional email service (SendGrid, Mailgun) for production

### Modify SMTP Settings (if needed)

Edit `back end/services/emailService.js`:

```javascript
// For Gmail with different settings:
return nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,  // or 587
  secure: true,  // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For other providers (e.g., Outlook):
return nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## ✅ Verification Features

- ✅ JWT-based verification tokens (10-minute expiration)
- ✅ Automatic email sending on signup
- ✅ Resend verification email functionality
- ✅ Block login for unverified users
- ✅ Clean verification page with status messages
- ✅ Token expiration handling
- ✅ Already verified detection
- ✅ OAuth users skip email verification (Google/Facebook)

## 📝 API Routes

- `POST /api/auth/register` - Creates account and sends verification email
- `GET /api/auth/verify/:token` - Verifies email token
- `POST /api/auth/resend-verification` - Resends verification email
- `POST /api/auth/login` - Blocks unverified local users

## 🚀 Production Recommendations

For production, consider:
1. **Professional Email Service**: SendGrid, Mailgun, AWS SES
2. **Email Queue**: Bull/BullMQ for handling email delivery
3. **Rate Limiting**: Limit resend verification requests
4. **Email Templates**: Use services like SendGrid Templates or MJML
5. **Monitoring**: Track email delivery rates and failures

