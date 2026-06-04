import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader.jsx';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [username, setUsername] = React.useState(user?.username || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [profileImage, setProfileImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user?.username, user?.email]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/users/me', {
        username,
        email
      });

      toast.success(res.data?.message || 'Profile updated');

      // refresh local user in AuthContext
      navigate('/profile');
    } catch (err) {
      // apiRequest/axios interceptor not used here; ensure toast exists
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!profileImage) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append('profileImage', profileImage);

      const res = await api.post('/api/users/me/profile-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(res.data?.message || 'Image uploaded');
      navigate('/profile');
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload image';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm rounded-14">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Edit Profile</h5>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/profile')}>
                  Back
                </button>
              </div>

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                  />
                </div>

                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" />
                      Saving...
                    </span>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="mb-2 text-muted small">Upload profile image</div>

              <div className="d-flex flex-column gap-2">
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                />

                <button
                  className="btn btn-outline-primary w-100"
                  onClick={uploadImage}
                  disabled={loading || !profileImage}
                  type="button"
                >
                  {loading ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" />
                      Uploading...
                    </span>
                  ) : (
                    'Upload image'
                  )}
                </button>
              </div>

              {token ? (
                <div className="mt-3 small text-muted">
                  Uploaded images are served from <code>/uploads</code>.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
