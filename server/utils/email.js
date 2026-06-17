const nodemailer = require('nodemailer');

let transporter;

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
}

transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, verificationCode) => {
  const mailOptions = {
    from: 'noreply@expensetracker.com',
    to: email,
    subject: 'Verify Your Email - Expense Tracker',
    html: `
      <h2>Welcome to Expense Tracker!</h2>
      <p>Please verify your email with this code:</p>
      <div style="background: #f7f5ff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; margin: 0; color: #8b5cf6; font-family: monospace;">
          ${verificationCode}
        </h1>
      </div>
      <p>This code expires in 10 minutes.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error('Email send error:', err);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetEmail = async (email, resetCode) => {
  const mailOptions = {
    from: 'noreply@expensetracker.com',
    to: email,
    subject: 'Reset Your Password - Expense Tracker',
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Use this code to reset it:</p>
      <div style="background: #f7f5ff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; margin: 0; color: #8b5cf6; font-family: monospace;">
          ${resetCode}
        </h1>
      </div>
      <p>This code expires in 15 minutes.</p>
      <p style="color: #aaa; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error('Email send error:', err);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = { sendVerificationEmail, generateVerificationCode, sendPasswordResetEmail };