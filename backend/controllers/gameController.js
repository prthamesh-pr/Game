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
    if (!["A", "B", "C"].includes(classType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class type. Must be A, B, or C"
      });
    }

    if (!isValid3DigitNumber(number)) {
      return res.status(400).json({
        success: false,
        message: "Number must be a valid 3-digit number"
      });
    }

    const minAmount = 10;  // Minimum bet amount
    const maxAmount = 1000;  // Maximum bet amount
    
    if (amount < minAmount || amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ${minAmount} and ${maxAmount}`
      });
    }
    
    // Check if number is valid for the selected class
    const calculatedClass = determineNumberClass(number);
    if (calculatedClass !== classType) {
      return res.status(400).json({
        success: false,
        message: `Number ${number} belongs to class ${calculatedClass}, not class ${classType}`
      });
    }

    // Get current active round
    const currentRound = await Result.findOne({ status: "active" }).sort({ createdAt: -1 });
    
    if (!currentRound) {
      return res.status(400).json({
        success: false,
        message: "No active round found"
      });
    }
    
    // Check if user has sufficient balance
    const user = await User.findById(userId);
    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }
    
    // Check if number is already selected by this user in current round
    const existingSelection = await NumberSelection.findOne({
      userId: userId,
      roundId: currentRound.roundId,
      number,
      classType
    });
    
    if (existingSelection) {
      return res.status(400).json({
        success: false,
        message: "You have already selected this number for the current round"
      });
    }
    
    // Create new selection
    const newSelection = new NumberSelection({
      userId: userId,
      roundId: currentRound.roundId,
      number,
      classType,
      amount,
      status: "pending"
    });
    
    // Deduct amount from user's wallet
    const balanceBefore = user.walletBalance;
    user.walletBalance -= amount;
    
    // Create wallet transaction
    const transaction = new WalletTransaction({
      userId: userId,
      type: "debit",
      amount: amount,
      source: "game-play",
      description: `Bet placed for number ${number} in round ${currentRound.roundId}`,
      balanceBefore: balanceBefore,
      balanceAfter: user.walletBalance,
      roundId: currentRound.roundId,
      metadata: {
        classType: classType,
        selectedNumber: number
      }
    });
    
    // Save all changes in a transaction
    await newSelection.save();
    await user.save();
    await transaction.save();
    
    res.status(201).json({
      success: true,
      message: "Number selected successfully",
      data: {
        selection: {
          id: newSelection._id,
          number,
          classType,
          amount,
          roundId: currentRound.roundId,
          createdAt: newSelection.createdAt
        },
        walletBalance: user.walletBalance
      }
    });
    
  } catch (error) {
    console.error("Error selecting number:", error);
    res.status(500).json({
      success: false,
      message: "Error selecting number"
    });
  }
};

/**
 * Get Current Active Round
 */
const getCurrentRound = async (req, res) => {
  try {
    const currentRound = await Result.findOne({ status: "active" }).sort({ createdAt: -1 });
    
    if (!currentRound) {
      return res.status(404).json({
        success: false,
        message: "No active round found"
      });
    }

    // If user is authenticated, get their selections
    let userSelections = [];
    if (req.user) {
      userSelections = await NumberSelection.find({
        user: req.user.id,
        round: currentRound._id,
        status: "active"
      });
    }
    
    // Calculate time remaining
    const endTime = new Date(currentRound.endTime).getTime();
    const currentTime = new Date().getTime();
    const timeRemaining = Math.max(0, endTime - currentTime);
    
    res.json({
      success: true,
      message: "Current round retrieved successfully",
      data: {
        round: {
          id: currentRound._id,
          roundNumber: currentRound.roundNumber,
          status: currentRound.status,
          startTime: currentRound.startTime,
          endTime: currentRound.endTime,
          timeRemaining
        },
        userSelections: userSelections.map(s => ({
          id: s._id,
          number: s.number,
          classType: s.classType,
          amount: s.amount
        }))
      }
    });
    
  } catch (error) {
    console.error("Error getting current round:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving current round"
    });
  }
};

/**
 * Get Valid Numbers for a Given Class
 */
const getValidNumbers = async (req, res) => {
  try {
    const { classType } = req.params;
    
    if (!["A", "B", "C"].includes(classType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class type. Must be A, B, or C"
      });
    }
    
    const validNumbers = generateValidNumbers(classType);
    
    res.json({
      success: true,
      message: `Valid numbers for class ${classType} retrieved successfully`,
      data: {
        classType,
        validNumbers
      }
    });
    
  } catch (error) {
    console.error("Error getting valid numbers:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving valid numbers"
    });
  }
};

/**
 * Get Game Information
 */
const getGameInfo = async (req, res) => {
  try {
    const gameInfo = {
      title: "3 Digit Number Game",
      description: "Select numbers from different classes to win prizes",
      rules: [
        "Select a 3-digit number from class A, B, or C",
        "Each class has different valid numbers",
        "Class A: numbers where all digits add up to a multiple of 3",
        "Class B: numbers where all digits add up to a multiple of 3 plus 1",
        "Class C: numbers where all digits add up to a multiple of 3 plus 2",
        "Minimum bet amount: $10, Maximum: $1000",
        "Winners are announced at the end of each round",
        "One winning number is drawn for each class"
      ],
      prizes: {
        exactMatch: "90x your bet amount",
        classMatch: "5x your bet amount"
      },
      classes: {
        A: "Sum of digits is divisible by 3 (e.g., 102, 300, 999)",
        B: "Sum of digits mod 3 = 1 (e.g., 101, 200, 407)",
        C: "Sum of digits mod 3 = 2 (e.g., 103, 301, 808)"
      }
    };
    
    res.json({
      success: true,
      message: "Game information retrieved successfully",
      data: gameInfo
    });
    
  } catch (error) {
    console.error("Error getting game info:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving game information"
    });
  }
};

/**
 * Get Recent Results
 */
const getRecentResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const completedRounds = await Result.find({ status: "completed" })
      .sort({ endTime: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Result.countDocuments({ status: "completed" });
    
    res.json({
      success: true,
      message: "Recent results retrieved successfully",
      data: {
        results: completedRounds.map(round => ({
          id: round._id,
          roundNumber: round.roundNumber,
          endTime: round.endTime,
          winningNumbers: round.winningNumbers
        })),
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
    console.error("Error getting recent results:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving recent results"
    });
  }
};

/**
 * Cancel a Number Selection
 */
const cancelSelection = async (req, res) => {
  try {
    const { selectionId } = req.params;
    const userId = req.user.id;
    
    // Find the selection and verify it belongs to this user
    const selection = await NumberSelection.findOne({
      _id: selectionId,
      user: userId,
      status: "active"
    });
    
    if (!selection) {
      return res.status(404).json({
        success: false,
        message: "Selection not found or already cancelled"
      });
    }
    
    // Get the round to verify it's still active
    const round = await Result.findOne({
      _id: selection.round
    });
    
    if (!round || round.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel selection as the round is no longer active"
      });
    }
    
    // Calculate time remaining in round
    const endTime = new Date(round.endTime).getTime();
    const currentTime = new Date().getTime();
    const timeRemaining = Math.max(0, endTime - currentTime);
    
    // Only allow cancellation if more than 30 seconds remaining
    const minCancellationTime = 30 * 1000; // 30 seconds in milliseconds
    if (timeRemaining < minCancellationTime) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel selection in the last 30 seconds of the round`
      });
    }
    
    // Update selection status
    selection.status = "cancelled";
    
    // Refund user's wallet
    const user = await User.findById(userId);
    user.wallet.balance += selection.amount;
    
    // Create wallet transaction
    const transaction = new WalletTransaction({
      user: userId,
      amount: selection.amount,
      type: "refund",
      description: `Refund for cancelled bet on number ${selection.number} in round ${round.roundNumber}`,
      balanceAfter: user.wallet.balance,
      relatedEntity: {
        type: "selection",
        id: selection._id
      }
    });
    
    // Save all changes in a transaction
    await Promise.all([
      selection.save(),
      user.save(),
      transaction.save()
    ]);
    
    res.json({
      success: true,
      message: "Selection cancelled successfully",
      data: {
        walletBalance: user.wallet.balance
      }
    });
    
  } catch (error) {
    console.error("Error cancelling selection:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling selection"
    });
  }
};

/**
 * Get Current User Selections
 */
const getCurrentSelections = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current active round
    const currentRound = await Result.findOne({ status: "active" }).sort({ createdAt: -1 });
    
    if (!currentRound) {
      return res.status(404).json({
        success: false,
        message: "No active round found"
      });
    }
    
    // Get user's selections for current round
    const selections = await NumberSelection.find({
      user: userId,
      round: currentRound._id,
      status: "active"
    });
    
    res.json({
      success: true,
      message: "Current selections retrieved successfully",
      data: {
        roundNumber: currentRound.roundNumber,
        endTime: currentRound.endTime,
        selections: selections.map(s => ({
          id: s._id,
          number: s.number,
          classType: s.classType,
          amount: s.amount,
          createdAt: s.createdAt
        }))
      }
    });
    
  } catch (error) {
    console.error("Error getting current selections:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving current selections"
    });
  }
};

/**
 * Get All Game Rounds with Pagination
 */
const getAllRounds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const rounds = await Result.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('roundNumber status startTime endTime winningNumbers createdAt');

    const totalRounds = await Result.countDocuments();
    const totalPages = Math.ceil(totalRounds / limit);

    res.json({
      success: true,
      message: "Game rounds retrieved successfully",
      data: {
        rounds: rounds.map(round => ({
          id: round._id,
          roundNumber: round.roundNumber,
          status: round.status,
          startTime: round.startTime,
          endTime: round.endTime,
          winningNumbers: round.winningNumbers,
          createdAt: round.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalRounds,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching all game rounds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game rounds"
    });
  }
};

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
