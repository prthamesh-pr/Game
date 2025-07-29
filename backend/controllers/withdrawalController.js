// Get all withdrawal requests
exports.getAllWithdrawals = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find().populate('userId', 'username walletBalance');
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching withdrawal requests' });
  }
};

// Approve withdrawal request
exports.approveWithdrawal = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }
    request.status = 'approved';
    request.adminId = adminId;
    request.processedAt = new Date();
    await request.save();
    res.json({ success: true, message: 'Withdrawal approved', data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error approving withdrawal request' });
  }
};

// Reject withdrawal request
exports.rejectWithdrawal = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }
    request.status = 'rejected';
    request.adminId = adminId;
    request.processedAt = new Date();
    await request.save();
    // Refund user
    const user = await User.findById(request.userId);
    user.walletBalance += request.amount;
    await user.save();
    res.json({ success: true, message: 'Withdrawal rejected', data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error rejecting withdrawal request' });
  }
};
exports.filterWithdrawals = (req, res) => {
  // TODO: Filter withdrawal requests by user, status, date range
  const { userId, status, startDate, endDate } = req.query;
  res.json({ message: 'Filter withdrawal requests', filters: { userId, status, startDate, endDate } });
};
exports.exportWithdrawals = (req, res) => {
  // TODO: Export withdrawal requests as CSV/Excel
  res.json({ message: 'Export withdrawal requests (CSV/Excel)' });
};
exports.getWithdrawalTransactionDetails = (req, res) => {
  // TODO: Fetch transaction details for a withdrawal request
  res.json({ message: 'Get withdrawal transaction details', id: req.params.id });
};
exports.getPendingWithdrawals = (req, res) => {
  // TODO: Fetch all pending withdrawal requests
  res.json({ message: 'Get all pending withdrawal requests' });
};

exports.processWithdrawal = (req, res) => {
  // TODO: Approve or reject withdrawal request with reason
  const { id, action, reason } = req.body;
  res.json({ message: `Withdrawal ${action}`, id, reason });
};
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

exports.getWithdrawalById = (req, res) => {
  // TODO: Fetch a single withdrawal request by ID
  res.json({ message: 'Get withdrawal request by ID', id: req.params.id });
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
    const { requestId, action, reason } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user.id;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const request = await WithdrawalRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.adminId = adminId;
    request.processedAt = new Date();
    if (action === 'reject') {
      request.rejectReason = reason || 'No reason provided';
      // Refund user
      const user = await User.findById(request.userId);
      if (user) {
        user.walletBalance += request.amount;
        await user.save();
      }
    }
    await request.save();
    // Audit log (if available)
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        action: `withdrawal_${action}`,
        performedBy: adminId,
        targetId: requestId,
        details: { reason: action === 'reject' ? request.rejectReason : undefined }
      });
    } catch (e) {}
    // Notify user (if notification system available)
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: request.userId,
        title: `Withdrawal ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: action === 'approve' ? 'Your withdrawal request has been approved.' : `Your withdrawal request was rejected. Reason: ${request.rejectReason}`
      });
    } catch (e) {}
    res.json({ success: true, message: `Withdrawal ${action}d`, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing withdrawal request', error: err.message });
  }
};
