const router = require('express').Router();
const User = require('../models/User');
const { sendVerificationEmail, generateVerificationCode, sendPasswordResetEmail } = require('../utils/email');

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 600000);

    const user = new User({
      username,
      email,
      password,
      verificationCode,
      verificationCodeExpires
    });
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: 'Account created! Check your email for the verification code.',
      email: email,
      needsVerification: true
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
});

// VERIFY EMAIL
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(401).json({ message: 'Verification code expired' });
    }

    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Email verified successfully!',
      username: user.username,
      userId: user._id
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email first',
        email: email,
        needsVerification: true 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Logged in successfully',
      username: user.username,
      userId: user._id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// FORGOT PASSWORD - Step 1: Send reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetCode = generateVerificationCode();
    const passwordResetCodeExpires = new Date(Date.now() + 900000); // 15 minutes

    user.passwordResetCode = resetCode;
    user.passwordResetCodeExpires = passwordResetCodeExpires;
    await user.save();

    await sendPasswordResetEmail(email, resetCode);

    res.json({
      message: 'Password reset code sent to your email',
      email: email
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: err.message });
  }
});

// RESET PASSWORD - Step 2: Verify code and reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.passwordResetCode !== code) {
      return res.status(401).json({ message: 'Invalid reset code' });
    }

    if (new Date() > user.passwordResetCodeExpires) {
      return res.status(401).json({ message: 'Reset code expired' });
    }

    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetCodeExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: err.message });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// GET current user
router.get('/me', (req, res) => {
  if (req.session.userId) {
    res.json({
      userId: req.session.userId,
      username: req.session.username
    });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

module.exports = router;