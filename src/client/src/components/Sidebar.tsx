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
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 0V5M11.5 0V5M3 7.5H6M12 7.5H9M3 10.5H6M9 10.5H12M1.5 2.5H13.5C14.0523 2.5 14.5 2.94772 14.5 3.5V13.5C14.5 14.0523 14.0523 14.5 13.5 14.5H1.5C0.947716 14.5 0.5 14.0523 0.5 13.5V3.5C0.5 2.94772 0.947715 2.5 1.5 2.5Z" />
          </svg>
          {!isCollapsed && <span>Roombooking</span>}
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
        <li className={['/admin-panel','/admin-panel/Room-Panel','/admin-panel/add-emp','/admin-panel/administrative-dashboard'].includes(location.pathname) ? 'active' : ''}>
          <Link to="/admin-panel" title="Admin Panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="9" y1="4" x2="9" y2="20"/>
            </svg>
            {!isCollapsed && <span>Admin Panel</span>}
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
      </div>
    </nav>
  );
};

export default Sidebar;