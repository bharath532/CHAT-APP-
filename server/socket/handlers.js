const Message = require('../models/Message');
const events = require('./events');

/**
 * Socket.IO handlers implementing:
 * - online/offline presence
 * - typing indicator
 * - one-to-one realtime messaging
 * - delivery status (sent -> delivered when receiver is online)
 * - read receipts (receiver opens chat -> server marks seen and notifies sender)
 *
 * Room strategy:
 * - each user joins room: `user:${userId}` (done in socket/index.js)
 * - for conversation join, we also join sender/receiver room if needed later (kept simple)
 */
function initSocketHandlers(io, socket) {
  const userId = socket.data.userId;

  // Notify others that user is online (best effort)
  if (userId) {
    socket.broadcast.emit(events.USER_ONLINE, { userId });
  }

  socket.on(events.JOIN_CONVERSATION, ({ otherUserId }) => {
    if (!userId) return;
    if (!otherUserId) return;

    // Mark as "read" when receiver joins the conversation room.
    // We interpret that the user is actively viewing the chat with otherUserId.
    Message.updateMany(
      { sender: otherUserId, receiver: userId, seen: false },
      { $set: { seen: true } }
    )
      .then(() => {
        // Notify sender that messages are read
        io.to(`user:${otherUserId}`).emit(events.MESSAGE_READ, {
          senderId: otherUserId,
          receiverId: userId
        });
      })
      .catch(() => {
        // no-op (kept lightweight)
      });
  });

  socket.on(events.TYPING, ({ toUserId }) => {
    if (!userId) return;
    if (!toUserId) return;

    io.to(`user:${toUserId}`).emit(events.TYPING, {
      fromUserId: userId,
      toUserId
    });
  });

  // Client sends message payload
  socket.on(events.MESSAGE_SENT, async ({ toUserId, message }) => {
    if (!userId) return;
    if (!toUserId) return;

    const msgText = typeof message === 'string' ? message.trim() : '';
    if (!msgText) return;

    const saved = await Message.create({
      sender: userId,
      receiver: toUserId,
      message: msgText,
      seen: false
    });

    // Delivery: if receiver is connected to their personal room, treat as delivered.
    // Socket.IO doesn't expose onlineStatus reliably; we infer delivery by room presence.
    const receiverRoom = `user:${toUserId}`;
    const receiverSockets = await io.in(receiverRoom).fetchSockets();

    io.to(receiverRoom).emit(events.MESSAGE_DELIVERED, {
      messageId: saved._id,
      senderId: userId,
      receiverId: toUserId,
      message: saved.message,
      createdAt: saved.createdAt
    });

    // Notify sender that message was delivered (also useful for status UI)
    io.to(`user:${userId}`).emit(events.MESSAGE_DELIVERED, {
      messageId: saved._id,
      senderId: userId,
      receiverId: toUserId,
      message: saved.message,
      createdAt: saved.createdAt,
      delivered: receiverSockets.length > 0
    });
  });

  socket.on('disconnect', () => {
    // socket/index.js already emits USER_OFFLINE, handlers keep clean.
  });
}

module.exports = initSocketHandlers;
