import React from 'react';

export default function MessageBubble({ msg, isMe }) {
  const text = msg.message || '';
  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`bubble ${isMe ? 'me' : 'them'}`}>
      <div className="small">{text}</div>
      <div className="d-flex align-items-center justify-content-end gap-2 mt-1">
        <span className="small" style={{ color: 'rgba(107,114,128,0.95)' }}>
          {time}
        </span>

        {isMe ? (
          <span className="small" style={{ color: msg.seen ? '#0d6efd' : 'rgba(107,114,128,0.95)' }}>
            {msg.seen ? 'Read' : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}
