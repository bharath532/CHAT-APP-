const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true, minlength: 3 },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // hashed
    profileImage: { type: String, default: '' }, // url/path
    onlineStatus: { type: String, default: 'offline', enum: ['online', 'offline'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
