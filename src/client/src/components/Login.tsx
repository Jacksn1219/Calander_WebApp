import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/login-page.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function validate() {
    if (!email || !password) {
      setError('Email and password are required.');
      return false;
    }
    // simple email check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    setError(null);
    return true;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // dummy authentication - replace with real API call when backend ready
    if (email === 'admin@example.com' && password === 'Password123') {
      navigate('/home');
      return;
    }
    setError('Invalid credentials. Use admin@example.com / Password123 for demo.');
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <section className="login-card" aria-labelledby="login-title">
          <h2 id="login-title">Sign in to Office Calendar</h2>
          <p className="muted">Enter your email and password to continue.</p>
          <form onSubmit={submit} className="login-form" noValidate>
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

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />

            {error && <div role="alert" className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="primary">Sign in</button>
            </div>
          </form>
          <div className="login-footer muted">Demo: admin@example.com / Password123</div>
        </section>
      </main>
    </div>
  );
};

export default Login;
