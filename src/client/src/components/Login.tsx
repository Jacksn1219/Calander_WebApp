import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../hooks/hooks';
import Sidebar from './Sidebar';
import '../styles/login-page.css';

const Login: React.FC = () => {

  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    showPassword,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <section className="login-card" aria-labelledby="login-title">
          <h2 id="login-title">Sign in to Office Calendar</h2>
          <p className="muted">Enter your email and password to continue.</p>
          {error && <div role="alert" className="banner banner-error">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
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
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
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
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">Sign in</button>
            </div>
          </form>
          <div className="login-footer muted">
            Demo (Super Admin): bart@test.com / 1234
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;