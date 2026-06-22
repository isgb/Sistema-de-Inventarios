/**
 * @fileoverview Página de creación de nuevo producto.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/product.service';
import { addActivity } from '../services/activity.service';
import toast, { Toaster } from 'react-hot-toast';

/** Categorías disponibles para los productos */
const CATEGORIES = [
  'Electrónica',
  'Periféricos',
  'Mobiliario',
  'Accesorios',
  'Almacenamiento',
  'Software',
  'Redes',
  'Otros',
];

/** Estado inicial del formulario */
const INITIAL_FORM = {
  name: '',
  sku: '',
  category: '',
  price: '',
  stock: '',
  minStock: '',
  description: '',
};

/**
 * Formulario para registrar un nuevo producto en el inventario.
 * @returns {JSX.Element}
 */
export default function CreateProductPage() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  /** @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} e */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** @param {React.FormEvent} e */
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
      await createProduct(data);
      addActivity(`Nuevo producto registrado: ${data.name}`, 'create');
      toast.success('Producto creado exitosamente');
      setTimeout(() => navigate('/products'), 800);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Toaster position="top-center" />

      <div className="mb-4">
        <h4 className="fw-bold mb-1">Nuevo Producto</h4>
        <p className="text-muted mb-0 small">Registra un nuevo producto en el inventario</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="stat-card">
            <form onSubmit={handleSubmit}>
              {/* Información básica */}
              <h6 className="fw-bold mb-3 text-muted">
                <i className="bi bi-info-circle me-2"></i>
                Información Básica
              </h6>

              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <label className="form-label small fw-semibold">
                    Nombre del producto <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-sm"
                    placeholder="Ej: Laptop Dell Inspiron 15"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    SKU <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    className="form-control form-control-sm"
                    placeholder="Ej: LAP-DELL-001"
                    value={form.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    name="category"
                    className="form-select form-select-sm"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    Precio <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Stock */}
              <h6 className="fw-bold mb-3 text-muted">
                <i className="bi bi-layers me-2"></i>
                Inventario
              </h6>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Stock inicial</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-control form-control-sm"
                    placeholder="0"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Stock mínimo</label>
                  <input
                    type="number"
                    name="minStock"
                    className="form-control form-control-sm"
                    placeholder="0"
                    min="0"
                    value={form.minStock}
                    onChange={handleChange}
                  />
                  <div className="form-text" style={{ fontSize: '0.7rem' }}>
                    Alerta cuando el stock baje de este valor
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="form-label small fw-semibold">Descripción</label>
                <textarea
                  name="description"
                  className="form-control form-control-sm"
                  rows="3"
                  placeholder="Descripción breve del producto..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Acciones */}
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Guardar Producto
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/products')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel de ayuda lateral */}
        <div className="col-lg-4">
          <div className="stat-card">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-lightbulb me-2 text-warning"></i>
              Guía
            </h6>
            <div className="small text-muted">
              <p><strong>SKU:</strong> Código único de identificación del producto. Formato sugerido: CAT-MAR-###</p>
              <p><strong>Stock mínimo:</strong> Cuando el inventario baje de esta cantidad, se mostrará una alerta.</p>
              <p className="mb-0"><strong>Categoría:</strong> Agrupa productos para facilitar búsquedas y reportes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
