/**
 * @fileoverview Página de listado de productos con búsqueda y filtros.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/product.service';
import { addActivity } from '../services/activity.service';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Determina la clase CSS del badge según el nivel de stock.
 * @param {number} stock - Cantidad actual en stock.
 * @param {number} minStock - Cantidad mínima requerida.
 * @returns {Object} Objeto con clase CSS y texto del badge.
 */
function getStockBadge(stock, minStock) {
  if (stock === 0) return { className: 'out-of-stock', text: 'Sin stock' };
  if (stock <= minStock) return { className: 'low-stock', text: 'Stock bajo' };
  return { className: 'in-stock', text: 'Disponible' };
}

/**
 * Tabla de productos con búsqueda, filtros por categoría y eliminación.
 * @returns {JSX.Element}
 */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  /** Carga la lista de productos desde el servicio. */
  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }

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
      addActivity(`Producto eliminado: ${name}`, 'delete');
      toast.success('Producto eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  }

  /** Categorías únicas extraídas de los productos cargados */
  const categories = [...new Set(products.map((p) => p.category))];

  /** Productos filtrados por búsqueda y categoría */
  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <Toaster position="top-center" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Productos</h4>
          <p className="text-muted mb-0 small">{products.length} productos registrados</p>
        </div>
        <Link to="/products/new" className="btn btn-primary btn-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          Nuevo Producto
        </Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select form-select-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
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
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th className="text-end">Precio</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const badge = getStockBadge(product.stock, product.minStock);
                  return (
                    <tr key={product.id}>
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
      )}
    </div>
  );
}
