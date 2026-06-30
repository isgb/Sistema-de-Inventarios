/**
 * @fileoverview Servicio de usuarios conectado al backend real.
 */

import api from './api';

/**
 * Lista usuarios paginados desde el backend.
 * @param {{ page?: number, limit?: number }} [params={}]
 * @returns {Promise<{ items: Object[], total: number, page: number, totalPages: number }>}
 */
export async function getUsers(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  ).toString();
  return api.get(`/users${query ? `?${query}` : ''}`);
}

export async function createUser(data) {
  return api.post('/users', data);
}

/**
 * Actualiza la información de un usuario.
 * @param {string} id - ObjectId del usuario.
 * @param {{ name?: string, email?: string, password?: string, status?: string }} data
 */
export async function updateUser(id, data) {
  return api.put(`/users/${id}`, data);
}
