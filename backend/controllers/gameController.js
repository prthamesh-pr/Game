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
    const userId = req.user.id;
    const selections = Array.isArray(req.body.selections) ? req.body.selections : [req.body];

    // Get current active round
    const currentRound = await Result.findOne({ status: "active" }).sort({ createdAt: -1 });
    if (!currentRound) {
      return res.status(400).json({ success: false, message: "No active round found" });
    }

    // Enforce betting window: only allow bets in first 50 minutes of each hour
    const now = new Date();
    const roundStart = new Date(currentRound.startTime);
    const roundEnd = new Date(currentRound.endTime);
    const minutesSinceStart = Math.floor((now - roundStart) / 60000);
    const minutesToEnd = Math.floor((roundEnd - now) / 60000);
    if (minutesSinceStart < 0 || minutesToEnd < 0) {
      return res.status(400).json({ success: false, message: "Betting is not open for this round." });
    }
    if (minutesToEnd < 10) {
      return res.status(400).json({ success: false, message: "Betting is locked for the last 10 minutes of the round." });
    }

    // Get user and check total amount
    const user = await User.findById(userId);
    let totalAmount = 0;
    let results = [];

    for (const sel of selections) {
      const { classType, number, amount } = sel;
      // Validate inputs
      if (!["A", "B", "C", "D"].includes(classType)) {
        results.push({ success: false, message: `Invalid class type for ${number}` });
        continue;
      }
      if (classType === 'D') {
        if (!/^[1-9]$/.test(number)) {
          results.push({ success: false, message: `Number must be 1-9 for Class D (${number})` });
          continue;
        }
      } else {
        if (!isValid3DigitNumber(number)) {
          results.push({ success: false, message: `Number must be a valid 3-digit number (${number})` });
          continue;
        }
        const calculatedClass = determineNumberClass(number);
        if (calculatedClass !== classType) {
          results.push({ success: false, message: `Number ${number} belongs to class ${calculatedClass}, not ${classType}` });
          continue;
        }
      }
      const minAmount = 10;
      const maxAmount = 1000;
      if (amount < minAmount || amount > maxAmount) {
        results.push({ success: false, message: `Amount for ${number} must be between ${minAmount} and ${maxAmount}` });
        continue;
      }
      // Check for duplicate selection
      const existingSelection = await NumberSelection.findOne({ userId, roundId: currentRound.roundId, number, classType });
      if (existingSelection) {
        results.push({ success: false, message: `Already selected ${number} for this round` });
        continue;
      }
      totalAmount += amount;
      results.push({ success: true, classType, number, amount });
    }

    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ success: false, message: "Insufficient balance for all selections" });
    }

    let createdSelections = [];
    for (let i = 0; i < selections.length; i++) {
      if (!results[i].success) continue;
      const { classType, number, amount } = selections[i];
      const newSelection = new NumberSelection({ userId, roundId: currentRound.roundId, number, classType, amount, status: "pending" });
      const balanceBefore = user.walletBalance;
      user.walletBalance -= amount;
      const transaction = new WalletTransaction({
        userId,
        type: "debit",
        amount,
        source: "game-play",
        description: `Bet placed for number ${number} in round ${currentRound.roundId}`,
        balanceBefore,
        balanceAfter: user.walletBalance,
        roundId: currentRound.roundId,
        metadata: { classType, selectedNumber: number }
      });
      await newSelection.save();
      await transaction.save();
      createdSelections.push({ id: newSelection._id, number, classType, amount, roundId: currentRound.roundId, createdAt: newSelection.createdAt });
    }
    await user.save();
    res.status(201).json({
      success: true,
      message: "Selections processed",
      data: {
        selections: createdSelections,
        walletBalance: user.walletBalance,
        results
      }
    });
  } catch (error) {
    console.error("Error selecting number:", error);
    res.status(500).json({ success: false, message: "Error selecting number" });
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
    
    if (!["A", "B", "C", "D"].includes(classType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class type. Must be A, B, C, or D"
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
