/**
 * @fileoverview Página de movimientos de inventario.
 * Lista movimientos con filtros (producto, tipo, rango de fechas) y paginación server-side,
 * y permite crear entradas, salidas y ajustes de stock.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMovements, createMovement } from '../services/movement.service';
import { getProducts } from '../services/product.service';
import EmptyState from '../components/common/EmptyState';
import toast, { Toaster } from 'react-hot-toast';

const PAGE_SIZE = 15;

const MOVEMENT_TYPES = [
  { value: 'IN', label: 'Entrada', icon: 'bi-arrow-down-circle', color: 'text-success' },
  { value: 'OUT', label: 'Salida', icon: 'bi-arrow-up-circle', color: 'text-danger' },
  { value: 'ADJUSTMENT', label: 'Ajuste', icon: 'bi-sliders', color: 'text-warning' },
];

const INITIAL_FORM = { product: '', type: 'IN', quantity: '', reason: '' };
const INITIAL_FILTERS = { product: '', type: '', startDate: '', endDate: '' };

export default function MovementsPage() {
  const { hasRole } = useAuth();
  const [movements, setMovements] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS });

  useEffect(() => {
    getProducts({ limit: 200 })
      .then((result) => setProducts(result.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMovements() {
      setLoading(true);
      try {
        const result = await getMovements({ page, limit: PAGE_SIZE, ...filters });
        if (!active) return;
        setMovements((prev) => (page === 1 ? result.items : [...prev, ...result.items]));
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (active) toast.error(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMovements();
    return () => { active = false; };
  }, [page, filters]);

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMovements([]);
    setPage(1);
  }

  function clearFilters() {
    setFilters({ ...INITIAL_FILTERS });
    setMovements([]);
    setPage(1);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.quantity) {
      toast.error('Selecciona un producto y cantidad');
      return;
    }

    setSubmitting(true);
    try {
      await createMovement({
        product: form.product,
        type: form.type,
        quantity: parseInt(form.quantity, 10),
        reason: form.reason,
      });
      toast.success('Movimiento registrado');
      setForm({ ...INITIAL_FORM });
      setShowForm(false);
      setMovements([]);
      setPage(1);

      const updatedProducts = await getProducts({ limit: 200 });
      setProducts(updatedProducts.items);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  function getTypeInfo(type) {
    return MOVEMENT_TYPES.find((t) => t.value === type) || MOVEMENT_TYPES[0];
  }

  const canCreate = hasRole('MANAGER', 'ADMIN', 'SUPER_ADMIN');
  const hasMore = page < totalPages;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <Toaster position="top-center" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Movimientos de Inventario</h4>
          <p className="text-muted mb-0 small">{total} movimientos registrados</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
            {showForm ? 'Cancelar' : 'Nuevo Movimiento'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="stat-card mb-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-arrow-left-right me-2"></i>Registrar Movimiento</h6>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Producto</label>
                <select name="product" className="form-select form-select-sm" value={form.product} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.stock} uds)</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold">Tipo</label>
                <select name="type" className="form-select form-select-sm" value={form.type} onChange={handleChange}>
                  {MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold">Cantidad</label>
                <input type="number" name="quantity" className="form-control form-control-sm" min="1" value={form.quantity} onChange={handleChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Razón (opcional)</label>
                <input type="text" name="reason" className="form-control form-control-sm" placeholder="Motivo del movimiento" value={form.reason} onChange={handleChange} />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-success btn-sm w-100" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="stat-card mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Producto</label>
            <select name="product" className="form-select form-select-sm" value={filters.product} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Tipo</label>
            <select name="type" className="form-select form-select-sm" value={filters.type} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Desde</label>
            <input type="date" name="startDate" className="form-control form-control-sm" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Hasta</label>
            <input type="date" name="endDate" className="form-control form-control-sm" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="col-md-3">
            {hasActiveFilters && (
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                <i className="bi bi-x-lg me-1"></i>Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && movements.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando movimientos...</p>
        </div>
      ) : movements.length === 0 ? (
        <EmptyState icon="bi-arrow-left-right" message="No hay movimientos registrados" />
      ) : (
        <>
          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center">Stock anterior</th>
                    <th className="text-center">Stock nuevo</th>
                    <th>Razón</th>
                    <th>Registrado por</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => {
                    const typeInfo = getTypeInfo(movement.type);
                    return (
                      <tr key={movement._id}>
                        <td>
                          <span className={typeInfo.color}>
                            <i className={`bi ${typeInfo.icon} me-1`}></i>{typeInfo.label}
                          </span>
                        </td>
                        <td className="fw-semibold">{movement.product?.name || 'Eliminado'}</td>
                        <td className="text-center fw-semibold">{movement.quantity}</td>
                        <td className="text-center text-muted">{movement.previousStock}</td>
                        <td className="text-center text-muted">{movement.newStock}</td>
                        <td className="text-muted small">{movement.reason || '—'}</td>
                        <td className="small">{movement.createdBy?.name || '—'}</td>
                        <td className="small text-muted">
                          {new Date(movement.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">Mostrando {movements.length} de {total} movimientos</span>
            {hasMore && (
              <button className="btn btn-outline-primary btn-sm" disabled={loading} onClick={() => setPage((prev) => prev + 1)}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-arrow-down-circle me-1"></i>}
                Cargar más
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
