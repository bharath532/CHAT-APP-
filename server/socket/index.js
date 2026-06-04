const initSocketHandlers = require('./handlers');
const events = require('./events');
const jwt = require('jsonwebtoken');

function initSocket(io) {
  io.on('connection', (socket) => {
    const { token } = socket.handshake.auth || {};

    // Verify JWT at socket connection for correctness
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.id || payload.userId;
        if (userId) {
          socket.data.userId = userId;
          socket.join(`user:${userId}`);
          socket.data.tokenVerified = true;

          // Notify others that this user is online (best effort)
          socket.broadcast.emit(events.USER_ONLINE, { userId });
        }
      } catch (_e) {
        // If invalid token, keep socket unauthenticated (no room join)
      }
    }

    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (!userId) return;

      io.emit(events.USER_OFFLINE, { userId });
    });

    initSocketHandlers(io, socket);
  });
}

module.exports = { initSocket };
