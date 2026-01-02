import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useSidebar } from '../hooks/hooks';
import '../styles/sidebar.css';
import UserSettings from './UserSettings';

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

  const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );

  const RoomIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V3h18v18" />
      <path d="M9 21V9h6v12" />
      <path d="M7 7h.01" />
      <path d="M17 7h.01" />
      <path d="M7 11h.01" />
      <path d="M17 11h.01" />
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

      {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
        <li className={location.pathname === '/admin-panel/add-emp' ? 'active' : ''}>
          <Link to="/admin-panel/add-emp" title="Employee Panel">
            <UsersIcon />
            {!isCollapsed && <span>Employee Panel</span>}
          </Link>
        </li>
      )}

      {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
        <li className={location.pathname === '/admin-panel/administrative-dashboard' ? 'active' : ''}>
          <Link to="/admin-panel/administrative-dashboard" title="Event Panel">
            <DashboardIcon />
            {!isCollapsed && <span>Event Panel</span>}
          </Link>
        </li>
      )}

      {user?.role === 'SuperAdmin' && (
        <li className={location.pathname === '/admin-panel/Room-Panel' ? 'active' : ''}>
          <Link to="/admin-panel/Room-Panel" title="Room Panel">
            <RoomIcon />
            {!isCollapsed && <span>Room Panel</span>}
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

        {isAuthenticated && (
          <div className="sidebar-user-section">
            <UserSettings
              dropdownPlacement="right"
              showLogoutAction={false}
              showLabel={!isCollapsed}
            />

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10,17 15,12 10,7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;