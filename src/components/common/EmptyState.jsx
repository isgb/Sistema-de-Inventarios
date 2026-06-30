/**
 * @fileoverview Estado vacío reutilizable para listas sin resultados.
 * compact=true reduce tamaño para usarse dentro de cards anidadas (ej. Dashboard).
 */

export default function EmptyState({ icon = 'bi-inbox', message = 'No hay datos para mostrar', compact = false }) {
  return (
    <div className={compact ? 'text-center py-3' : 'text-center py-5'}>
      <i className={`bi ${icon} text-muted ${compact ? 'd-block mb-2' : ''}`} style={{ fontSize: compact ? '1.5rem' : '3rem' }}></i>
      <p className={compact ? 'text-muted small mb-0' : 'text-muted mt-2'}>{message}</p>
    </div>
  );
}
