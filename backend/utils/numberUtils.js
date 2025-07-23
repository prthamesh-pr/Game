/**
 * Validate 3-digit number format
 * @param {string} number - 3-digit number string
 * @returns {boolean} Is valid 3-digit number
 */
const isValid3DigitNumber = (number) => {
  return /^\d{3}$/.test(number) && number.length === 3;
};

/**
 * Check if number belongs to Class A (all same digits)
 * @param {string} number - 3-digit number
 * @returns {boolean} Is Class A number
 */
const isClassA = (number) => {
  if (!isValid3DigitNumber(number)) return false;
  const digits = number.split('');
  return digits[0] === digits[1] && digits[1] === digits[2];
};

/**
 * Check if number belongs to Class B (exactly 2 same digits)
 * @param {string} number - 3-digit number
 * @returns {boolean} Is Class B number
 */
const isClassB = (number) => {
  if (!isValid3DigitNumber(number)) return false;
  const digits = number.split('');
  const uniqueDigits = [...new Set(digits)];
  
  // Must have exactly 2 unique digits (meaning 2 same + 1 different)
  if (uniqueDigits.length !== 2) return false;
  
  // Count occurrences of each digit
  const digitCounts = {};
  digits.forEach(digit => {
    digitCounts[digit] = (digitCounts[digit] || 0) + 1;
  });
  
  // Should have one digit appearing twice and one appearing once
  const counts = Object.values(digitCounts);
  return counts.includes(2) && counts.includes(1);
};

/**
 * Check if number belongs to Class C (all different digits)
 * @param {string} number - 3-digit number
 * @returns {boolean} Is Class C number
 */
const isClassC = (number) => {
  if (!isValid3DigitNumber(number)) return false;
  const digits = number.split('');
  const uniqueDigits = [...new Set(digits)];
  return uniqueDigits.length === 3; // All digits are different
};

/**
 * Determine the class of a number
 * @param {string} number - 3-digit number
 * @returns {string|null} 'A', 'B', 'C', or null if invalid
 */
const determineNumberClass = (number) => {
  if (isClassA(number)) return 'A';
  if (isClassB(number)) return 'B';
  if (isClassC(number)) return 'C';
  return null;
};

/**
 * Generate all valid numbers for a specific class
 * @param {string} classType - 'A', 'B', or 'C'
 * @returns {string[]} Array of valid numbers
 */
const generateValidNumbers = (classType) => {
  const validNumbers = [];
  
  for (let i = 0; i <= 999; i++) {
    const number = i.toString().padStart(3, '0');
    
    switch (classType) {
      case 'A':
        if (isClassA(number)) validNumbers.push(number);
        break;
      case 'B':
        if (isClassB(number)) validNumbers.push(number);
        break;
      case 'C':
        if (isClassC(number)) validNumbers.push(number);
        break;
    }
  }
  
  return validNumbers;
};

/**
 * Calculate winning amount based on class and bet
 * @param {string} classType - 'A', 'B', or 'C'
 * @param {number} betAmount - Amount bet
 * @returns {number} Winning amount
 */
const calculateWinningAmount = (classType, betAmount) => {
  const multipliers = {
    'A': 100,  // Class A has lowest probability, highest reward
    'B': 10,   // Class B has medium probability, medium reward
    'C': 5     // Class C has highest probability, lowest reward
  };
  
  return betAmount * (multipliers[classType] || 1);
};

/**
 * Generate random number for specific class (for admin use)
 * @param {string} classType - 'A', 'B', or 'C'
 * @returns {string} Random valid number for the class
 */
const generateRandomNumberForClass = (classType) => {
  const validNumbers = generateValidNumbers(classType);
  const randomIndex = Math.floor(Math.random() * validNumbers.length);
  return validNumbers[randomIndex];
};

/**
 * Validate mobile number format (Indian mobile numbers)
 * @param {string} mobile - Mobile number
 * @returns {boolean} Is valid mobile number
 */
const isValidMobile = (mobile) => {
  // Indian mobile number: 10 digits starting with 6,7,8,9
  return /^[6-9]\d{9}$/.test(mobile);
};

/**
 * Validate username format
 * @param {string} username - Username
 * @returns {boolean} Is valid username
 */
const isValidUsername = (username) => {
  // Username: 3-20 characters, alphanumeric and underscore only
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

module.exports = {
  isValid3DigitNumber,
  isClassA,
  isClassB,
  isClassC,
  determineNumberClass,
  generateValidNumbers,
  calculateWinningAmount,
  generateRandomNumberForClass,
  isValidMobile,
  isValidUsername
};
