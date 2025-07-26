// Filter withdrawal requests by user, status, date range
router.get('/filter', withdrawalController.filterWithdrawals);
// Filter withdrawal requests by user, status, date range
router.get('/filter', withdrawalController.filterWithdrawals);
// Export withdrawal requests (CSV/Excel)
router.get('/export', withdrawalController.exportWithdrawals);
// GET withdrawal transaction details
router.get('/:id/transaction', withdrawalController.getWithdrawalTransactionDetails);
const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');

// GET all withdrawal requests
router.get('/', withdrawalController.getAllWithdrawals);

// GET a single withdrawal request by ID
router.get('/:id', withdrawalController.getWithdrawalById);

// POST create a new withdrawal request (user action)
router.post('/', withdrawalController.createWithdrawal);

// POST approve withdrawal
router.post('/:id/approve', withdrawalController.approveWithdrawal);

// POST reject withdrawal
router.post('/:id/reject', withdrawalController.rejectWithdrawal);

module.exports = router;
