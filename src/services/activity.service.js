/**
 * @fileoverview Servicio de registro de actividad en memoria.
 * Almacena eventos del sistema (crear producto, eliminar, stock bajo, etc.)
 * para mostrarlos en el dashboard como "Actividad Reciente".
 *
 * Los eventos se guardan en localStorage para que persistan entre recargas
 * de la sesión. Cuando el backend esté disponible, reemplazar por llamadas API.
 */

const STORAGE_KEY = 'activity_log';
const MAX_EVENTS = 20;

/**
 * @typedef {Object} ActivityEvent
 * @property {string} id - Identificador único del evento.
 * @property {string} text - Descripción legible del evento.
 * @property {'create'|'delete'|'update'|'warning'|'info'} type - Tipo de evento.
 * @property {string} timestamp - Fecha/hora ISO del evento.
 */

/**
 * Obtiene todos los eventos de actividad ordenados del más reciente al más antiguo.
 * @returns {ActivityEvent[]}
 */
export function getActivities() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Registra un nuevo evento de actividad.
 * @param {string} text - Descripción del evento.
 * @param {'create'|'delete'|'update'|'warning'|'info'} type - Tipo del evento.
 */
export function addActivity(text, type = 'info') {
  const events = getActivities();
  const newEvent = {
    id: crypto.randomUUID(),
    text,
    type,
    timestamp: new Date().toISOString(),
  };
  events.unshift(newEvent);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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
