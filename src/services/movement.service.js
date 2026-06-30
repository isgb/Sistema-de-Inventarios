/**
 * @fileoverview Servicio de movimientos de inventario conectado al backend real.
 */

import api from './api';

/**
 * Lista movimientos paginados con filtros server-side.
 * @param {{ page?: number, limit?: number, product?: string, type?: 'IN'|'OUT'|'ADJUSTMENT',
 *   startDate?: string, endDate?: string }} [params={}]
 * @returns {Promise<{ items: Object[], total: number, page: number, totalPages: number }>}
 */
export async function getMovements(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  ).toString();
  return api.get(`/movements${query ? `?${query}` : ''}`);
}

/**
 * Crea un movimiento de inventario.
 * @param {{ product: string, type: 'IN'|'OUT'|'ADJUSTMENT', quantity: number, reason?: string }} data
 */
export async function createMovement(data) {
  return api.post('/movements', data);
}
