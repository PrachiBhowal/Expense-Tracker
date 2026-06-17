const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  nextBillingDate: { 
    type: Date, 
    default: () => new Date(new Date().setMonth(new Date().getMonth() + 1))
  },
  category: {
    type: String,
    enum: ['entertainment', 'productivity', 'health', 'music', 'other'],
    default: 'other'
  },
  isActive: { type: Boolean, default: true },
  paidMonths: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);