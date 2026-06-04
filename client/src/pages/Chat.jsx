import React from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import Loader from '../components/Loader.jsx';

export default function Chat() {
  const { user, token } = useAuth();

  const [activeUser, setActiveUser] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [loadingMessages, setLoadingMessages] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');

  // Axios base is already set; but we set the auth header from token
  React.useEffect(() => {
    // handled globally by AuthContext token usage + manual setAuthToken in login/register
  }, []);

  const fetchConversation = React.useCallback(async (receiverId) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/messages/conversation/${receiverId}`);
      setMessages(res.data.messages || []);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load typing/message events through ChatWindow; this page focuses on layout + data
  const handleSelectUser = async (u) => {
    setActiveUser(u);
    await fetchConversation(u.id);
  };

  if (!user) return <Loader />;

  return (
    <div className="container-fluid py-3">
      <div className="row g-3 align-items-stretch">
        <div className="col-12 col-xl-4 col-lg-4">
          <Sidebar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSelectUser={handleSelectUser}
            activeUserId={activeUser?.id}
          />
        </div>

        <div className="col-12 col-xl-8 col-lg-8">
          <ChatWindow
            key={activeUser?.id || 'none'}
            me={user}
            token={token}
            activeUser={activeUser}
            messages={messages}
            setMessages={setMessages}
            loadingMessages={loadingMessages}
          />
        </div>
      </div>
    </div>
  );
}
