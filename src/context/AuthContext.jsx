/**
 * @fileoverview Contexto de autenticación global.
 * Provee estado de sesión, login, registro y logout a toda la aplicación.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';

/** @type {React.Context} */
export const AuthContext = createContext(null);

/**
 * Proveedor de autenticación que envuelve la aplicación.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos.
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Inicia sesión y persiste los datos en localStorage.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Datos del usuario autenticado.
   */
  const login = useCallback(async (email, password) => {
    const { user: userData, token } = await authService.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  /**
   * Registra un nuevo usuario y lo autentica automáticamente.
   * @param {Object} data - Datos del formulario de registro.
   * @returns {Promise<Object>} Datos del usuario creado.
   */
  const register = useCallback(async (data) => {
    const { user: userData, token } = await authService.register(data);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  /** Cierra sesión y limpia datos persistidos. */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  /** @type {boolean} Indica si el usuario está autenticado. */
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
