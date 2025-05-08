const User = require('../models/User');
const Item = require('../models/Item');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const items = await Item.find({ owner: req.user.id });
    res.json({ user, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate user
exports.rateUser = async (req, res) => {
  const { userId, score, comment } = req.body;
  const reviewer = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add review (use 'rating' to match schema)
    user.reviews.push({ reviewer, rating: score, comment });

    // Update average rating
    const totalScore = user.reviews.reduce((sum, review) => sum + review.rating, 0);
    user.rating = user.reviews.length > 0 ? totalScore / user.reviews.length : score;

    await user.save();
    res.json({ message: 'Rating submitted' });
  } catch (err) {
    console.error('Error in rateUser:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};