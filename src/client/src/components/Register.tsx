import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../states/AuthContext';
import Sidebar from './Sidebar';
import '../styles/login-page.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function validate() {
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return false;
    }
    
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    setError(null);
    return true;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const userData = { name, email, role };

    setTimeout(() => {
      setSuccess('Registration successful! Logging you in...');
      console.log('Mock user created:', userData);
      
      setTimeout(() => {
        login(userData);
        navigate('/home');
      }, 1000);
    }, 500);
  }

  const PasswordToggle = ({ 
    show, 
    onClick, 
    ariaLabel 
  }: { 
    show: boolean; 
    onClick: () => void; 
    ariaLabel: string;
  }) => (
    <button
      type="button"
      className="password-toggle"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {show ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <section className="login-card" aria-labelledby="register-title">
          <h2 id="register-title">Create Account</h2>
          <p className="muted">Join Office Calendar to manage your schedule.</p>
          
          {success && (
            <div style={{ color: '#0f5132', background: '#d1e7dd', padding: '8px', borderRadius: '6px', marginBottom: '12px' }}>
              {success}
            </div>
          )}

          <form onSubmit={submit} className="login-form" noValidate>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="username"
              required
            />

            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Admin' | 'User')}
              style={{
                padding: '10px 12px',
                border: '1px solid #d9e2ec',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>

            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
              <PasswordToggle
                show={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                ariaLabel={showPassword ? 'Hide password' : 'Show password'}
              />
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
              <PasswordToggle
                show={showConfirmPassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ariaLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              />
            </div>

            {error && <div role="alert" className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="primary">Create Account</button>
            </div>
          </form>
          
          <div className="login-footer muted">
            Already have an account? <Link to="/login" style={{ color: '#1f6feb' }}>Sign in</Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;