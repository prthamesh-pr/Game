
const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
// Filter withdrawal requests by user, status, date range
router.get('/filter', withdrawalController.filterWithdrawals);
// Export withdrawal requests (CSV/Excel)
router.get('/export', withdrawalController.exportWithdrawals);
// GET withdrawal transaction details
router.get('/:id/transaction', withdrawalController.getWithdrawalTransactionDetails);

// GET all withdrawal requests
router.get('/', withdrawalController.getAllWithdrawals);

// GET a single withdrawal request by ID
router.get('/:id', withdrawalController.getWithdrawalById);

// POST create a new withdrawal request (user action)
router.post('/', withdrawalController.createWithdrawal);


const { validationRules, handleValidationErrors } = require('../middleware/validation');

// POST process withdrawal (approve/reject)
router.post('/process',
  [
    validationRules.mongoId,
    // Validate action and reason
    require('express-validator').body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    require('express-validator').body('requestId').isMongoId().withMessage('Invalid requestId'),
    require('express-validator').body('reason').optional().isString().trim().isLength({ max: 200 }).withMessage('Reason must be a string up to 200 chars')
  ],
  handleValidationErrors,
  withdrawalController.processWithdrawal
);

module.exports = router;
