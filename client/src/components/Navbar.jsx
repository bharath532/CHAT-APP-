import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-transparent px-3 py-2">
      <div className="container-fluid">
        <Link to={user ? '/chat' : '/'} className="navbar-brand fw-bold">
          ChatApp
        </Link>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={toggleTheme} type="button">
            {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>

          {user ? (
            <>
              <Link to="/profile" className="btn btn-outline-secondary btn-sm">
                Profile
              </Link>
              <button className="btn btn-danger btn-sm" onClick={onLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
