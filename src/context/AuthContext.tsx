import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/services/api';
import type { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      api.init();
      const response = await api.getUser();
      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User not authenticated
      console.error('Auth init error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.data?.user) {
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error || 'Login failed' };
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const response = await api.register(name, email, phone, password);
    if (response.data?.user) {
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error || 'Registration failed' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; default_address?: string; default_address_latitude?: number; default_address_longitude?: number }) => {
    const response = await api.updateProfile(data);
    if (response.data?.user) {
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error || 'Failed to update profile' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
