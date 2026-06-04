const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const existing = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existing) {
    return res.status(409).json({ error: 'username or email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed
  });

  const token = signToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      onlineStatus: user.onlineStatus
    }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      onlineStatus: user.onlineStatus
    }
  });
};

exports.me = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      onlineStatus: user.onlineStatus
    }
  });
};
