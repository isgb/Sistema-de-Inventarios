/**
 * @fileoverview Página de gestión de categorías.
 * Lista categorías, permite crear nuevas, renombrarlas y activar/desactivarlas (ADMIN+).
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCategories, createCategory, updateCategory } from '../services/category.service';
import EmptyState from '../components/common/EmptyState';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoriesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories(canManage);
      setCategories(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error('El nombre es obligatorio'); return; }

    setSubmitting(true);
    try {
      await createCategory({ name: newName.trim() });
      toast.success('Categoría creada');
      setNewName('');
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  function startEditing(category) {
    setEditingId(category._id);
    setEditName(category.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName('');
  }

  async function saveEditing(id) {
    if (!editName.trim()) { toast.error('El nombre es obligatorio'); return; }

    setSavingId(id);
    try {
      await updateCategory(id, { name: editName.trim() });
      toast.success('Categoría actualizada');
      cancelEditing();
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(category) {
    setSavingId(category._id);
    try {
      await updateCategory(category._id, { active: !category.active });
      toast.success(category.active ? 'Categoría desactivada' : 'Categoría activada');
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingId(null);
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Toaster position="top-center" />

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">Categorías</h4>
          <p className="text-muted mb-0 small">{categories.length} categorías {canManage ? 'registradas' : 'activas'}</p>
        </div>
      </div>

      <div className="stat-card mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {canManage && (
        <div className="stat-card mb-4">
          <h6 className="fw-bold mb-3"><i className="bi bi-tag me-2"></i>Nueva Categoría</h6>
          <form onSubmit={handleSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nombre de la nueva categoría..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Creando...' : <><i className="bi bi-plus-lg me-1"></i>Crear</>}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-2 small">Cargando categorías...</p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon="bi-tags" message="No hay categorías registradas" />
      ) : filteredCategories.length === 0 ? (
        <EmptyState icon="bi-search" message="No se encontraron categorías" />
      ) : (
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  {canManage && <th className="text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const isEditing = editingId === category._id;
                  const isSaving = savingId === category._id;
                  return (
                    <tr key={category._id} className={isEditing ? 'table-warning' : ''}>
                      <td className="fw-semibold">
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ maxWidth: 280 }}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={isSaving}
                            autoFocus
                          />
                        ) : (
                          <><i className="bi bi-tag text-primary me-2"></i>{category.name}</>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${category.active ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                          {category.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="text-center">
                          {isEditing ? (
                            <div className="d-flex gap-1 justify-content-center">
                              <button className="btn btn-success btn-sm" title="Guardar" disabled={isSaving} onClick={() => saveEditing(category._id)}>
                                {isSaving ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check-lg"></i>}
                              </button>
                              <button className="btn btn-outline-secondary btn-sm" title="Cancelar" disabled={isSaving} onClick={cancelEditing}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex gap-1 justify-content-center">
                              <button className="btn btn-outline-warning btn-sm" title="Renombrar" onClick={() => startEditing(category)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className={`btn btn-sm ${category.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                title={category.active ? 'Desactivar' : 'Activar'}
                                disabled={isSaving}
                                onClick={() => toggleActive(category)}
                              >
                                <i className={`bi ${category.active ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </button>
                            </div>
                          )}
                        </td>
                      )}
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
