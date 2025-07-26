const WithdrawalRequest = require('../models/WithdrawalRequest');
const User = require('../models/User');

// User creates withdrawal request
exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, phoneNumber, paymentApp, upiId, userName } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.walletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }
    const withdrawal = new WithdrawalRequest({
      userId,
      amount,
      phoneNumber,
      paymentApp,
      upiId,
      userName
    });
    user.walletBalance -= amount;
    await user.save();
    await withdrawal.save();
    res.json({ success: true, message: 'Withdrawal request submitted', data: withdrawal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating withdrawal request' });
  }
};

// Admin views all pending withdrawal requests
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({ status: 'pending' }).populate('userId', 'username walletBalance');
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching withdrawal requests' });
  }
};

// Admin approves/rejects withdrawal
exports.processWithdrawal = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.id;
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.adminId = adminId;
    request.processedAt = new Date();
    await request.save();
    // If rejected, refund user
    if (action === 'reject') {
      const user = await User.findById(request.userId);
      user.walletBalance += request.amount;
      await user.save();
    }
    res.json({ success: true, message: `Withdrawal ${action}d`, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing withdrawal request' });
  }
};
