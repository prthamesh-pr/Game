const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');

// User creates withdrawal request
router.post('/', isAuthenticated, withdrawalController.createWithdrawal);
// Admin views pending requests
router.get('/pending', isAdmin, withdrawalController.getPendingWithdrawals);
// Admin processes (approve/reject) withdrawal
router.post('/process', isAdmin, withdrawalController.processWithdrawal);

module.exports = router;
