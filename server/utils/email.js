const axios = require('axios');

if (!process.env.BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY environment variable is required');
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'expensetracker75@gmail.com';
const FROM_NAME = 'Expense Tracker';

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json'
  }
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    await brevoClient.post('/smtp/email', {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email }],
      subject: 'Verify Your Email - Expense Tracker',
      htmlContent: `
        <h2>Welcome to Expense Tracker!</h2>
        <p>Please verify your email with this code:</p>
        <div style="background: #f7f5ff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; margin: 0; color: #8b5cf6; font-family: monospace;">
            ${verificationCode}
          </h1>
        </div>
        <p>This code expires in 10 minutes.</p>
      `
    });
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    console.error('Brevo email error:', errMsg);
    throw new Error(`Failed to send verification email: ${errMsg}`);
  }
};

const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    await brevoClient.post('/smtp/email', {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email }],
      subject: 'Reset Your Password - Expense Tracker',
      htmlContent: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use this code:</p>
        <div style="background: #f7f5ff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; margin: 0; color: #8b5cf6; font-family: monospace;">
            ${resetCode}
          </h1>
        </div>
        <p>This code expires in 15 minutes.</p>
        <p style="color: #aaa; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      `
    });
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    console.error('Brevo password reset error:', errMsg);
    throw new Error(`Failed to send password reset email: ${errMsg}`);
  }
};

module.exports = { sendVerificationEmail, generateVerificationCode, sendPasswordResetEmail };