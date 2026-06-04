const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

function getPublicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    onlineStatus: user.onlineStatus
  };
}

exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  const meId = req.user?.id;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query param q is required' });
  }

  const users = await User.find({
    _id: meId ? { $ne: meId } : undefined,
    username: { $regex: q, $options: 'i' }
  })
    .select('username email profileImage onlineStatus')
    .limit(15);

  return res.json({ users: users.map(getPublicUser) });
};

exports.updateProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { username, email } = req.body;

  const updates = {};
  if (username) updates.username = username.trim();
  if (email) updates.email = email.trim().toLowerCase();

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({ user: getPublicUser(user) });
};

exports.uploadProfileImage = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // multer places the uploaded file on req.file
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Store relative URL path for frontend
  const relativePath = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    userId,
    { profileImage: relativePath },
    { new: true }
  ).select('-password');

  return res.json({ user: getPublicUser(user) });
};
