import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../states/AuthContext';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import MyEvents from './MyEvents';
import ErrorPage from './Error';
import Error from './Error';
import UnauthorizedPage from './UnauthorizedPage';

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
            path="/register" 
            element={
              <AuthRedirectRoute>
                <Register />
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
            path="/my-events"
            element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/" 
            element={
              <RootRedirect />
            } 
          />

          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Fallback voor niet-bestaande paden */}
            <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


// small component to redirect authenticated users away from login/register
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/unauthorized" replace />;
  }

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