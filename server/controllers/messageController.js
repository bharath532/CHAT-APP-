const Message = require('../models/Message');

exports.getConversation = async (req, res) => {
  const userId = req.user?.id;
  const { receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: receiverId },
      { sender: receiverId, receiver: userId }
    ]
  })
    .sort({ createdAt: 1 })
    .select('sender receiver message seen createdAt');

  return res.json({ messages });
};

exports.markAsSeen = async (req, res) => {
  const userId = req.user?.id;
  const { senderId } = req.params;

  // Mark messages "from senderId to me" as seen
  const result = await Message.updateMany(
    { sender: senderId, receiver: userId, seen: false },
    { $set: { seen: true } }
  );

  return res.json({ updatedCount: result.modifiedCount || 0 });
};
