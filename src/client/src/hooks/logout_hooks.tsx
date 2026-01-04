import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/*
 ====================================
LOGOUT HOOKS
 ====================================
 */

/**
 * Custom hook for logout confirmation with navigation
 */
export const useLogoutWithConfirmation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  return handleLogout;
};
