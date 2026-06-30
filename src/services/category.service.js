/**
 * @fileoverview Servicio de categorías conectado al backend real.
 */

import api from './api';

/**
 * Lista categorías. Con includeInactive=true trae también las desactivadas
 * (usado en la pantalla de gestión para poder reactivarlas).
 * @param {boolean} [includeInactive=false]
 */
export async function getCategories(includeInactive = false) {
  return api.get(`/categories${includeInactive ? '?all=true' : ''}`);
}

export async function createCategory(data) {
  return api.post('/categories', data);
}

/**
 * Actualiza el nombre y/o estado activo de una categoría.
 * @param {string} id - ObjectId de la categoría.
 * @param {{ name?: string, active?: boolean }} data
 */
export async function updateCategory(id, data) {
  return api.put(`/categories/${id}`, data);
}
