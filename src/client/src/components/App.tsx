import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../auth/AuthContext';
import Login from './Login';
import EmployeeAdmin from './EmployeeAdmin';
import Home from './Home';
import Calendar from './Calendar';
import AdministrativeDashboard from './AdministrativeDashboard';
import RoomAdmin from './RoomAdmin';
import AdminPanel from './AdminPanel';
import Notifications from './Notifications';
import Error from './Error';
import Unauthorized from './Unauthorized';

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
          <Route 
            path="/unauthorized" 
            element={<Unauthorized/>} 
          />
          <Route 
            path="*" 
            element={<Error />} 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// small component to redirect authenticated users away from login/register
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!isAuthenticated) return <Navigate to="/login" replace />;


  return <>{children}</>;
};




const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/unauthorized" replace />;

  if (user?.role !== 'Admin' && user?.role !== 'SuperAdmin') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/unauthorized" replace />;
  if (user?.role !== 'SuperAdmin') return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
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