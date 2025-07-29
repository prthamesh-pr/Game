const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Add token to wallet
exports.addToken = async (req, res) => {
  try {
    const { amount, upiId, userName, paymentApp } = req.body;
    const userId = req.user.id;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const balanceBefore = user.walletBalance;
    user.walletBalance += amount;
    const transaction = new WalletTransaction({
      userId,
      type: 'credit',
      amount,
      source: 'add-token',
      description: `Token added via ${paymentApp} (${upiId}) by ${userName}`,
      balanceBefore,
      balanceAfter: user.walletBalance
    });
    await user.save();
    await transaction.save();
    res.json({ success: true, message: 'Token added successfully', data: { walletBalance: user.walletBalance } });
  } catch (error) {
    console.error('Error adding token:', error);
    res.status(500).json({ success: false, message: 'Error adding token' });
  }
};

// Withdraw from wallet
exports.withdraw = async (req, res) => {
  try {
    const { amount, phoneNumber, paymentApp } = req.body;
    const userId = req.user.id;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }
    const balanceBefore = user.walletBalance;
    user.walletBalance -= amount;
    const transaction = new WalletTransaction({
      userId,
      type: 'debit',
      amount,
      source: 'withdraw',
      description: `Withdraw via ${paymentApp} to ${phoneNumber}`,
      balanceBefore,
      balanceAfter: user.walletBalance
    });
    await user.save();
    await transaction.save();
    res.json({ success: true, message: 'Withdraw request submitted', data: { walletBalance: user.walletBalance } });
  } catch (error) {
    console.error('Error withdrawing:', error);
    res.status(500).json({ success: false, message: 'Error withdrawing' });
  }
};
