/**
 * @fileoverview Página de listado de productos con búsqueda, filtros, orden, paginación y exportación PDF.
 * Búsqueda, filtros, orden y paginación se resuelven en el backend (no carga la colección completa).
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProducts, deleteProduct, exportProductsExcel } from '../services/product.service';
import { getCategories } from '../services/category.service';
import { generateInventoryPDF } from '../services/pdf.service';
import ProductsHeader from '../components/common/ProductsHeader';
import EmptyState from '../components/common/EmptyState';
import ImportProductsPanel from '../components/features/ImportProductsPanel';
import toast, { Toaster } from 'react-hot-toast';

const PAGE_SIZE = 10;
const SERVER_SORTABLE = ['name', 'sku', 'price', 'stock', 'createdAt'];

function getStockBadge(stock, minStock) {
  if (stock === 0) return { className: 'out-of-stock', text: 'Sin stock' };
  if (stock <= minStock) return { className: 'low-stock', text: 'Stock bajo' };
  return { className: 'in-stock', text: 'Disponible' };
}

function getCategoryName(product) {
  if (!product.category) return 'Sin categoría';
  return typeof product.category === 'string' ? product.category : product.category.name;
}

const COLUMNS = [
  { key: 'name', label: 'Producto' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Categoría' },
  { key: 'price', label: 'Precio', align: 'text-end' },
  { key: 'stock', label: 'Stock', align: 'text-center' },
  { key: 'status', label: 'Estado', align: 'text-center' },
  { key: 'createdAt', label: 'Registro' },
];

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      const params = {
        page,
        limit: PAGE_SIZE,
        search,
        category: categoryFilter,
        status: statusFilter === 'Disponible' ? 'available' : statusFilter === 'Stock bajo' ? 'low' : statusFilter === 'Sin stock' ? 'out' : '',
        sort: SERVER_SORTABLE.includes(sortBy) ? sortBy : 'createdAt',
        dir: sortDir,
      };

      try {
        const result = await getProducts(params);
        if (!active) return;
        setProducts((prev) => (page === 1 ? result.items : [...prev, ...result.items]));
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch {
        if (active) toast.error('Error al cargar productos');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => { active = false; };
  }, [page, search, categoryFilter, statusFilter, sortBy, sortDir, reloadToken]);

  async function handleDelete(id, name) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setTotal((prev) => prev - 1);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  }

  function handleSort(key) {
    if (!SERVER_SORTABLE.includes(key)) return;
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir(key === 'createdAt' ? 'desc' : 'asc');
    }
    setProducts([]);
    setPage(1);
  }

  function toggleSelect(id) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleSelectAll() {
    const allIds = products.map((p) => p._id);
    const allSelected = allIds.every((id) => selected.has(id));
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function handleDownloadPDF() {
    const selectedProducts = products.filter((p) => selected.has(p._id));
    if (selectedProducts.length === 0) { toast.error('Selecciona al menos un producto'); return; }
    const pdfData = selectedProducts.map((p) => ({ ...p, category: getCategoryName(p) }));
    generateInventoryPDF(pdfData);
    toast.success(`Reporte generado con ${selectedProducts.length} producto(s)`);
  }

  function handleImported() {
    setShowImportPanel(false);
    setProducts([]);
    if (page === 1) {
      setReloadToken((prev) => prev + 1);
    } else {
      setPage(1);
    }
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      await exportProductsExcel();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  }

  function getSortIcon(key) {
    if (!SERVER_SORTABLE.includes(key)) return 'bi-dash opacity-25';
    if (sortBy !== key) return 'bi-arrow-down-up opacity-25';
    return sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  const hasMore = page < totalPages;
  const allSelected = products.length > 0 && products.every((p) => selected.has(p._id));
  const canDelete = hasRole('ADMIN', 'SUPER_ADMIN');
  const canEdit = hasRole('ADMIN', 'SUPER_ADMIN');

  return (
    <div>
      <Toaster position="top-center" />

      <ProductsHeader
        totalProducts={total}
        selectedCount={selected.size}
        onDownloadPDF={handleDownloadPDF}
        onExportExcel={handleExportExcel}
        onToggleImport={() => setShowImportPanel((prev) => !prev)}
        showNewButton={hasRole('ADMIN', 'SUPER_ADMIN')}
        showImportExport={hasRole('ADMIN', 'SUPER_ADMIN')}
      />

      {exporting && (
        <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
          <span className="spinner-border spinner-border-sm" />Generando archivo Excel...
        </div>
      )}

      {showImportPanel && (
        <ImportProductsPanel onImported={handleImported} onClose={() => setShowImportPanel(false)} />
      )}

      <div className="stat-card mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setProducts([]); setPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setProducts([]); setPage(1); }}
            >
              <option value="">Categoría</option>
              {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setProducts([]); setPage(1); }}
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Stock bajo">Stock bajo</option>
              <option value="Sin stock">Sin stock</option>
            </select>
          </div>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <EmptyState message="No se encontraron productos" />
      ) : (
        <>
          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: 40 }}>
                      <input type="checkbox" className="form-check-input" checked={allSelected} onChange={toggleSelectAll} />
                    </th>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={col.align || ''}
                        style={{ cursor: SERVER_SORTABLE.includes(col.key) ? 'pointer' : 'default', userSelect: 'none' }}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label} <i className={`bi ${getSortIcon(col.key)} ms-1`} style={{ fontSize: '0.7rem' }}></i>
                      </th>
                    ))}
                    {(canDelete || canEdit) && <th className="text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const badge = getStockBadge(product.stock, product.minStock);
                    const isSelected = selected.has(product._id);
                    return (
                      <tr key={product._id} className={isSelected ? 'table-active' : ''}>
                        <td className="text-center">
                          <input type="checkbox" className="form-check-input" checked={isSelected} onChange={() => toggleSelect(product._id)} />
                        </td>
                        <td>
                          <div className="fw-semibold">{product.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}</div>
                        </td>
                        <td><code className="small">{product.sku}</code></td>
                        <td>{getCategoryName(product)}</td>
                        <td className="text-end fw-semibold">${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="text-center">{product.stock}</td>
                        <td className="text-center"><span className={`badge-stock ${badge.className}`}>{badge.text}</span></td>
                        <td className="small text-muted">
                          {new Date(product.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        {(canDelete || canEdit) && (
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              {canEdit && (
                                <Link to={`/products/${product._id}/edit`} className="btn btn-outline-primary btn-sm" title="Editar">
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              )}
                              {canDelete && (
                                <button className="btn btn-outline-danger btn-sm" title="Eliminar" onClick={() => handleDelete(product._id, product.name)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Mostrando {products.length} de {total} productos
              {selected.size > 0 && <> · <strong>{selected.size} seleccionado(s)</strong></>}
            </span>
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
