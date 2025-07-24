const rateLimit = require('express-rate-limit');
const { body, validationResult, param, query } = require('express-validator');

// Rate limiting configurations
const rateLimiters = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Authentication rate limit (more lenient for development)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 auth requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting in development
      return process.env.NODE_ENV === 'development';
    }
  }),

  // Game actions rate limit
  game: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 game actions per minute
    message: {
      success: false,
      message: 'Too many game actions, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Admin actions rate limit
  admin: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // limit each IP to 50 admin actions per 5 minutes
    message: {
      success: false,
      message: 'Too many admin actions, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
};

// Validation rules
const validationRules = {
  // User registration validation
  userRegistration: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('mobileNumber')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  // User login validation
  userLogin: [
    body('identifier')
      .notEmpty()
      .withMessage('Mobile number or username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Admin login validation
  adminLogin: [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Number selection validation
  numberSelection: [
    body('classType')
      .isIn(['A', 'B', 'C'])
      .withMessage('Class type must be A, B, or C'),
    body('number')
      .matches(/^\d{3}$/)
      .withMessage('Number must be exactly 3 digits'),
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Bet amount must be at least 1')
  ],

  // Wallet transaction validation
  walletTransaction: [
    body('userId')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be at least 1'),
    body('type')
      .isIn(['credit', 'debit'])
      .withMessage('Transaction type must be credit or debit')
  ],

  // Result setting validation
  resultSetting: [
    body('classType')
      .isIn(['A', 'B', 'C'])
      .withMessage('Class type must be A, B, or C'),
    body('winningNumber')
      .matches(/^\d{3}$/)
      .withMessage('Winning number must be exactly 3 digits'),
    body('roundId')
      .notEmpty()
      .withMessage('Round ID is required')
  ],

  // MongoDB ID validation
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // Date range validation
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
  ]
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
  });
  
  next();
};

module.exports = {
  rateLimiters,
  validationRules,
  handleValidationErrors,
  securityHeaders,
  requestLogger
};
