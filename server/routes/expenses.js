const express = require('express');
const Expense = require('../models/Expense');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const { category, dateFrom, dateTo } = req.query;
    let filter = { userId: req.userId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, note, date } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = await Expense.create({
      userId: req.userId,
      title,
      amount,
      category,
      note: note || '',
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, category, note, date } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, amount, category, note, date: date ? new Date(date) : undefined },
      { new: true }
    );

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // ✅ CHECK IF THIS EXPENSE WAS FROM A SUBSCRIPTION
    if (expense.note && expense.note.includes('subscription')) {
      const subscriptionName = expense.title;
      
      // Delete the subscription that created this expense
      await Subscription.deleteOne({
        userId: req.userId,
        name: subscriptionName
      });
    }

    // Delete the expense
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;