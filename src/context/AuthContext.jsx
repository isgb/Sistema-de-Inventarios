/**
 * @fileoverview Contexto de autenticación global con soporte de roles RBAC.
 * Provee estado de sesión, login, registro, logout y verificación de roles.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedRoles = localStorage.getItem('roles');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setRoles(savedRoles ? JSON.parse(savedRoles) : []);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: userData, roles: userRoles, token, refreshToken } = await authService.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roles', JSON.stringify(userRoles));
    setUser(userData);
    setRoles(userRoles);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const { user: userData, roles: userRoles, token, refreshToken } = await authService.register(data);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('roles', JSON.stringify(userRoles));
    setUser(userData);
    setRoles(userRoles);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Si falla el logout en el backend, limpiamos localmente igual
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    setUser(null);
    setRoles([]);
  }, []);

  /**
   * Verifica si el usuario tiene al menos uno de los roles indicados.
   * Uso: hasRole('ADMIN', 'SUPER_ADMIN')
   */
  const hasRole = useCallback((...allowedRoles) => {
    return roles.some((role) => allowedRoles.includes(role));
  }, [roles]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, roles, loading, isAuthenticated, login, register, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}
