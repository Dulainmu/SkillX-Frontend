import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, getAuthToken } from '@/config/api';

interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'mentor' | 'user' | 'student';
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  setUser: () => {}, 
  logout: () => {},
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('skillx-token');
    sessionStorage.removeItem('skillx-token');
    localStorage.removeItem('skillx-role');
    sessionStorage.removeItem('skillx-role');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          // Try to fetch user profile from server
          const response = await fetch(getApiUrl('/api/users/profile'), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const userData = { 
              id: data._id, 
              name: data.name, 
              role: data.role 
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Token is invalid, clear everything
            logout();
          }
        } else {
          // No token, try to restore from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
            } catch (error) {
              console.error('Failed to parse stored user data:', error);
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
