/**
 * @fileoverview Página de creación y edición de producto.
 * Si la ruta trae :id (/products/:id/edit) carga el producto existente
 * y reutiliza el mismo formulario para actualizarlo vía PUT.
 * Carga categorías del backend (ObjectId) en vez de usar un array hardcodeado.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../services/product.service';
import { getCategories } from '../services/category.service';
import toast, { Toaster } from 'react-hot-toast';

const INITIAL_FORM = { name: '', sku: '', category: '', price: '', stock: '', minStock: '', description: '' };

export default function CreateProductPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error('Error al cargar categorías'));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    getProductById(id)
      .then((product) => {
        setForm({
          name: product.name,
          sku: product.sku,
          category: product.category?._id || product.category || '',
          price: product.price,
          stock: product.stock,
          minStock: product.minStock,
          description: product.description || '',
        });
      })
      .catch(() => toast.error('No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.category || !form.price) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        minStock: parseInt(form.minStock, 10) || 0,
      };

      if (isEditMode) {
        await updateProduct(id, data);
        toast.success('Producto actualizado exitosamente');
      } else {
        await createProduct(data);
        toast.success('Producto creado exitosamente');
      }
      setTimeout(() => navigate('/products'), 800);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2 small">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-center" />
      <div className="mb-4">
        <h4 className="fw-bold mb-1">{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</h4>
        <p className="text-muted mb-0 small">
          {isEditMode ? 'Actualiza la información del producto' : 'Registra un nuevo producto en el inventario'}
        </p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="stat-card">
            <form onSubmit={handleSubmit}>
              <h6 className="fw-bold mb-3 text-muted"><i className="bi bi-info-circle me-2"></i>Información Básica</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">Nombre del producto <span className="text-danger">*</span></label>
                  <input type="text" name="name" className="form-control form-control-sm" placeholder="Ej: Laptop Dell Inspiron 15" value={form.name} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">SKU <span className="text-danger">*</span></label>
                  <input type="text" name="sku" className="form-control form-control-sm" placeholder="Ej: LAP-DELL-001" value={form.sku} onChange={handleChange} />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Categoría <span className="text-danger">*</span></label>
                  <select name="category" className="form-select form-select-sm" value={form.category} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Precio <span className="text-danger">*</span></label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">$</span>
                    <input type="number" name="price" className="form-control" placeholder="0.00" step="0.01" min="0" value={form.price} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mb-3 text-muted"><i className="bi bi-layers me-2"></i>Inventario</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Stock {isEditMode ? '' : 'inicial'}</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control form-control-sm"
                    placeholder="0"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    disabled={isEditMode}
                    title={isEditMode ? 'El stock se ajusta desde Movimientos de Inventario' : ''}
                  />
                  {isEditMode && (
                    <div className="form-text" style={{ fontSize: '0.7rem' }}>
                      Para cambiar el stock usa la sección de Movimientos.
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Stock mínimo</label>
                  <input type="number" name="minStock" className="form-control form-control-sm" placeholder="0" min="0" value={form.minStock} onChange={handleChange} />
                  <div className="form-text" style={{ fontSize: '0.7rem' }}>Alerta cuando el stock baje de este valor</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Descripción</label>
                <textarea name="description" className="form-control form-control-sm" rows="3" placeholder="Descripción breve del producto..." value={form.description} onChange={handleChange} />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                    : <><i className="bi bi-check-lg me-1"></i>{isEditMode ? 'Guardar Cambios' : 'Guardar Producto'}</>}
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/products')}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="stat-card">
            <h6 className="fw-bold mb-3"><i className="bi bi-lightbulb me-2 text-warning"></i>Guía</h6>
            <div className="small text-muted">
              <p><strong>SKU:</strong> Código único de identificación. Formato sugerido: CAT-MAR-###</p>
              <p><strong>Stock mínimo:</strong> Cuando el inventario baje de esta cantidad, se mostrará una alerta.</p>
              <p className="mb-0"><strong>Categoría:</strong> Agrupa productos para facilitar búsquedas y reportes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
