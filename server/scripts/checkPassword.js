require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

async function run() {
  await mongoose.connect(MONGO);
  const email = 'test+local@example.com';
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
    await mongoose.disconnect();
    return;
  }

  const ok = await user.comparePassword('NewPass1');
  console.log('Password matches NewPass1?:', ok);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
