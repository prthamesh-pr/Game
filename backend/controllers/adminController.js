const User = require('../models/User');
const Admin = require('../models/Admin');
const NumberSelection = require('../models/NumberSelection');
const Result = require('../models/Result');
const WalletTransaction = require('../models/WalletTransaction');
const { determineNumberClass, calculateWinningAmount } = require('../utils/numberUtils');

/**
 * Add/Deduct Money to/from User Wallet
 */
const manageUserWallet = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate transaction
    if (type === 'debit' && user.wallet < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    const balanceBefore = user.wallet;

    // Update user wallet
    if (type === 'credit') {
      user.wallet += amount;
    } else {
      user.wallet -= amount;
    }

    await user.save();

    // Create wallet transaction record
    const transaction = await WalletTransaction.createTransaction({
      userId,
      type,
      amount,
      source: 'admin-topup',
      description: description || `Wallet ${type} by admin`,
      balanceBefore,
      balanceAfter: user.wallet,
      adminId
    });

    // Audit log
    const { logAction } = require('./auditLogController');
    await logAction(adminId, 'manage_wallet', { userId, amount, type, description });

    res.json({
      success: true,
      message: `Wallet ${type} successful`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          wallet: user.wallet
        },
        transaction: {
          type,
          amount,
          balanceBefore,
          balanceAfter: user.wallet
        }
      }
    });

  } catch (error) {
    console.error('Manage user wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Set Game Result for a Round
 */
const setGameResult = async (req, res) => {
  try {
    const { roundId, classA, classB, classC } = req.body;
    const adminId = req.user.id;

    // Validate winning numbers
    const winningNumbers = { classA, classB, classC };
    for (const [classType, number] of Object.entries(winningNumbers)) {
      if (number && !/^\d{3}$/.test(number)) {
        return res.status(400).json({
          success: false,
          message: `Invalid winning number for ${classType}. Must be 3 digits.`
        });
      }
      
      // Verify number belongs to correct class
      const expectedClass = classType.replace('class', '');
      const actualClass = determineNumberClass(number);
      if (actualClass !== expectedClass) {
        return res.status(400).json({
          success: false,
          message: `Number ${number} does not belong to class ${expectedClass}`
        });
      }
    }

    // Find or create result document
    let result = await Result.findOne({ roundId });
    if (!result) {
      // Create new result
      const now = new Date();
      result = new Result({
        roundId,
        startTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        endTime: now,
        status: 'completed'
      });
    }

    // Update winning numbers
    if (classA) result.classA.winningNumber = classA;
    if (classB) result.classB.winningNumber = classB;
    if (classC) result.classC.winningNumber = classC;

    // Process results for each class
    for (const classType of ['A', 'B', 'C']) {
      const winningNumber = result[`class${classType}`].winningNumber;
      if (!winningNumber) continue;

      // Find all selections for this class and round
      const selections = await NumberSelection.find({
        roundId,
        classType,
        status: 'pending'
      }).populate('userId');

      let classStats = {
        totalBets: selections.length,
        totalAmount: 0,
        totalWinnings: 0,
        winnersCount: 0
      };

      // Process each selection
      for (const selection of selections) {
        classStats.totalAmount += selection.amount;

        if (selection.number === winningNumber) {
          // Winner!
          const winningAmount = calculateWinningAmount(classType, selection.amount);
          
          // Update selection
          await selection.markAsWinner(winningAmount);
          
          // Update user wallet
          const user = selection.userId;
          user.wallet += winningAmount;
          user.totalWinnings += winningAmount;
          user.gamesPlayed += 1;
          await user.save();

          // Create wallet transaction
          await WalletTransaction.createTransaction({
            userId: user._id,
            type: 'credit',
            amount: winningAmount,
            source: 'game-win',
            description: `Won class ${classType} - Number: ${selection.number}`,
            balanceBefore: user.wallet - winningAmount,
            balanceAfter: user.wallet,
            roundId,
            metadata: {
              classType,
              selectedNumber: selection.number,
              winningNumber
            }
          });

    // Audit log
    const { logAction } = require('./auditLogController');
    await logAction(adminId, 'manage_wallet', { userId, amount, type, description });

    res.json({
      success: true,
      message: 'Wallet updated successfully',
      data: { user, transaction }
    });

          classStats.winnersCount += 1;
          classStats.totalWinnings += winningAmount;

        } else {
          // Loser
          await selection.markAsLoser();
          
          // Update user stats
          const user = selection.userId;
          user.totalLosses += selection.amount;
          user.gamesPlayed += 1;
          await user.save();
        }
      }

      // Update class statistics
      result[`class${classType}`] = {
        ...result[`class${classType}`],
        ...classStats
      };
    }

    // Calculate overall statistics
    result.totalParticipants = result.classA.totalBets + result.classB.totalBets + result.classC.totalBets;
    result.totalRevenue = result.classA.totalAmount + result.classB.totalAmount + result.classC.totalAmount;
    result.totalPayout = result.classA.totalWinnings + result.classB.totalWinnings + result.classC.totalWinnings;
    result.houseProfit = result.totalRevenue - result.totalPayout;

    // Complete the round
    await result.completeRound(adminId);

    res.json({
      success: true,
      message: 'Game result set successfully',
      data: {
        result: {
          roundId: result.roundId,
          winningNumbers: {
            classA: result.classA.winningNumber,
            classB: result.classB.winningNumber,
            classC: result.classC.winningNumber
          },
          statistics: {
            totalParticipants: result.totalParticipants,
            totalRevenue: result.totalRevenue,
            totalPayout: result.totalPayout,
            houseProfit: result.houseProfit,
            winnersCount: result.winners.length
          }
        }
      }
    });

  } catch (error) {
    console.error('Set game result error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get All Game Results
 */
const getAllResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const results = await Result.find({ status: 'completed' })
      .sort({ endTime: -1 })
      .limit(limit)
      .skip(skip)
      .populate('resultPostedBy', 'fullName email');

    const totalResults = await Result.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      message: 'Results retrieved successfully',
      data: {
        results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalResults / limit),
          totalResults,
          hasNextPage: page < Math.ceil(totalResults / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Winners for a Specific Round
 */
const getRoundWinners = async (req, res) => {
  try {
    const { roundId } = req.params;

    const result = await Result.findOne({ roundId })
      .populate('winners.userId', 'username mobileNumber')
      .populate('resultPostedBy', 'fullName email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }

    res.json({
      success: true,
      message: 'Round winners retrieved successfully',
      data: {
        roundInfo: {
          roundId: result.roundId,
          startTime: result.startTime,
          endTime: result.endTime,
          winningNumbers: {
            classA: result.classA.winningNumber,
            classB: result.classB.winningNumber,
            classC: result.classC.winningNumber
          }
        },
        winners: result.winners,
        statistics: result.overallStats
      }
    });

  } catch (error) {
    console.error('Get round winners error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Dashboard Statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalAdmins = await Admin.countDocuments({ isActive: true });
    const totalResults = await Result.countDocuments({ status: 'completed' });

    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await NumberSelection.aggregate([
      {
        $match: {
          placedAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalWinnings: { $sum: '$winningAmount' }
        }
      }
    ]);

    // Get recent activity
    const recentSelections = await NumberSelection.find()
      .sort({ placedAt: -1 })
      .limit(10)
      .populate('userId', 'username mobileNumber');
    // Audit log
    const { logAction } = require('./auditLogController');
    await logAction(adminId, 'set_game_result', { roundId, winningNumbers });

    const recentResults = await Result.find({ status: 'completed' })
      .sort({ endTime: -1 })
      .limit(5);

    // Get wallet statistics
    const walletStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalWalletBalance: { $sum: '$wallet' },
          averageWalletBalance: { $avg: '$wallet' },
          totalWinnings: { $sum: '$totalWinnings' },
          totalLosses: { $sum: '$totalLosses' }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalUsers,
          totalAdmins,
          totalResults,
          todaysBets: todayStats[0]?.totalBets || 0,
          todaysRevenue: todayStats[0]?.totalAmount || 0,
          todaysPayout: todayStats[0]?.totalWinnings || 0
        },
        walletStats: walletStats[0] || {
          totalWalletBalance: 0,
          averageWalletBalance: 0,
          totalWinnings: 0,
          totalLosses: 0
        },
        recentActivity: {
          recentSelections,
          recentResults
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Deactivate/Activate User
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  manageUserWallet,
  setGameResult,
  getAllResults,
  getRoundWinners,
  getDashboardStats,
  toggleUserStatus
};
