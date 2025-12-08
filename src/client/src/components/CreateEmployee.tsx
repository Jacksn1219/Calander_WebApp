import React from 'react';
import Sidebar from './Sidebar';
import { useCreateEmployeeForm } from '../hooks/hooks';
import '../styles/login-page.css';

const CreateEmployee: React.FC = () => {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    canAssignAdminRole,
    error,
    success,
    loading,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    handleSubmit,
  } = useCreateEmployeeForm();

  const PasswordToggle = ({
    show,
    onClick,
    ariaLabel,
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
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <section className="login-card" aria-labelledby="create-employee-title">
          <h2 id="create-employee-title">Add Employee</h2>

          {success && (
            <div className="banner banner-success" role="status">
              {success}
            </div>
          )}
          {error && !success && (
            <div className="banner banner-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
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
              autoComplete="email"
              required
            />

            {canAssignAdminRole ? (
              <>
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Admin' | 'User')}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </>
            ) : null}

            <label htmlFor="password">Temporary Password</label>
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
                onClick={togglePasswordVisibility}
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
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
              <PasswordToggle
                show={showConfirmPassword}
                onClick={toggleConfirmPasswordVisibility}
                ariaLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Creating employee...' : 'Create Employee'}
              </button>
            </div>
          </form>
 
        </section>
      </main>
    </div>
  );
};

export default CreateEmployee;
