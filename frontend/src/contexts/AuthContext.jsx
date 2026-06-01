import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
      throw err;
    }
  };

  const register = async (nom, prenom, email, password, confirmPassword) => {
    try {
      setError(null);
      const response = await authService.register(nom, prenom, email, password, confirmPassword);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};