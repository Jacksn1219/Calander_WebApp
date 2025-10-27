import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
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
    // TODO: Backend Integration - Validate token with backend on app load
    // Should verify JWT token is still valid with backend API
    // GET /api/auth/verify or GET /api/auth/me to fetch current user
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: User) => {
    // TODO: Backend Integration - Currently using mock token
    // Should receive actual JWT token from POST /api/auth/login
    // Store token in localStorage and set Authorization header for future requests
    setUser(userData);
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // TODO: Backend Integration - Should notify backend of logout
    // POST /api/auth/logout to invalidate session/token if using refresh tokens
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
    user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};