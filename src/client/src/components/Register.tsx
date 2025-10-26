import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Network error');
    }
  }

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
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />

            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" required />

            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'Admin' | 'User')}>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>

            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

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
