import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/login-page.css';

const Sidebar: React.FC = () => {
  const loc = useLocation();
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">Office Calendar</div>
      <ul>
        <li className={loc.pathname === '/home' ? 'active' : ''}><Link to="/home">Home</Link></li>
        <li className={loc.pathname === '/login' ? 'active' : ''}><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
