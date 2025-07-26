// Result Controller - Handles result logic
exports.getAllResults = (req, res) => {
  // TODO: Fetch all results from DB
  res.json({ message: 'Get all results' });
};

exports.setResult = (req, res) => {
  // TODO: Set or update result for a round
  res.json({ message: 'Set or update result' });
};

exports.getPublishedResults = (req, res) => {
  // TODO: Fetch published results
  res.json({ message: 'Get published results' });
};
