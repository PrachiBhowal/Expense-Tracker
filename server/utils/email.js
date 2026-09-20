const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Use resend.dev until you verify a domain

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log(`Verification email sent to ${email}`, data);
  } catch (err) {
    console.error('Email send error:', err.message);
    throw new Error(`Failed to send verification email: ${err.message}`);
  }
};

const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log(`Password reset email sent to ${email}`, data);
  } catch (err) {
    console.error('Password reset email error:', err.message);
    throw new Error(`Failed to send password reset email: ${err.message}`);
  }
};

module.exports = { sendVerificationEmail, generateVerificationCode, sendPasswordResetEmail };