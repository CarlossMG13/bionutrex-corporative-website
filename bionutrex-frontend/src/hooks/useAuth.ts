import { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import type { Admin } from '@/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.verifyToken();
      setIsAuthenticated(true);
      setAdmin(response.data.admin);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, admin } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      
      setIsAuthenticated(true);
      setAdmin(admin);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de autenticación'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    verifyToken
  };
}