/**
 * @fileoverview Configuración base del cliente HTTP para consumo de API REST.
 * Preparado para conectar con el backend cuando esté disponible.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Realiza una petición HTTP al API REST.
 * @param {string} endpoint - Ruta relativa del endpoint (e.g. '/products').
 * @param {Object} [options={}] - Opciones de fetch (method, body, headers, etc.).
 * @returns {Promise<Object>} Respuesta parseada como JSON.
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

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de servidor' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export default {
  /**
   * Petición GET.
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

  /**
   * Petición POST.
   * @param {string} endpoint
   * @param {Object} data - Cuerpo de la petición.
   * @returns {Promise<Object>}
   */
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: data }),

  /**
   * Petición PUT.
   * @param {string} endpoint
   * @param {Object} data - Cuerpo de la petición.
   * @returns {Promise<Object>}
   */
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: data }),

  /**
   * Petición DELETE.
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
