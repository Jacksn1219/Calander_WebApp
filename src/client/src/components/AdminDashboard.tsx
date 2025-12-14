import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin-dashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <div className="app-layout admin-dashboard-page">
      <Sidebar />
      <main className="main-content">
        <div className="admin-dashboard-header">
          <h1>Super Admin Dashboard</h1>
          <p className="muted">Access all super admin panels and tools.</p>
        </div>
        <div className="admin-dashboard-panels">
          <div className="admin-panel-card">
            <h2>Employee Panel</h2>
            <p>Manage all employees, roles, and permissions.</p>
            <button className="btn-today">Go to Employee Panel</button>
          </div>
          <div className="admin-panel-card">
            <h2>Room Panel</h2>
            <p>Manage all rooms and bookings.</p>
            <Link to="/admin-dashboard/Room-Panel">
              <button className="btn-today">Go to Room Panel</button>
            </Link>
          </div>
          {/* Add more panels as needed */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
