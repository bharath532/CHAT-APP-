import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/Loader.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = React.useState(user?.profileImage || '');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setProfileImage(user?.profileImage || '');
  }, [user?.profileImage]);

  if (!user) return <Loader />;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm rounded-14">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  className="profile-avatar profile-avatar-lg"
                  src={profileImage || '/default-avatar.png'}
                  alt="Profile"
                />
                <div>
                  <div className="fw-semibold" style={{ fontSize: 18 }}>
                    {user.username}
                  </div>
                  <div className="text-muted small">{user.email}</div>
                </div>
              </div>

              <hr />

              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Online status</div>
                      <div className="fw-semibold">
                        {user.onlineStatus === 'online' ? 'Online' : 'Offline'}
                      </div>
                    </div>

                    <a href="/profile/edit" className="btn btn-primary btn-sm">
                      Edit Profile
                    </a>
                  </div>
                </div>
              </div>

              {loading ? <Loader /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
