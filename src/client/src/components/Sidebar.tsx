import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../states/AuthContext';
import { useSidebar } from '../hooks/hooks';
import '../styles/sidebar.css';

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar, handleLogout } = useSidebar();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const HamburgerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );

  const PersonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const renderAuthenticatedSidebar = () => (
    <>
      <li className={location.pathname === '/home' ? 'active' : ''}>
        <Link to="/home" title="Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          {!isCollapsed && <span>Home</span>}
        </Link>
      </li>
      <li className={location.pathname === '/roombooking' ? 'active' : ''}>
        <Link to="/roombooking" title="Roombooking">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          {!isCollapsed && <span>Roombooking</span>}
        </Link>
      </li>
      <li className={location.pathname === '/administrative-dashboard' ? 'active' : ''}>
        <Link to="/administrative-dashboard" title="administrative-dashboard">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path opacity="0.1" d="M8.976 3C4.05476 3 3 4.05476 3 8.976V15.024C3 19.9452 4.05476 21 8.976 21H9V9H21V8.976C21 4.05476 19.9452 3 15.024 3H8.976Z" fill="currentColor"></path>
            <path d="M3 8.976C3 4.05476 4.05476 3 8.976 3H15.024C19.9452 3 21 4.05476 21 8.976V15.024C21 19.9452 19.9452 21 15.024 21H8.976C4.05476 21 3 19.9452 3 15.024V8.976Z" stroke="currentColor" stroke-width="2"></path>
            <path d="M21 9L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 21L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>
          {!isCollapsed && <span>Administrative Dashboard</span>}
        </Link>
      </li>
      <li className={location.pathname === '/calendar' ? 'active' : ''}>
        <Link to="/calendar" title="Calendar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {!isCollapsed && <span>Calendar</span>}
        </Link>
      </li>
      {user?.role === 'Admin' && (
        <li className={location.pathname === '/add-emp' ? 'active' : ''}>
          <Link to="/add-emp" title="Add Employee">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            {!isCollapsed && <span>Add Employee</span>}
          </Link>
        </li>
      )}
    </>
  );

  const renderUnauthenticatedSidebar = () => {
    const isLoginPage = location.pathname === '/login';

    return (
      <li className={isLoginPage ? 'active' : ''}>
        <Link to="/login" title="Login">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          {!isCollapsed && <span>Login</span>}
        </Link>
      </li>
    );
  };

  const renderUserSection = () => {
    if (!isAuthenticated) return null;
    const roleLabel = user?.isSuperAdmin ? 'Super Admin' : (user?.role || 'User');

    return (
      <div className="sidebar-user-section">
        <div className="user-info">
          <div className="user-avatar">
            <PersonIcon />
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{roleLabel}</span>
            </div>
          )}
        </div>
        
        <button 
          className="logout-button"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    );
  };

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <HamburgerIcon />
        </button>
        {!isCollapsed && <div className="sidebar-brand">Office Calendar</div>}
      </div>
      
      <div className="sidebar-content">
        <ul className="sidebar-nav">
          {isAuthenticated 
            ? renderAuthenticatedSidebar() 
            : renderUnauthenticatedSidebar()
          }
        </ul>
        
        {renderUserSection()}
      </div>
    </nav>
  );
};

export default Sidebar;