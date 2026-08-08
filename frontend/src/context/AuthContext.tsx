import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isOwner: boolean;
  isStaff: boolean;
  hasPermission: (permKey: string) => boolean;
  isAdmin: boolean;
  isSecurityStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const refreshUser = async () => {
    await fetchUser();
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const roleStr = user?.role ? (typeof user.role === 'string' ? user.role : String(user.role)) : '';
  const isOwner = roleStr === 'ADMIN_OWNER' || roleStr === 'ADMIN';
  const isStaff = isOwner || roleStr === 'ADMIN_STAFF' || roleStr === 'SECURITY_STAFF';

  const hasPermission = (permKey: string): boolean => {
    if (!user) return false;
    if (isOwner) return true;
    if (!isStaff) return false;
    const perms = user.permissions || {};
    return perms[permKey] === true;
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, refreshUser, isLoading,
      isOwner, isStaff, hasPermission,
      isAdmin: isOwner, isSecurityStaff: isStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
