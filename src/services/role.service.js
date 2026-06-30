/**
 * @fileoverview Servicio de roles y permisos RBAC conectado al backend real.
 */

import api from './api';

export async function getRoles() {
  return api.get('/roles');
}

/**
 * Asigna un rol a un usuario. Requiere permiso users:assign-role (solo SUPER_ADMIN).
 * @param {string} userId
 * @param {string} roleId
 */
export async function assignRole(userId, roleId) {
  return api.post('/roles/assign', { userId, roleId });
}

/**
 * Revoca un rol de un usuario. Requiere permiso users:assign-role (solo SUPER_ADMIN).
 * @param {string} userId
 * @param {string} roleId
 */
export async function revokeRole(userId, roleId) {
  return api.post('/roles/revoke', { userId, roleId });
}
