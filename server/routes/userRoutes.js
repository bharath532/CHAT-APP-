const express = require('express');
const multer = require('multer');
const path = require('path');

const authMiddleware = require('../middleware/authMiddleware');
const { searchUsers, updateProfile, uploadProfileImage } = require('../controllers/userController');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + Date.now();
    cb(null, safeName + ext);
  }
});

const fileFilter = (_req, file, cb) => {
  // Basic image filter
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

router.get('/search', authMiddleware, searchUsers);
router.put('/me', authMiddleware, updateProfile);
router.post('/me/profile-image', authMiddleware, upload.single('profileImage'), uploadProfileImage);

module.exports = router;
