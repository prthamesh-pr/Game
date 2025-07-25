const User = require('../models/User');
const NumberSelection = require('../models/NumberSelection');
const Result = require('../models/Result');
const WalletTransaction = require('../models/WalletTransaction');
const { 
  determineNumberClass, 
  isValid3DigitNumber,
  generateValidNumbers,
  generateRandomNumberForClass 
} = require('../utils/numberUtils');

/**
 * Select Number for Game
 */
const selectNumber = async (req, res) => {
  try {
    const { classType, number, amount } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!['A', 'B', 'C'].includes(classType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class type. Must be A, B, or C'
      });
    }

    if (!isValid3DigitNumber(number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid number format. Must be exactly 3 digits'
      });
    }

    // Verify number belongs to the specified class
    const actualClass = determineNumberClass(number);
    if (actualClass !== classType) {
      return res.status(400).json({
        success: false,
        message: `Number ${number} does not belong to class ${classType}`
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Bet amount must be at least 1'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check wallet balance
    if (user.wallet < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Check if there's an active round
    let currentRound = await Result.getCurrentRound();
    if (!currentRound) {
      // Create new round if none exists
      const now = new Date();
      const roundId = `ROUND_${now.getTime()}`;
      
      currentRound = new Result({
        roundId,
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
        status: 'active'
      });
      await currentRound.save();
    }

    // Check if user already has a selection for this class in current round
    const existingSelection = await NumberSelection.findOne({
      userId,
      classType,
      roundId: currentRound.roundId,
      status: 'pending'
    });

    if (existingSelection) {
      return res.status(400).json({
        success: false,
        message: `You have already selected a number for class ${classType} in this round`
      });
    }

    // Deduct amount from wallet
    const balanceBefore = user.wallet;
    user.wallet -= amount;
    await user.save();

    // Create number selection
    const selection = new NumberSelection({
      userId,
      classType,
      number,
      amount,
      roundId: currentRound.roundId,
      status: 'pending'
    });
    await selection.save();

    // Create wallet transaction
    await WalletTransaction.createTransaction({
      userId,
      type: 'debit',
      amount,
      source: 'game-play',
      description: `Bet placed - Class ${classType}, Number: ${number}`,
      balanceBefore,
      balanceAfter: user.wallet,
      roundId: currentRound.roundId,
      metadata: {
        classType,
        selectedNumber: number
      }
    });

    // Update user's selected numbers (for quick access)
    user.selectedNumbers[`class${classType}`] = {
      number,
      amount,
      placedAt: new Date(),
      roundId: currentRound.roundId
    };
    await user.save();

    res.json({
      success: true,
      message: 'Number selected successfully',
      data: {
        selection: {
          id: selection._id,
          classType,
          number,
          amount,
          roundId: currentRound.roundId,
          placedAt: selection.placedAt
        },
        user: {
          wallet: user.wallet
        },
        round: {
          roundId: currentRound.roundId,
          endTime: currentRound.endTime
        }
      }
    });

  } catch (error) {
    console.error('Select number error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Current Round Information
 */
const getCurrentRound = async (req, res) => {
  try {
    const currentRound = await Result.getCurrentRound();

    if (!currentRound) {
      return res.json({
        success: true,
        message: 'No active round currently',
        data: {
          hasActiveRound: false,
          round: null
        }
      });
    }

    // Get user's selections for current round if authenticated
    let userSelections = [];
    if (req.user) {
      userSelections = await NumberSelection.find({
        userId: req.user.id,
        roundId: currentRound.roundId,
        status: 'pending'
      });
    }

    // Get round statistics
    const roundStats = await NumberSelection.aggregate([
      { $match: { roundId: currentRound.roundId } },
      {
        $group: {
          _id: '$classType',
          totalBets: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const statsMap = {};
    roundStats.forEach(stat => {
      statsMap[stat._id] = {
        totalBets: stat.totalBets,
        totalAmount: stat.totalAmount
      };
    });

    res.json({
      success: true,
      message: 'Current round information retrieved',
      data: {
        hasActiveRound: true,
        round: {
          roundId: currentRound.roundId,
          startTime: currentRound.startTime,
          endTime: currentRound.endTime,
          timeRemaining: Math.max(0, currentRound.endTime - new Date()),
          status: currentRound.status
        },
        userSelections,
        statistics: {
          classA: statsMap.A || { totalBets: 0, totalAmount: 0 },
          classB: statsMap.B || { totalBets: 0, totalAmount: 0 },
          classC: statsMap.C || { totalBets: 0, totalAmount: 0 }
        }
      }
    });

  } catch (error) {
    console.error('Get current round error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Valid Numbers for a Class
 */
const getValidNumbers = async (req, res) => {
  try {
    const { classType } = req.params;

    if (!['A', 'B', 'C'].includes(classType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class type. Must be A, B, or C'
      });
    }

    const validNumbers = generateValidNumbers(classType);

    res.json({
      success: true,
      message: `Valid numbers for class ${classType} retrieved`,
      data: {
        classType,
        numbers: validNumbers,
        count: validNumbers.length,
        description: {
          A: 'All same digits (111, 222, 333, etc.)',
          B: 'Exactly two same digits (112, 223, 334, etc.)',
          C: 'All different digits (123, 456, 789, etc.)'
        }[classType]
      }
    });

  } catch (error) {
    console.error('Get valid numbers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Game Rules and Information
 */
const getGameInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Game information retrieved',
      data: {
        rules: {
          classA: {
            name: 'Class A',
            description: 'All three digits are the same',
            examples: ['111', '222', '333', '444', '555', '666', '777', '888', '999'],
            totalNumbers: 9,
            winMultiplier: 100,
            probability: '1/9 = 11.11%'
          },
          classB: {
            name: 'Class B',
            description: 'Exactly two digits are the same',
            examples: ['112', '121', '211', '223', '232', '322'],
            totalNumbers: 252, // Calculated based on combinations
            winMultiplier: 10,
            probability: '252/1000 = 25.2%'
          },
          classC: {
            name: 'Class C',
            description: 'All three digits are different',
            examples: ['123', '456', '789', '012', '345'],
            totalNumbers: 720, // Calculated based on permutations
            winMultiplier: 5,
            probability: '720/1000 = 72%'
          }
        },
        gameFlow: [
          'Select a class (A, B, or C)',
          'Choose a 3-digit number belonging to that class',
          'Place your bet amount',
          'Wait for the round to end (1 hour rounds)',
          'Admin announces winning numbers',
          'If your number matches, you win the multiplier amount!'
        ],
        betLimits: {
          minimum: 1,
          maximum: 10000 // Can be configured
        },
        roundDuration: '1 hour',
        payoutStructure: {
          classA: 'Bet Amount × 100',
          classB: 'Bet Amount × 10',
          classC: 'Bet Amount × 5'
        }
      }
    });

  } catch (error) {
    console.error('Get game info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Recent Results
 */
const getRecentResults = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const results = await Result.find({ status: 'completed' })
      .sort({ endTime: -1 })
      .limit(limit)
      .skip(skip);

    const totalResults = await Result.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      message: 'Recent results retrieved',
      data: {
        results: results.map(result => ({
          roundId: result.roundId,
          winningNumbers: {
            classA: result.classA.winningNumber,
            classB: result.classB.winningNumber,
            classC: result.classC.winningNumber
          },
          startTime: result.startTime,
          endTime: result.endTime,
          statistics: {
            totalParticipants: result.totalParticipants,
            totalRevenue: result.totalRevenue,
            totalPayout: result.totalPayout,
            winnersCount: result.winners.length
          }
        })),
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
    console.error('Get recent results error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Cancel Number Selection (if round hasn't ended)
 */
const cancelSelection = async (req, res) => {
  try {
    const { selectionId } = req.params;
    const userId = req.user.id;

    const selection = await NumberSelection.findOne({
      _id: selectionId,
      userId,
      status: 'pending'
    });

    if (!selection) {
      return res.status(404).json({
        success: false,
        message: 'Selection not found or already processed'
      });
    }

    // Check if round is still active
    const round = await Result.findOne({ roundId: selection.roundId });
    if (!round || round.status !== 'active' || new Date() > round.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel selection. Round has already ended'
      });
    }

    // Refund amount to user wallet
    const user = await User.findById(userId);
    const balanceBefore = user.wallet;
    user.wallet += selection.amount;
    
    // Clear selected number from user profile
    user.selectedNumbers[`class${selection.classType}`] = {
      number: null,
      amount: 0,
      placedAt: null,
      roundId: null
    };
    
    await user.save();

    // Delete selection
    await NumberSelection.findByIdAndDelete(selectionId);

    // Create refund transaction
    await WalletTransaction.createTransaction({
      userId,
      type: 'credit',
      amount: selection.amount,
      source: 'refund',
      description: `Refund for cancelled selection - Class ${selection.classType}, Number: ${selection.number}`,
      balanceBefore,
      balanceAfter: user.wallet,
      roundId: selection.roundId,
      metadata: {
        classType: selection.classType,
        selectedNumber: selection.number,
        originalSelectionId: selectionId
      }
    });

    res.json({
      success: true,
      message: 'Selection cancelled and amount refunded',
      data: {
        refundedAmount: selection.amount,
        newWalletBalance: user.wallet
      }
    });

  } catch (error) {
    console.error('Cancel selection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get User's Current Selections
 */
const getCurrentSelections = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current active round
    const currentRound = await Result.getCurrentRound();
    if (!currentRound) {
      return res.json({
        success: true,
        message: 'No active round',
        data: {
          selections: [],
          hasActiveRound: false
        }
      });
    }

    // Get user's selections for current round
    const selections = await NumberSelection.find({
      userId,
      roundId: currentRound.roundId,
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Current selections retrieved',
      data: {
        selections,
        hasActiveRound: true,
        round: {
          roundId: currentRound.roundId,
          endTime: currentRound.endTime,
          timeRemaining: Math.max(0, currentRound.endTime - new Date())
        }
      }
    });

  } catch (error) {
    console.error('Get current selections error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get All Game Rounds with Pagination
 */
const getAllRounds = async (req, res) => {

module.exports = {
  selectNumber,
  getCurrentRound,
  getValidNumbers,
  getGameInfo,
  getRecentResults,
  cancelSelection,
  getCurrentSelections,
  getAllRounds
};
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get rounds with pagination
    const rounds = await Result.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    // Get total count for pagination
    const totalCount = await Result.countDocuments();
    
    res.json({
      success: true,
      message: 'Game rounds retrieved successfully',
      data: {
        rounds,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching game rounds:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game rounds'
    });
  }
};
