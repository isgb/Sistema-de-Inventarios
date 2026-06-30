/**
 * @fileoverview Servicio de autenticación conectado al backend real.
 * Maneja login, registro, refresh de tokens y logout.
 */

import api from './api';

/**
 * Inicia sesión con credenciales.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, roles: string[], token: string, refreshToken: string }>}
 */
export async function login(email, password) {
  return api.post('/auth/login', { email, password });
}

/**
 * Registra un nuevo usuario (se asigna rol USER automáticamente).
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ user: Object, roles: string[], token: string, refreshToken: string }>}
 */
export async function register(data) {
  return api.post('/auth/register', data);
}

/**
 * Renueva el access token usando el refresh token.
 * @param {string} refreshToken
 * @returns {Promise<{ token: string, refreshToken: string }>}
 */
export async function refresh(refreshToken) {
  return api.post('/auth/refresh', { refreshToken });
}

/**
 * Cierra sesión en el backend (invalida el refresh token).
 */
export async function logout() {
  return api.post('/auth/logout', {});
}
