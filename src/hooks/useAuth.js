/**
 * @fileoverview Hook personalizado para acceder al contexto de autenticación.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook que retorna el estado y acciones de autenticación.
 * @returns {{
 *   user: Object|null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   login: Function,
 *   register: Function,
 *   logout: Function
 * }}
 * @throws {Error} Si se usa fuera de un AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
