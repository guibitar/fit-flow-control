import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // Verificar token com o backend
      const response = await authAPI.verify();
      
      if (response && response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        // Token inválido, limpar
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response && response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        return {
          success: false,
          error: response?.error || 'Erro ao fazer login'
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer login'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    currentUser: user, // Alias para compatibilidade
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

