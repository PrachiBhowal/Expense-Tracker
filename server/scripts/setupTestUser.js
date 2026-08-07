require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

async function run() {
  await mongoose.connect(MONGO);
  console.log('Connected to MongoDB');

  const email = 'test+local@example.com';
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ username: 'testlocal', email, password: 'Initial1' });
    await user.save();
    console.log('Created test user:', email);
  } else {
    console.log('Test user already exists:', email);
  }

  user.passwordResetCode = '123456';
  user.passwordResetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  console.log('Set passwordResetCode to 123456 (expires in 15 minutes)');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
