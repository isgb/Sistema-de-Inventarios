/**
 * @fileoverview Hook para acceder al contexto de autenticación y roles.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Retorna el estado de autenticación, roles y acciones.
 * @returns {{
 *   user: Object|null,
 *   roles: string[],
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   login: Function,
 *   register: Function,
 *   logout: Function,
 *   hasRole: (...roles: string[]) => boolean
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
