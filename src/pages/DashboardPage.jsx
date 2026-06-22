/**
 * @fileoverview Dashboard principal con estadísticas del inventario.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStats } from '../services/product.service';
import { getActivities, timeAgo, getActivityIcon } from '../services/activity.service';

/**
 * Página del dashboard con cards de estadísticas y accesos rápidos.
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
    setActivities(getActivities());
  }, []);

  /** Configuración visual de cada tarjeta de estadística */
  const statCards = stats
    ? [
        {
          label: 'Total Productos',
          value: stats.totalProducts,
          icon: 'bi-box-seam',
          color: '#3498db',
          bg: 'rgba(52,152,219,0.1)',
        },
        {
          label: 'Unidades en Stock',
          value: stats.totalStock.toLocaleString(),
          icon: 'bi-layers',
          color: '#27ae60',
          bg: 'rgba(39,174,96,0.1)',
        },
        {
          label: 'Valor del Inventario',
          value: `$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`,
          icon: 'bi-currency-dollar',
          color: '#8e44ad',
          bg: 'rgba(142,68,173,0.1)',
        },
        {
          label: 'Stock Bajo',
          value: stats.lowStock,
          icon: 'bi-exclamation-triangle',
          color: '#f39c12',
          bg: 'rgba(243,156,18,0.1)',
        },
        {
          label: 'Sin Stock',
          value: stats.outOfStock,
          icon: 'bi-x-circle',
          color: '#e74c3c',
          bg: 'rgba(231,76,60,0.1)',
        },
        {
          label: 'Categorías',
          value: stats.categories,
          icon: 'bi-tags',
          color: '#1abc9c',
          bg: 'rgba(26,188,156,0.1)',
        },
      ]
    : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Dashboard</h4>
          <p className="text-muted mb-0 small">
            Bienvenido, <strong>{user?.name}</strong>. Resumen general del inventario.
          </p>
        </div>
        <Link to="/products/new" className="btn btn-primary btn-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          Nuevo Producto
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {statCards.map((card) => (
            <div key={card.label} className="col-sm-6 col-lg-4 col-xl-2">
              <div className="stat-card">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="stat-icon"
                    style={{ background: card.bg, color: card.color }}
                  >
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                </div>
                <div className="stat-value" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-8">
          <div className="stat-card">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-clock-history me-2 text-muted"></i>
              Actividad Reciente
            </h6>
            <div className="text-muted small">
              {activities.length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-inbox text-muted d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                  No hay actividad registrada aún.
                  <br />
                  Crea o elimina productos para ver eventos aquí.
                </div>
              ) : (
                activities.slice(0, 8).map((event) => {
                  const { icon, color } = getActivityIcon(event.type);
                  return (
                    <div key={event.id} className="d-flex align-items-start gap-3 py-2 border-bottom">
                      <i className={`bi ${icon} ${color} mt-1`}></i>
                      <div className="flex-grow-1">
                        <div>{event.text}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {timeAgo(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-lightning me-2 text-muted"></i>
              Accesos Rápidos
            </h6>
            <div className="d-grid gap-2">
              <Link to="/products" className="btn btn-outline-primary btn-sm text-start">
                <i className="bi bi-list-ul me-2"></i>
                Ver Inventario
              </Link>
              <Link to="/products/new" className="btn btn-outline-success btn-sm text-start">
                <i className="bi bi-plus-circle me-2"></i>
                Registrar Producto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
