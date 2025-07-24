require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');

// Import middleware
const { securityHeaders, requestLogger } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gameRoutes = require('./routes/gameRoutes');

// Import models for seeding
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com', 'https://your-admin-panel.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/numbergame';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    
    // Seed admin user if doesn't exist
    await seedAdminUser();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed admin user
const seedAdminUser = async () => {
  try {
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
      
      await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@numbergame.com',
        passwordHash: adminPassword,
        fullName: 'System Administrator',
        role: 'super-admin',
        permissions: {
          canManageUsers: true,
          canManageWallets: true,
          canSetResults: true,
          canViewReports: true,
          canManageAdmins: true
        }
      });
      
      console.log('✅ Admin user seeded successfully');
      console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@numbergame.com'}`);
      console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

// Routes
// Base API route handler to show available routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Number Game API',
    version: '1.0.0',
    availableRoutes: ['/api/auth', '/api/user', '/api/admin', '/api/game'],
    documentation: '/api/docs'
  });
});

// Auth routes - base handler
app.get('/api/auth', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API routes',
    availableRoutes: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/admin/login',
      '/api/auth/refresh',
      '/api/auth/logout',
      '/api/auth/verify'
    ]
  });
});

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);

// Health check routes (both /health and /api/health)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Number Game API Server',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      admin: '/api/admin',
      game: '/api/game'
    },
    status: 'Running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation route (basic)
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Number Game API Documentation',
    version: '1.0.0',
    baseURL: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      authentication: {
        'POST /auth/register': 'Register new user',
        'POST /auth/login': 'User login',
        'POST /auth/admin/login': 'Admin login',
        'POST /auth/refresh': 'Refresh token',
        'POST /auth/logout': 'Logout',
        'GET /auth/verify': 'Verify token'
      },
      user: {
        'GET /user/profile': 'Get user profile',
        'PUT /user/profile': 'Update user profile',
        'GET /user/selections': 'Get user selections history',
        'GET /user/wallet/transactions': 'Get wallet transactions',
        'GET /user/results': 'Get user game results',
        'GET /user/stats': 'Get user statistics',
        'POST /user/change-password': 'Change password'
      },
      game: {
        'POST /game/select': 'Select number for game',
        'GET /game/round/current': 'Get current round info',
        'GET /game/numbers/:classType': 'Get valid numbers for class',
        'GET /game/info': 'Get game rules and info',
        'GET /game/results/recent': 'Get recent results',
        'DELETE /game/selections/:id': 'Cancel selection',
        'GET /game/selections/current': 'Get current selections'
      },
      admin: {
        'GET /admin/dashboard': 'Get dashboard stats',
        'GET /admin/users': 'Get all users',
        'GET /admin/users/:id': 'Get user details',
        'POST /admin/users/:id/toggle-status': 'Toggle user status',
        'POST /admin/wallet/manage': 'Manage user wallet',
        'POST /admin/results/set': 'Set game results',
        'GET /admin/results': 'Get all results',
        'GET /admin/results/:roundId/winners': 'Get round winners'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method,
    availableRoutes: ['/api/auth', '/api/user', '/api/admin', '/api/game']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed.');
    process.exit(0);
  });
});

// Cron job for automated tasks (optional)
if (process.env.NODE_ENV === 'production') {
  // Example: Clean up expired rounds every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Running scheduled cleanup tasks...');
    // Add cleanup logic here if needed
  });
}

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  });
};

startServer().catch(console.error);

module.exports = app;
