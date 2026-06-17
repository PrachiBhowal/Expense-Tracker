const router = require('express').Router();
const Subscription = require('../models/Subscription');
const Expense = require('../models/Expense');
const sessionMiddleware = require('../middleware/sessionMiddleware');

router.use(sessionMiddleware);

// GET all subscriptions
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create subscription
router.post('/', async (req, res) => {
  try {
    console.log('Create subscription:', { body: req.body, userId: req.userId });
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.body.name || !req.body.amount) {
      return res.status(400).json({ error: 'Name and amount are required' });
    }

    // ✅ FIX: Calculate nextBillingDate based on billingCycle
    const nextBillingDate = new Date();
    if (req.body.billingCycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      userId: req.userId,
      name: req.body.name,
      amount: Number(req.body.amount),
      category: req.body.category || 'other',
      billingCycle: req.body.billingCycle || 'monthly',
      nextBillingDate: nextBillingDate
    });

    console.log('Subscription created:', subscription);
    res.status(201).json(subscription);
  } catch (err) {
    console.error('Create subscription error:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT update subscription
router.put('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    
    Object.assign(subscription, req.body);
    await subscription.save();
    res.json(subscription);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE subscription (and its related expenses)
router.delete('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    // Delete the subscription
    await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    // Also delete all expenses created from this subscription
    const subscriptionName = subscription.name;
    await Expense.deleteMany({
      userId: req.userId,
      title: subscriptionName,
      note: { $regex: `${subscriptionName} subscription`, $options: 'i' }
    });

    res.json({ message: 'Subscription and related expenses deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHARGE subscription
router.post('/:id/charge', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const monthYear = new Date().toISOString().slice(0, 7);

    if (subscription.paidMonths.includes(monthYear)) {
      return res.status(400).json({ error: 'Already charged for this month' });
    }

    const category = subscription.category || 'bills';

    const expense = await Expense.create({
      userId: req.userId,
      title: subscription.name,
      amount: subscription.amount,
      category: category,
      note: `${subscription.name} subscription`,
      date: new Date()
    });

    subscription.paidMonths.push(monthYear);
    
    // ✅ FIX: Update nextBillingDate based on billingCycle
    const nextBillingDate = new Date();
    if (subscription.billingCycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
    subscription.nextBillingDate = nextBillingDate;
    
    await subscription.save();

    res.json({ message: 'Charged successfully', expense });
  } catch (err) {
    console.error('Charge error:', err);
    res.status(500).json({ error: err.message });
  }
});

// SKIP charge
router.post('/:id/skip', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const monthYear = new Date().toISOString().slice(0, 7);
    if (!subscription.paidMonths.includes(monthYear)) {
      subscription.paidMonths.push(monthYear);
    }

    // ✅ FIX: Update nextBillingDate based on billingCycle
    const nextBillingDate = new Date();
    if (subscription.billingCycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
    subscription.nextBillingDate = nextBillingDate;
    
    await subscription.save();

    res.json({ message: 'Skipped for this month' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEST: Charge next month
router.post('/:id/test-charge-next-month', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 7);

    if (subscription.paidMonths.includes(nextMonth)) {
      return res.status(400).json({ error: 'Already charged for next month (test)' });
    }

    const category = subscription.category || 'bills';

    const testDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
    const expense = await Expense.create({
      userId: req.userId,
      title: `${subscription.name} (TEST - Next Month)`,
      amount: subscription.amount,
      category: category,
      note: `${subscription.name} subscription [TEST]`,
      date: testDate
    });

    subscription.paidMonths.push(nextMonth);
    await subscription.save();

    res.json({
      message: 'Test charge for next month successful!',
      expense,
      subscription
    });
  } catch (err) {
    console.error('Test charge error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;