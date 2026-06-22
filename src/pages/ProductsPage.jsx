/**
 * @fileoverview Página de listado de productos con búsqueda, filtros, ordenamiento por columna,
 * carga progresiva y exportación PDF.
 */

import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '../services/product.service';
import { addActivity } from '../services/activity.service';
import { generateInventoryPDF } from '../services/pdf.service';
import ProductsHeader from '../components/common/ProductsHeader';
import toast, { Toaster } from 'react-hot-toast';

/** Cantidad de productos que se muestran por cada carga */
const PAGE_SIZE = 10;

/**
 * Determina la clase CSS del badge según el nivel de stock.
 * @param {number} stock - Cantidad actual en stock.
 * @param {number} minStock - Cantidad mínima requerida.
 * @returns {Object} Objeto con clase CSS, texto y orden numérico del badge.
 */
function getStockBadge(stock, minStock) {
  if (stock === 0) return { className: 'out-of-stock', text: 'Sin stock', order: 0 };
  if (stock <= minStock) return { className: 'low-stock', text: 'Stock bajo', order: 1 };
  return { className: 'in-stock', text: 'Disponible', order: 2 };
}

/**
 * Ordena un array de productos según columna y dirección.
 * @param {Array} items - Productos a ordenar.
 * @param {string} key - Columna de ordenamiento.
 * @param {string} dir - Dirección: 'asc' o 'desc'.
 * @returns {Array} Productos ordenados.
 */
function sortProducts(items, key, dir) {
  const m = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (key) {
      case 'name':
        return m * a.name.localeCompare(b.name, 'es');
      case 'sku':
        return m * a.sku.localeCompare(b.sku, 'es');
      case 'category':
        return m * a.category.localeCompare(b.category, 'es');
      case 'price':
        return m * (a.price - b.price);
      case 'stock':
        return m * (a.stock - b.stock);
      case 'status':
        return m * (getStockBadge(a.stock, a.minStock).order - getStockBadge(b.stock, b.minStock).order);
      case 'createdAt':
        return m * (new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return 0;
    }
  });
}

/** Columnas disponibles para ordenamiento */
const COLUMNS = [
  { key: 'name', label: 'Producto' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Categoría' },
  { key: 'price', label: 'Precio', align: 'text-end' },
  { key: 'stock', label: 'Stock', align: 'text-center' },
  { key: 'status', label: 'Estado', align: 'text-center' },
  { key: 'createdAt', label: 'Registro' },
];

/**
 * Tabla de productos con búsqueda, filtros, ordenamiento, eliminación, carga progresiva y exportación PDF.
 * @returns {JSX.Element}
 */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(new Set());
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Elimina un producto después de confirmación.
   * @param {string} id - ID del producto a eliminar.
   * @param {string} name - Nombre del producto (para confirmación).
   */
  async function handleDelete(id, name) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      addActivity(`Producto eliminado: ${name}`, 'delete');
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  }

  /**
   * Cambia la columna de ordenamiento. Si ya está activa, invierte la dirección.
   * @param {string} key - Clave de la columna.
   */
  function handleSort(key) {
    if (sortBy === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir(key === 'createdAt' ? 'desc' : 'asc');
    }
  }

  /**
   * Alterna la selección de un producto individual.
   * @param {string} id
   */
  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  /** Selecciona o deselecciona todos los productos filtrados */
  function toggleSelectAll() {
    const allFilteredIds = filtered.map((p) => p.id);
    const allSelected = allFilteredIds.every((id) => selected.has(id));
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allFilteredIds));
    }
  }

  /** Genera y descarga el PDF con los productos seleccionados */
  function handleDownloadPDF() {
    const selectedProducts = filtered.filter((p) => selected.has(p.id));
    if (selectedProducts.length === 0) {
      toast.error('Selecciona al menos un producto para generar el reporte');
      return;
    }
    generateInventoryPDF(selectedProducts);
    addActivity(`Reporte PDF descargado (${selectedProducts.length} productos)`, 'info');
    toast.success(`Reporte generado con ${selectedProducts.length} producto(s)`);
  }

  /** Retorna el ícono de dirección de ordenamiento para una columna */
  function getSortIcon(key) {
    if (sortBy !== key) return 'bi-arrow-down-up opacity-25';
    return sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  /** Categorías únicas */
  const categories = [...new Set(products.map((p) => p.category))];

  /** Productos filtrados por búsqueda, categoría y estado, luego ordenados */
  const filtered = sortProducts(
    products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchStatus = !statusFilter || getStockBadge(p.stock, p.minStock).text === statusFilter;
      const productDate = new Date(p.createdAt);
      const matchDateFrom = !dateFrom || productDate >= new Date(dateFrom + 'T00:00:00');
      const matchDateTo = !dateTo || productDate <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchCategory && matchStatus && matchDateFrom && matchDateTo;
    }),
    sortBy,
    sortDir
  );

  /** Subconjunto visible */
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  /** Reinicia paginación cuando cambian filtros */
  const handleSearchChange = (e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); };
  const handleCategoryChange = (e) => { setCategoryFilter(e.target.value); setVisibleCount(PAGE_SIZE); };
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setVisibleCount(PAGE_SIZE); };
  const handleDateFromChange = (e) => { setDateFrom(e.target.value); setVisibleCount(PAGE_SIZE); };
  const handleDateToChange = (e) => { setDateTo(e.target.value); setVisibleCount(PAGE_SIZE); };
  const clearDateFilter = () => { setDateFrom(''); setDateTo(''); setVisibleCount(PAGE_SIZE); };

  return (
    <div>
      
      <Toaster position="top-center" />

      <ProductsHeader
        totalProducts={products.length}
        selectedCount={selected.size}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Barra de búsqueda y filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="col-md-2">
          <select
            className="form-select form-select-sm"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="">Categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Stock bajo">Stock bajo</option>
            <option value="Sin stock">Sin stock</option>
          </select>
        </div>
      </div>

      {/* Filtro por rango de fechas */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white small">Desde</span>
            <input
              type="date"
              className="form-control"
              value={dateFrom}
              onChange={handleDateFromChange}
            />
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white small">Hasta</span>
            <input
              type="date"
              className="form-control"
              value={dateTo}
              onChange={handleDateToChange}
            />
          </div>
        </div>
        {(dateFrom || dateTo) && (
          <div className="col-auto">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={clearDateFilter}
            >
              <i className="bi bi-x-lg me-1"></i>
              Limpiar fechas
            </button>
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando productos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted mt-2">No se encontraron productos</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        title="Seleccionar todos"
                      />
                    </th>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={col.align || ''}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                        <i className={`bi ${getSortIcon(col.key)} ms-1`} style={{ fontSize: '0.7rem' }}></i>
                      </th>
                    ))}
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((product) => {
                    const badge = getStockBadge(product.stock, product.minStock);
                    const isSelected = selected.has(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={isSelected ? 'table-active' : ''}
                      >
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                          />
                        </td>
                        <td>
                          <div className="fw-semibold">{product.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {product.description?.substring(0, 50)}...
                          </div>
                        </td>
                        <td>
                          <code className="small">{product.sku}</code>
                        </td>
                        <td>{product.category}</td>
                        <td className="text-end fw-semibold">
                          ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-center">{product.stock}</td>
                        <td className="text-center">
                          <span className={`badge-stock ${badge.className}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {new Date(product.createdAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          <br />
                          {new Date(product.createdAt).toLocaleTimeString('es-MX', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </td>
                        <td className="text-center">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-danger"
                              title="Eliminar"
                              onClick={() => handleDelete(product.id, product.name)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Indicador de productos mostrados y botón de cargar más */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Mostrando {visible.length} de {filtered.length} productos
              {selected.size > 0 && (
                <> · <strong>{selected.size} seleccionado(s)</strong></>
              )}
            </span>
            {hasMore && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                <i className="bi bi-arrow-down-circle me-1"></i>
                Cargar más ({Math.min(PAGE_SIZE, filtered.length - visibleCount)} restantes)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
