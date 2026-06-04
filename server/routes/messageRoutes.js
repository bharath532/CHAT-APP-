const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getConversation, markAsSeen } = require('../controllers/messageController');

const router = express.Router();

router.get('/conversation/:receiverId', authMiddleware, getConversation);
router.post('/seen/:senderId', authMiddleware, markAsSeen);

module.exports = router;
