import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../states/AuthContext';
import Login from './Login';
import Register from './Register';
import Home from './Home';

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

console.log("✅ Using cinematic Register component");
// 🔒 Protected pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// 🚫 Auth redirect logic
const AuthRedirectRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  if (user) {
    const confirmed = window.confirm(
      "You are already logged in. Do you want to logout and continue to this page?"
    );
    if (confirmed) {
      localStorage.removeItem("user");
      return <>{children}</>;
    } else {
      return <Navigate to="/home" replace />;
    }
  }
  return <>{children}</>;
};

// 🔁 Default redirect
const RootRedirect = () => {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};
