const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');
const { isValidMobile, isValidUsername } = require('../utils/numberUtils');

/**
 * User Registration
 */
const registerUser = async (req, res) => {
  try {
    const { username, mobileNumber, email, password } = req.body;

    // Check if user already exists
    const queryConditions = [
      { username: username },
      { email: email }
    ];
    
    // Only check mobile number if provided
    if (mobileNumber && mobileNumber.trim() !== '') {
      queryConditions.push({ mobileNumber: mobileNumber });
    }
    
    const existingUser = await User.findOne({
      $or: queryConditions
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username 
          ? 'Username already exists' 
          : existingUser.email === email
          ? 'Email already registered'
          : 'Mobile number already registered'
      });
    }

    // Validate input formats
    if (!isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
      });
    }

    if (mobileNumber && mobileNumber.trim() !== '' && !isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9'
      });
    }
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Create new user
    const userData = {
      username,
      email,
      passwordHash: password // Will be hashed by pre-save middleware
    };
    
    // Only add mobileNumber if it's provided and valid
    if (mobileNumber && mobileNumber.trim() !== '') {
      userData.mobileNumber = mobileNumber;
    }
    
    const user = new User(userData);

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, 'user');

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        walletBalance: user.walletBalance || user.wallet,
        isGuest: user.isGuest || false,
        role: user.role
      },
      token,
      refreshToken: token // For simplicity, using same token as refresh token
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * User Login
 */
const loginUser = async (req, res) => {
  try {
    // Accept both 'identifier' and 'email' for backward compatibility
    const { identifier, email, password } = req.body; 
    const loginIdentifier = identifier || email;

    // Find user by credentials
    const user = await User.findByCredentials(loginIdentifier, password);

    // Generate JWT token
    const token = generateToken(user._id, 'user');

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        walletBalance: user.walletBalance || user.wallet,
        isGuest: user.isGuest || false,
        role: user.role,
        selectedNumbers: user.selectedNumbers,
        totalWinnings: user.totalWinnings,
        totalLosses: user.totalLosses,
        gamesPlayed: user.gamesPlayed
      },
      token,
      refreshToken: token // For simplicity, using same token as refresh token
    });

  } catch (error) {
    console.error('User login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/mobile number/username or password'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * Admin Login
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by credentials
    const admin = await Admin.findByCredentials(email, password);

    // Generate JWT token
    const token = generateToken(admin._id, 'admin');

    // Update last login
    await admin.updateLastLogin();

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          permissions: admin.permissions
        },
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (error.message.includes('temporarily locked')) {
      return res.status(423).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login'
    });
  }
};

/**
 * Refresh Token (Optional for future use)
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user/admin
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, decoded.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Logout (Optional - for token blacklisting in future)
 */
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you would add the token to a blacklist
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

/**
 * Verify Token (for frontend to check if token is still valid)
 */
const verifyToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (passed through authMiddleware)
    const userData = req.user.userData;
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: userData._id,
          username: userData.username || undefined,
          email: userData.email || undefined,
          mobileNumber: userData.mobileNumber || undefined,
          role: req.user.role,
          isActive: userData.isActive
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  refreshToken,
  logout,
  verifyToken
};
