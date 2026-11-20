import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { AuthStorage } from '../services/authStorage';
import { realtimeSocket } from '../services/socket';
import { DEMO_ACCOUNTS } from '../constants/config';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  ssoLogin: (role?: 'admin' | 'faculty') => Promise<void>;
  logout: () => Promise<void>;
  switchRoleForPresentation: (targetRole: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AuthStorage.getToken();
        const storedUser = await AuthStorage.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          realtimeSocket.connect(storedUser.facultyId, storedUser.role === 'admin');
        }
      } catch (e) {
        console.warn('Failed to restore auth session', e);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password, rememberMe });
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AuthStorage.saveToken(res.token);
        await AuthStorage.saveUser(res.user);
        realtimeSocket.connect(res.user.facultyId, res.user.role === 'admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ssoLogin = async (role: 'admin' | 'faculty' = 'faculty') => {
    setIsLoading(true);
    try {
      const res = await api.ssoLogin(role);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        await AuthStorage.saveToken(res.token);
        await AuthStorage.saveUser(res.user);
        realtimeSocket.connect(res.user.facultyId, res.user.role === 'admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      realtimeSocket.disconnect();
      await AuthStorage.clear();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Instant presentation switch for faculty <-> admin
  const switchRoleForPresentation = async (targetRole: UserRole) => {
    const creds = targetRole === 'admin' ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.faculty;
    await login(creds.email, creds.password, true);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
        await AuthStorage.saveUser(res.user);
      }
    } catch (e) {
      console.warn('Could not refresh profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        ssoLogin,
        logout,
        switchRoleForPresentation,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
