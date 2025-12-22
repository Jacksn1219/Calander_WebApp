import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../states/AuthContext';
import Login from './Login';
import EmployeeAdmin from './EmployeeAdmin';
import Home from './Home';
import RoomBooking from './RoomBooking';
import Calendar from './Calendar';
import AdministrativeDashboard from './AdministrativeDashboard';
import RoomAdmin from './RoomAdmin';
import AdminPanel from './AdminPanel';
import Notifications from './Notifications';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              <AuthRedirectRoute>
                <Login />
              </AuthRedirectRoute>
            } 
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roombooking"
            element={
              <ProtectedRoute>
                <RoomBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/administrative-dashboard"
            element={
              <ProtectedRoute>
                <AdminRoute>
                <AdministrativeDashboard />
                </AdminRoute>
              </ProtectedRoute>
                }
            />
            <Route
            
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/add-emp"
            element={
              <ProtectedRoute> 
                <AdminRoute>
                  <EmployeeAdmin />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel/Room-Panel"
            element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <RoomAdmin />
                </SuperAdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/" 
            element={
              <RootRedirect />
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// small component to redirect authenticated users away from login/register
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  console.log('AdminRoute user:', user);
  return (user?.role === 'Admin' || user?.role === 'SuperAdmin') ? <>{children}</> : <Navigate to="/home" replace />;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user?.role === 'SuperAdmin' ? <>{children}</> : <Navigate to="/home" replace />;
};

const AuthRedirectRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, logout } = useAuth();
  
  if (isAuthenticated) {
    const confirmed = window.confirm(
      'You are already logged in. Do you want to logout and continue to this page?'
    );
    
    if (confirmed) {
      logout();
      return <>{children}</>;
    } else {
      return <Navigate to="/home" replace />;
    }
  }
  
  return <>{children}</>;
};

const RootRedirect = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};