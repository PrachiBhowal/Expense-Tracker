require('dotenv').config();
const validateEnv = require('./config/validateEnv');
validateEnv(); // Validate environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    secure: true, // Required for sameSite: 'none'
    sameSite: 'none', // Required for cross-origin (Vercel → Render)
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use(cors({ 
  origin: 'https://expense-tracker-five-zeta-58.vercel.app',
  credentials: true 
}));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Email test route - visit this URL to test Resend API
app.get('/api/test-email', async (req, res) => {
  try {
    const { Resend } = require('resend');
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ success: false, error: 'RESEND_API_KEY not set on server' });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.EMAIL_USER || 'test@example.com',
      subject: 'Test Email - Expense Tracker',
      html: '<p>If you see this, Resend is working!</p>'
    });
    if (error) {
      return res.status(500).json({ success: false, error: error.message, details: error });
    }
    res.json({ success: true, message: 'Resend is working!', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: err.code });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error details:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ message: err.message });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));