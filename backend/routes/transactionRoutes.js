const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET all transactions
router.get('/', transactionController.getAllTransactions);

// GET transactions by user
router.get('/user/:userId', transactionController.getUserTransactions);

module.exports = router;
