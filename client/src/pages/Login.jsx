import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setAuthToken, apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest(
        api.post('/api/auth/login', { email, password })
      );

      const { token, user } = res.data;

      setAuthToken(token);
      login(token, user);
      toast.success('Login successful');
      navigate('/chat');
    } catch (err) {
      // apiRequest handles toast.error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm rounded-14">
            <div className="card-body p-4">
              <h4 className="mb-3">Login</h4>

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm" />
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>

                <div className="mt-3 text-center">
                  <span className="text-muted">No account? </span>
                  <Link to="/register" className="text-decoration-none">
                    Register
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-3 text-center small text-muted">
            This app uses JWT auth + Socket.IO realtime messaging.
          </div>
        </div>
      </div>
    </div>
  );
}
