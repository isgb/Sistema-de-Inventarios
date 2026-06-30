/**
 * @fileoverview Servicio de productos conectado al backend real.
 * Nota: category viene como objeto populado { _id, name } del backend.
 */

import api, { API_BASE_URL, clearSessionAndRedirectToLogin } from './api';

/**
 * Lista productos paginados desde el backend (búsqueda, filtros y orden son server-side).
 * @param {{ page?: number, limit?: number, search?: string, category?: string,
 *   status?: 'available'|'low'|'out', sort?: string, dir?: 'asc'|'desc' }} [params={}]
 * @returns {Promise<{ items: Object[], total: number, page: number, totalPages: number }>}
 */
export async function getProducts(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  ).toString();
  return api.get(`/products${query ? `?${query}` : ''}`);
}

export async function getProductById(id) {
  return api.get(`/products/${id}`);
}

export async function createProduct(data) {
  return api.post('/products', data);
}

export async function updateProduct(id, data) {
  return api.put(`/products/${id}`, data);
}

export async function deleteProduct(id) {
  return api.delete(`/products/${id}`);
}

export async function getStats() {
  return api.get('/products/stats');
}

/**
 * Sube un archivo .xlsx y devuelve el preview validado (sin escribir en la DB).
 * No usa api.post porque requiere multipart/form-data, no JSON.
 * @param {File} file
 * @returns {Promise<{ valid: Object[], errors: Object[], totalRows: number }>}
 */
export async function previewImportExcel(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/products/import/preview`, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });

  if (response.status === 401) clearSessionAndRedirectToLogin();

  const responseBody = await response.json().catch(() => ({ message: 'Error de servidor' }));
  if (!response.ok) throw new Error(responseBody.message || `HTTP ${response.status}`);
  return responseBody.data;
}

/**
 * Confirma la importación de las filas válidas devueltas por el preview.
 * @param {Object[]} rows
 * @returns {Promise<{ created: number, failed: number, errors: Object[] }>}
 */
export async function confirmImportExcel(rows) {
  return api.post('/products/import/confirm', { rows });
}

/**
 * Descarga el inventario completo como archivo .xlsx.
 */
export async function exportProductsExcel() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/products/export`, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });

  if (response.status === 401) clearSessionAndRedirectToLogin();

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al exportar inventario' }));
    throw new Error(error.message || 'Error al exportar inventario');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
