import React from 'react';
import { useAuth } from '../states/AuthContext';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin-panel.css';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="app-layout admin-panel-page">
      <Sidebar />
      <main className="main-content">
        <div className="admin-panel-header">
          <h1>Admin Panel</h1>
          <p className="muted">Access all admin panels and tools.</p>
        </div>
        <div className="admin-panel-panels">
          <div className="admin-panel-card">
            <h2>Employee Panel</h2>
            <p>Manage all employees, roles, and permissions.</p>
            <Link to="/admin-panel/add-emp">
              <button className="btn-today">Go to Add Employee</button>
            </Link>
          </div>
          {user?.role === 'SuperAdmin' && (
            <div className="admin-panel-card">
              <h2>Room Panel</h2>
              <p>Manage all rooms and bookings.</p>
              <Link to="/admin-panel/Room-Panel">
                <button className="btn-today">Go to Room Panel</button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
