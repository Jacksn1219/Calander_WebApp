import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../config/api';

export interface User {
  userId?: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }

      let storedUser: User | null = null;
      const storedUserRaw = localStorage.getItem('user');
      if (storedUserRaw) {
        try {
          storedUser = JSON.parse(storedUserRaw);
          setUser(storedUser);
        } catch {
          storedUser = null;
        }
      }

      try {
        const response = await apiFetch('/api/auth/me');
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
          return;
        }

        const data = await response.json();
        const apiUser = data.user;

        const normalizedUser: User = {
          userId:
            typeof apiUser.userId === 'string'
              ? parseInt(apiUser.userId, 10)
              : apiUser.userId,
          name: storedUser?.name ?? '',
          email: apiUser.email,
          role: apiUser.role as 'Admin' | 'User',
        };

        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch (err) {
        console.error('Error validating token on app load:', err);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
