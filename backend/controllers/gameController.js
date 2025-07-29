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
 * Static game numbers for each class
 */
const GAME_NUMBERS = {
  A: {
    title: 'Class A',
    numbers: [
      '0','127','136','145','190','235','280','370','479','460','569','389','578','1','128','137','146','236','245','290','380','470','489','560','678','579','2','129','138','147','156','237','246','345','390','480','570','589','679','3','120','139','148','157','238','247','256','346','490','580','175','256','4','130','149','158','167','239','248','257','347','356','590','680','789','5','140','159','168','230','249','258','267','348','357','456','690','780','6','123','150','169','178','240','259','268','349','358','457','367','790','7','124','160','179','250','269','278','340','359','368','458','467','890','8','125','134','170','189','260','279','350','369','378','459','567','468','9','135','180','234','270','289','360','379','450','469','478','568','679'
    ]
  },
  B: {
    title: 'Class B',
    numbers: [
      '0','550','668','244','299','226','334','488','667','118','1','100','119','155','227','335','344','399','588','669','2','200','110','228','255','336','449','660','688','778','3','300','166','229','337','355','445','599','779','788','4','400','112','220','266','338','446','455','699','770','5','500','113','122','177','339','366','447','799','889','6','600','114','277','330','448','466','556','880','899','7','700','115','133','188','223','377','449','557','566','8','800','116','224','233','288','440','477','558','990','9','900','117','144','199','225','388','559','577','667'
    ]
  },
  C: {
    title: 'Class C',
    numbers: [
      '000','111','222','333','444','555','666','777','888','999'
    ]
  },
  D: {
    title: 'Class D',
    numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  }
};

/**
 * Select Number for Game
 */
const selectNumber = async (req, res) => {
  try {
    // Accept userId from body if provided (for admin placing on behalf of user)
    const userId = req.body.userId || req.user.id;
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
      const { classType, number, amount, timeSlot } = sel;
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
      results.push({ success: true, classType, number, amount, timeSlot });
    }

    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ success: false, message: "Insufficient balance for all selections" });
    }

    let createdSelections = [];
    for (let i = 0; i < selections.length; i++) {
      if (!results[i].success) continue;
      const { classType, number, amount, timeSlot } = selections[i];
      const newSelection = new NumberSelection({
        userId,
        roundId: currentRound.roundId,
        number,
        classType,
        amount,
        status: "pending",
        placedAt: timeSlot ? new Date(timeSlot) : new Date()
      });
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
        metadata: { classType, selectedNumber: number, timeSlot: timeSlot || null, userId }
      });
      await newSelection.save();
      await transaction.save();
      createdSelections.push({
        id: newSelection._id,
        userId: newSelection.userId,
        classType: newSelection.classType,
        number: newSelection.number,
        amount: newSelection.amount,
        timeSlot: newSelection.placedAt,
        roundId: newSelection.roundId,
        createdAt: newSelection.createdAt
      });
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
    // ...existing code...
    res.json({
      success: true,
      message: "Recent results retrieved successfully",
      data: {
        rounds: completedRounds,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error getting recent results:", error);
    res.status(500).json({ success: false, message: "Error retrieving recent results" });
  }
}
/**
 * Get User Selection History
 */
const getUserSelectionHistory = async (req, res) => {
  try {
    const userId = req.body.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const selections = await NumberSelection.find({ userId })
      .sort({ placedAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalSelections = await NumberSelection.countDocuments({ userId });
    res.json({
      success: true,
      message: "Selection history retrieved successfully",
      data: {
        selections: selections.map(sel => ({
          id: sel._id,
          userId: sel.userId,
          classType: sel.classType,
          number: sel.number,
          amount: sel.amount,
          timeSlot: sel.placedAt,
          roundId: sel.roundId,
          status: sel.status,
          winningAmount: sel.winningAmount,
          resultProcessedAt: sel.resultProcessedAt,
          createdAt: sel.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalSelections / limit),
          totalSelections,
          hasNextPage: page < Math.ceil(totalSelections / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error fetching selection history:", error);
    res.status(500).json({ success: false, message: "Error fetching selection history" });
  }
};

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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const completedRounds = await Result.find({ status: "completed" })
      .sort({ endTime: -1 })
      .skip(skip)
      .limit(limit);
    const totalCount = await Result.countDocuments({ status: "completed" });
    const results = completedRounds.map(round => ({
      roundId: round.roundId,
      resultDate: round.endTime,
      classes: ['A','B','C','D'].map(cls => {
        const classObj = round['class' + cls] || {};
        const winnersArr = Array.isArray(round.winners) ? round.winners : [];
        return {
          gameClass: cls,
          winningNumber: classObj && classObj.winningNumber ? classObj.winningNumber : '',
          drawnNumbers: winnersArr.filter(w => w.classType === cls).map(w => w.number),
          totalPrize: classObj && typeof classObj.totalWinnings === 'number' ? classObj.totalWinnings : 0,
          totalPlayers: classObj && typeof classObj.totalBets === 'number' ? classObj.totalBets : 0
        };
      })
    }));
    res.json({
      success: true,
      message: "Recent results retrieved successfully",
      data: {
        results,
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
    res.status(500).json({ success: false, message: "Error retrieving recent results" });
  }
};

/**
 * Get Game Numbers for a Given Class
 */
const getGameNumbers = (req, res) => {
  const gameClass = req.query.class || 'A';
  const classData = GAME_NUMBERS[gameClass];
  if (!classData) {
    return res.status(400).json({ success: false, message: 'Invalid game class' });
  }
  res.json({ success: true, data: { title: classData.title, numbers: classData.numbers } });
};

module.exports = {
  selectNumber: selectNumber,
  getCurrentRound: getCurrentRound,
  getValidNumbers: getValidNumbers,
  getGameInfo: getGameInfo,
  getRecentResults: getRecentResults,
  getUserSelectionHistory: getUserSelectionHistory,
  cancelSelection: cancelSelection,
  getCurrentSelections: getCurrentSelections,
  getAllRounds: getAllRounds,
  getGameNumbers: getGameNumbers
};

