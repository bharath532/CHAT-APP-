import React from 'react';
import { api } from '../services/api';

import Loader from './Loader.jsx';

export default function Sidebar({ query, onQueryChange, onSelectUser, activeUserId }) {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function run() {
      const q = query?.trim();
      if (!q) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
        if (!active) return;
        setUsers(res.data.users || []);
      } finally {
        if (active) setLoading(false);
      }
    }

    const t = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <div className="chat-sidebar h-100 d-flex flex-column">
      <div className="chat-header">
        <div className="fw-semibold mb-2">Chats</div>
        <input
          className="form-control form-control-sm"
          placeholder="Search users..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="message-list flex-grow-1">
        {loading && <Loader />}

        {!loading && users.length === 0 && query?.trim() ? (
          <div className="text-muted small">No users found.</div>
        ) : null}

        {!loading && users.length === 0 && !query?.trim() ? (
          <div className="text-muted small">Type to search users.</div>
        ) : null}

        {!loading &&
          users.map((u) => {
            const isActive = u.id === activeUserId;
            return (
              <button
                key={u.id}
                className="btn w-100 d-flex align-items-center gap-3 text-start"
                style={{
                  borderRadius: 12,
                  background: isActive ? 'rgba(13,110,253,0.10)' : 'transparent',
                  border: '1px solid transparent',
                  padding: '10px 12px'
                }}
                onClick={() => onSelectUser(u)}
              >
                <img className="profile-avatar" src={u.profileImage || '/default-avatar.png'} alt="" />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="fw-semibold" style={{ fontSize: 14 }}>
                      {u.username}
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: u.onlineStatus === 'online' ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.20)',
                        color: u.onlineStatus === 'online' ? '#10b981' : 'inherit'
                      }}
                    >
                      {u.onlineStatus}
                    </span>
                  </div>
                  <div className="text-muted small" style={{ marginTop: 2 }}>
                    {isActive ? 'Active chat' : 'Tap to open'}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
