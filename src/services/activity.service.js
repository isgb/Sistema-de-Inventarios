/**
 * @fileoverview Servicio de actividad reciente conectado al backend real.
 * Reemplaza el log anterior basado en localStorage: ahora la actividad
 * se registra automáticamente en el backend (product/category/movement/user/role
 * services) y se consulta vía GET /api/activity, compartida entre todos los usuarios.
 */

import api from './api';

/**
 * Obtiene los eventos de actividad recientes compartidos por todos los usuarios.
 * @returns {Promise<Array<{ _id: string, action: string, type: string, createdAt: string, user: { name: string } }>>}
 */
export async function getActivities() {
  return api.get('/activity');
}

/**
 * Formatea la diferencia de tiempo entre una fecha y ahora en texto legible.
 * @param {string} isoDate - Fecha en formato ISO.
 * @returns {string} Texto como "Hace 5 minutos", "Hace 2 horas", etc.
 */
export function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return 'Justo ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

/**
 * Retorna el ícono y color Bootstrap correspondiente al tipo de evento.
 * @param {'create'|'delete'|'update'|'warning'|'info'} type
 * @returns {{icon: string, color: string}}
 */
export function getActivityIcon(type) {
  const map = {
    create: { icon: 'bi-plus-circle', color: 'text-success' },
    delete: { icon: 'bi-trash', color: 'text-danger' },
    update: { icon: 'bi-pencil-square', color: 'text-primary' },
    warning: { icon: 'bi-exclamation-triangle', color: 'text-warning' },
    info: { icon: 'bi-info-circle', color: 'text-muted' },
  };
  return map[type] || map.info;
}
