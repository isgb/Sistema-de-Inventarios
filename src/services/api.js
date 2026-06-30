/**
 * @fileoverview Cliente HTTP base para consumo de la API REST.
 * Todas las respuestas del backend vienen con formato { success, message, data }.
 * Este módulo extrae automáticamente el campo data para que los services
 * reciban los datos directamente sin tener que desenwrapear.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Limpia la sesión guardada y redirige a /login cuando el backend responde 401
 * (token ausente, inválido o expirado). No hace nada si ya estamos en /login,
 * para evitar un loop de redirección.
 */
export function clearSessionAndRedirectToLogin() {
  if (window.location.pathname === '/login') return;

  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('roles');
  window.location.href = '/login';
}

/**
 * Realiza una petición HTTP al API REST.
 * Agrega automáticamente el token JWT del localStorage si existe.
 * Extrae el campo data de la respuesta del backend.
 * Si el backend responde 401, limpia la sesión y redirige a /login.
 *
 * @param {string} endpoint - Ruta relativa (e.g. '/products').
 * @param {Object} [options={}] - Opciones de fetch.
 * @returns {Promise<*>} Datos extraídos de response.data.
 * @throws {Error} Si la respuesta no es exitosa.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    clearSessionAndRedirectToLogin();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const responseBody = await response.json();
  return responseBody.data !== undefined ? responseBody.data : responseBody;
}

export default {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: data }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: data }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
