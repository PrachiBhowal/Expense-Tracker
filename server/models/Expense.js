const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title:     { type: String, required: true, trim: true },
  amount:    { type: Number, required: true },
  category:  {
    type: String,
    enum: ['food', 'transport', 'shopping', 'health', 'entertainment', 'music','bills', 'other'],
    default: 'other'
  },
  note:      { type: String, trim: true },
  date:      { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);