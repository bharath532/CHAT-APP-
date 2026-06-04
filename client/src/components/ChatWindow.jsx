import React from 'react';
import io from 'socket.io-client';

import MessageBubble from './MessageBubble.jsx';
import Loader from './Loader.jsx';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { EVENTS } from '../socket/eventsClient.js';

export default function ChatWindow({
  me,
  activeUser,
  messages,
  setMessages,
  loadingMessages
}) {
  const socketRef = React.useRef(null);
  const [draft, setDraft] = React.useState('');
  const [typing, setTyping] = React.useState(false);

  const { token: authToken } = useAuth(); // same token, ensures latest

  const ensureSocket = React.useCallback(() => {
    // Recreate socket if auth token changed (prevents auth mismatch on reconnect)
    if (socketRef.current && socketRef.current.auth?.token === authToken) return socketRef.current;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Pass token as handshake.auth.token so server verifies
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      autoConnect: true,
      auth: { token: authToken }
    });

    socketRef.current = socket;
    return socket;
  }, [authToken]);

  // Connect & bind events
  React.useEffect(() => {
    if (!activeUser?.id) return;

    const socket = ensureSocket();

    const onTyping = ({ fromUserId }) => {
      if (fromUserId === activeUser.id) setTyping(true);
      window.clearTimeout(socket.__typingTimeout);
      socket.__typingTimeout = window.setTimeout(() => setTyping(false), 1200);
    };

    const onMessageDelivered = (payload) => {
      // Delivery: update local message delivery/read UI if present.
      // We don't have separate delivery flag in DB model; keep as lightweight.
      // Optionally you can show a "Delivered" status in MessageBubble.
      if (!payload?.messageId) return;
      // no-op for now
    };

    const onMessageRead = ({ senderId, receiverId }) => {
      // When active user reads, mark seen for the relevant conversation in our local UI.
      if (senderId !== activeUser.id && receiverId !== activeUser.id) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.sender === activeUser.id && m.receiver === me?.id
            ? { ...m, seen: true }
            : m
        )
      );
    };

    socket.on(EVENTS.TYPING, onTyping);
    socket.on('message:delivered', onMessageDelivered);
    socket.on('message:read', onMessageRead);

    // Join conversation to trigger server-side seen update
    socket.emit('conversation:join', { otherUserId: activeUser.id });
    
    return () => {
      socket.off(EVENTS.TYPING, onTyping);
      socket.off('message:delivered', onMessageDelivered);
      socket.off('message:read', onMessageRead);
    };
  }, [activeUser?.id, ensureSocket, me?.id, setMessages]);

  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, loadingMessages]);

  const markSeen = React.useCallback(async () => {
    if (!activeUser?.id) return;
    try {
      await api.post(`/api/messages/seen/${activeUser.id}`);
    } catch (e) {
      // best-effort
    }
  }, [activeUser?.id]);

  React.useEffect(() => {
    // When we open chat, mark seen via REST (also triggered by socket join)
    if (activeUser?.id) markSeen();
  }, [activeUser?.id, markSeen]);

  const sendMessage = React.useCallback(() => {
    if (!activeUser?.id) return;
    const text = draft.trim();
    if (!text) return;

    const socket = ensureSocket();
    socket.emit('message:sent', { toUserId: activeUser.id, message: text });

    // optimistic append
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      sender: me.id,
      receiver: activeUser.id,
      message: text,
      seen: false,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
  }, [draft, ensureSocket, activeUser?.id, me?.id, setMessages]);

  const onTyping = React.useMemo(() => {
    let last = 0;
    return (e) => {
      const val = e.target.value;
      setDraft(val);

      const now = Date.now();
      if (!activeUser?.id) return;
      if (now - last < 400) return;
      last = now;

      const socket = ensureSocket();
      socket.emit(EVENTS.TYPING, { toUserId: activeUser.id });
    };
  }, [activeUser?.id, ensureSocket]);

  if (!activeUser) {
    return (
      <div className="chat-main h-100 d-flex align-items-center justify-content-center p-4">
        <div className="text-center">
          <div className="mb-2 fw-semibold">Select a chat</div>
          <div className="text-muted small">Search users in the left sidebar.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main h-100">
      <div className="chat-header d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-3">
          <img
            className="profile-avatar"
            src={activeUser.profileImage || '/default-avatar.png'}
            alt=""
          />
          <div>
            <div className="fw-semibold">{activeUser.username}</div>
            <div className="small text-muted">
              {activeUser.onlineStatus === 'online' ? 'Online' : 'Offline'}{' '}
              {typing ? <span className="typing-indicator">• typing...</span> : null}
            </div>
          </div>
        </div>

        <button className="btn btn-outline-primary btn-sm" onClick={() => markSeen()}>
          Mark seen
        </button>
      </div>

      <div ref={scrollRef} className="message-list">
        {loadingMessages ? (
          <Loader />
        ) : (
          <div className="d-flex flex-column gap-2">
            {messages.map((m) => (
              <MessageBubble
                key={m._id || `${m.sender}-${m.createdAt}`}
                msg={m}
                isMe={m.sender === me.id}
              />
            ))}
          </div>
        )}
      </div>

      <div className="chat-footer">
        <div className="input-group">
          <input
            value={draft}
            onChange={onTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            className="form-control"
            placeholder="Type a message..."
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
