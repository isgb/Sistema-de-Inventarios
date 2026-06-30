/**
 * @fileoverview Dashboard principal con estadísticas del inventario.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStats } from '../services/product.service';
import { getMovements } from '../services/movement.service';
import { getActivities, timeAgo, getActivityIcon } from '../services/activity.service';
import EmptyState from '../components/common/EmptyState';

const RANGE_OPTIONS = [
  { value: '1', label: 'Hoy' },
  { value: '7', label: '7 días' },
  { value: '30', label: '30 días' },
  { value: '', label: 'Todo' },
];

const MOVEMENT_TYPES = [
  { key: 'IN', label: 'Entradas', color: '#27ae60' },
  { key: 'OUT', label: 'Salidas', color: '#e74c3c' },
  { key: 'ADJUSTMENT', label: 'Ajustes', color: '#f39c12' },
];

/** Gráfica de barras simple en CSS puro, sin librerías externas. */
function MovementsBarChart({ counts }) {
  const max = Math.max(counts.IN, counts.OUT, counts.ADJUSTMENT, 1);
  return (
    <div className="d-flex flex-column gap-3">
      {MOVEMENT_TYPES.map((type) => (
        <div key={type.key}>
          <div className="d-flex justify-content-between small mb-1">
            <span>{type.label}</span>
            <span className="fw-semibold">{counts[type.key]}</span>
          </div>
          <div style={{ background: '#eef0f2', borderRadius: 4, height: 10 }}>
            <div
              style={{
                width: `${(counts[type.key] / max) * 100}%`,
                background: type.color,
                height: '100%',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function getStartDate(days) {
  if (!days) return '';
  const date = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { user, roles, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState('7');
  const [movementCounts, setMovementCounts] = useState({ IN: 0, OUT: 0, ADJUSTMENT: 0 });
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
    getActivities()
      .then(setActivities)
      .catch(() => setActivities([]));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMovementCounts() {
      setChartLoading(true);
      const startDate = getStartDate(range);
      try {
        const [inResult, outResult, adjResult] = await Promise.all([
          getMovements({ type: 'IN', startDate, limit: 1 }),
          getMovements({ type: 'OUT', startDate, limit: 1 }),
          getMovements({ type: 'ADJUSTMENT', startDate, limit: 1 }),
        ]);
        if (!active) return;
        setMovementCounts({ IN: inResult.total, OUT: outResult.total, ADJUSTMENT: adjResult.total });
      } catch {
        if (active) setMovementCounts({ IN: 0, OUT: 0, ADJUSTMENT: 0 });
      } finally {
        if (active) setChartLoading(false);
      }
    }

    loadMovementCounts();
    return () => { active = false; };
  }, [range]);

  const totalMovements = movementCounts.IN + movementCounts.OUT + movementCounts.ADJUSTMENT;

  const statCards = stats
    ? [
        { label: 'Total Productos', value: stats.totalProducts, icon: 'bi-box-seam', color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
        { label: 'Unidades en Stock', value: stats.totalStock.toLocaleString(), icon: 'bi-layers', color: '#27ae60', bg: 'rgba(39,174,96,0.1)' },
        { label: 'Valor del Inventario', value: `$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`, icon: 'bi-currency-dollar', color: '#8e44ad', bg: 'rgba(142,68,173,0.1)' },
        { label: 'Stock Bajo', value: stats.lowStock, icon: 'bi-exclamation-triangle', color: '#f39c12', bg: 'rgba(243,156,18,0.1)' },
        { label: 'Sin Stock', value: stats.outOfStock, icon: 'bi-x-circle', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)' },
        { label: 'Categorías', value: stats.categories, icon: 'bi-tags', color: '#1abc9c', bg: 'rgba(26,188,156,0.1)' },
        { label: 'Movimientos Recientes', value: chartLoading ? '...' : totalMovements, icon: 'bi-arrow-left-right', color: '#34495e', bg: 'rgba(52,73,94,0.1)' },
      ]
    : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Dashboard</h4>
          <p className="text-muted mb-0 small">
            Bienvenido, <strong>{user?.name}</strong>.
            <span className="badge bg-primary ms-2" style={{ fontSize: '0.65rem' }}>
              {roles[0] || 'USER'}
            </span>
          </p>
        </div>
        {hasRole('ADMIN', 'SUPER_ADMIN') && (
          <Link to="/products/new" className="btn btn-primary btn-sm d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            Nuevo Producto
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {statCards.map((card) => (
            <div key={card.label} className="col-6 col-lg-4 col-xl-2">
              <div className="stat-card">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                </div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-bar-chart me-2 text-muted"></i>
                Movimientos por Tipo
              </h6>
              <div className="btn-group btn-group-sm" role="group">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`btn ${range === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setRange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              </div>
            ) : totalMovements === 0 ? (
              <EmptyState compact message="No hay movimientos en este período." />
            ) : (
              <MovementsBarChart counts={movementCounts} />
            )}
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="stat-card">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-clock-history me-2 text-muted"></i>
              Actividad Reciente
            </h6>
            <div className="text-muted small">
              {activities.length === 0 ? (
                <EmptyState compact message="No hay actividad registrada aún." />
              ) : (
                activities.slice(0, 8).map((event) => {
                  const { icon, color } = getActivityIcon(event.type);
                  return (
                    <div key={event._id} className="d-flex align-items-start gap-3 py-2 border-bottom">
                      <i className={`bi ${icon} ${color} mt-1`}></i>
                      <div className="flex-grow-1">
                        <div>{event.action}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {event.user?.name && <>{event.user.name} · </>}{timeAgo(event.createdAt)}
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
                <i className="bi bi-list-ul me-2"></i>Ver Inventario
              </Link>
              {hasRole('ADMIN', 'SUPER_ADMIN') && (
                <Link to="/products/new" className="btn btn-outline-success btn-sm text-start">
                  <i className="bi bi-plus-circle me-2"></i>Registrar Producto
                </Link>
              )}
              {hasRole('MANAGER', 'ADMIN', 'SUPER_ADMIN') && (
                <Link to="/movements" className="btn btn-outline-warning btn-sm text-start">
                  <i className="bi bi-arrow-left-right me-2"></i>Movimientos
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
